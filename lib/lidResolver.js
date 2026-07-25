const fs = require('fs');
const path = require('path');

const _sessionDir = path.join(__dirname, '..', 'public');

function _cleanNum(str) {
    return String(str || '').split('@')[0].split(':')[0].replace(/\D/g, '');
}

function _resolveFromSessionFile(lidNum) {
    try {
        const revFile = path.join(_sessionDir, `lid-mapping-${lidNum}_reverse.json`);
        if (fs.existsSync(revFile)) {
            const raw = fs.readFileSync(revFile, 'utf-8');
            const jid = JSON.parse(raw);
            if (jid) {
                const n = _cleanNum(jid);
                if (n && n.length >= 7 && n !== lidNum) {
                    if (globalThis.lidPhoneCache) globalThis.lidPhoneCache.set(lidNum, n);
                    return n + '@s.whatsapp.net';
                }
            }
        }
    } catch (e) {}
    return null;
}

function getParticipantPhone(p) {
    const phoneNumber = p.phoneNumber || p.phone_number || p.pn || '';
    if (phoneNumber) {
        const num = _cleanNum(phoneNumber);
        if (num) return num;
    }

    const base = p.id || p.jid || '';
    if (base && !base.endsWith('@lid') && base.includes('@')) {
        const num = _cleanNum(base);
        if (num) return num;
    }

    const lid = p.lid || '';
    if (lid && !lid.endsWith('@lid') && lid.includes('@')) {
        const num = _cleanNum(lid);
        if (num) return num;
    }

    return null;
}

function getParticipantLidNum(p) {
    const base = p.id || p.jid || '';
    if (base && base.endsWith('@lid')) {
        return _cleanNum(base) || null;
    }

    const lid = p.lid || '';
    if (lid && lid.endsWith('@lid')) {
        return _cleanNum(lid) || null;
    }

    return null;
}

function resolveJidFromLid(lidJid, participants) {
    if (!lidJid) return null;
    const lidNum = _cleanNum(lidJid);
    if (!lidNum) return null;

    if (globalThis.lidPhoneCache) {
        const cached = globalThis.lidPhoneCache.get(lidNum);
        if (cached) return _cleanNum(cached) + '@s.whatsapp.net';
    }

    const fromFile = _resolveFromSessionFile(lidNum);
    if (fromFile) return fromFile;

    if (globalThis.resolvePhoneFromLid) {
        const phone = globalThis.resolvePhoneFromLid(lidJid);
        if (phone && typeof phone === 'string' && !phone.endsWith('@lid')) {
            const num = _cleanNum(phone);
            if (num) return num + '@s.whatsapp.net';
        }
    }

    if (participants && participants.length > 0) {
        for (const p of participants) {
            const pLidNum = getParticipantLidNum(p);
            if (pLidNum && pLidNum === lidNum) {
                const phone = getParticipantPhone(p);
                if (phone) return phone + '@s.whatsapp.net';
            }
        }
    }

    return null;
}

function resolveTargetJid(rawJid, participants) {
    if (!rawJid) return null;
    const domain = (rawJid.split('@')[1] || '').toLowerCase();
    const num = _cleanNum(rawJid);
    if (!num) return null;

    if (domain === 'lid') {
        const resolved = resolveJidFromLid(rawJid, participants);
        if (resolved) return resolved;
        return null;
    }

    if (participants && participants.length > 0) {
        const match = participants.find((p) => {
            const phone = getParticipantPhone(p);
            if (phone && (phone === num || phone.endsWith(num) || num.endsWith(phone))) return true;
            const base = p.id || p.jid || '';
            if (base && !base.endsWith('@lid')) {
                const pNum = _cleanNum(base);
                if (pNum && (pNum === num || pNum.endsWith(num) || num.endsWith(pNum))) return true;
            }
            return false;
        });
        if (match) {
            const phone = getParticipantPhone(match);
            if (phone) return phone + '@s.whatsapp.net';
        }
    }

    return num + '@s.whatsapp.net';
}

function resolvePhoneNumber(rawJid, participants) {
    if (!rawJid) return '';
    const domain = (rawJid.split('@')[1] || '').toLowerCase();
    const num = _cleanNum(rawJid);

    if (domain === 'lid') {
        const resolved = resolveJidFromLid(rawJid, participants);
        if (resolved) return _cleanNum(resolved);
        return num;
    }

    return num;
}

/**
 * Pull the "alternate" (phone-number) JID off a message key, regardless of
 * which Baileys fork produced it.
 *   - Toxic-style (xhclintohn/Baileys):  key.participantAlt / key.remoteJidAlt
 *   - BMB-style   (bmbxmd-baileys):      key.participant_pn / key.participant_lid
 */
function getAltFromKey(msgKey) {
    if (!msgKey) return null;

    // Toxic-style fields first
    const toxicAlt = msgKey.participantAlt || msgKey.remoteJidAlt;
    if (toxicAlt && String(toxicAlt).endsWith('@s.whatsapp.net')) {
        return toxicAlt;
    }

    // BMB-style fields: participant_pn holds the phone-number JID when the
    // primary participant field is a @lid address.
    if (msgKey.participant_pn && String(msgKey.participant_pn).endsWith('@s.whatsapp.net')) {
        return msgKey.participant_pn;
    }
    if (msgKey.remoteJid_pn && String(msgKey.remoteJid_pn).endsWith('@s.whatsapp.net')) {
        return msgKey.remoteJid_pn;
    }

    return null;
}

async function resolveSenderJid(rawJid, chatJid, client, msgKey = null) {
    if (!rawJid) return rawJid;
    if (!rawJid.endsWith('@lid')) return rawJid;

    const lidNum = _cleanNum(rawJid);

    // Fast path: trust whichever Baileys fork already resolved PN/LID
    // pairing directly on the message key.
    const alt = getAltFromKey(msgKey);
    if (alt) {
        const num = _cleanNum(alt);
        if (num && num !== lidNum) {
            if (globalThis.lidPhoneCache) globalThis.lidPhoneCache.set(lidNum, num);
            return num + '@s.whatsapp.net';
        }
    }

    if (globalThis.lidPhoneCache) {
        const cached = globalThis.lidPhoneCache.get(lidNum);
        if (cached) {
            const num = _cleanNum(cached);
            if (num && num !== lidNum) return num + '@s.whatsapp.net';
        }
    }

    const fromFile = _resolveFromSessionFile(lidNum);
    if (fromFile) return fromFile;

    if (globalThis.resolvePhoneFromLid) {
        const phone = globalThis.resolvePhoneFromLid(rawJid);
        if (phone && typeof phone === 'string') {
            const num = _cleanNum(phone);
            if (num && num !== lidNum) {
                if (globalThis.lidPhoneCache) globalThis.lidPhoneCache.set(lidNum, num);
                return num + '@s.whatsapp.net';
            }
        }
    }

    if (chatJid && client) {
        try {
            const meta = await client.groupMetadata(chatJid);
            for (const p of meta.participants || []) {
                const pLidRaw = p.lid || p.id || p.jid || '';
                const pLid = _cleanNum(pLidRaw);
                if (pLid !== lidNum) continue;
                const pBase = p.id || p.jid || '';
                if (pBase && !pBase.endsWith('@lid')) {
                    const phone = _cleanNum(pBase);
                    if (phone) {
                        if (globalThis.lidPhoneCache) globalThis.lidPhoneCache.set(lidNum, phone);
                        return phone + '@s.whatsapp.net';
                    }
                }
                if (p.phoneNumber) {
                    const phone = _cleanNum(p.phoneNumber);
                    if (phone) {
                        if (globalThis.lidPhoneCache) globalThis.lidPhoneCache.set(lidNum, phone);
                        return phone + '@s.whatsapp.net';
                    }
                }
            }
        } catch (e) {}
    }

    if (globalThis.resolvePhoneFromLidAsync) {
        try {
            const phone = await globalThis.resolvePhoneFromLidAsync(rawJid);
            if (phone && typeof phone === 'string') {
                const num = _cleanNum(phone);
                if (num && num !== lidNum) return num + '@s.whatsapp.net';
            }
        } catch (e) {}
    }

    return rawJid;
}

module.exports = {
    resolveJidFromLid,
    resolveTargetJid,
    resolvePhoneNumber,
    resolveSenderJid,
    getAltFromKey,
    getParticipantPhone,
    getParticipantLidNum
};
