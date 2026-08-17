"use strict";
/**
 * antilien.js
 *
 * Now backed by the unified database/db.js (group_settings.antilink /
 * antilink_action columns) instead of its own separate asset/antilien.json
 * file. Function names/signatures are unchanged so index.js and
 * plugins/Group/groupe.js's antilink command keep working without
 * modification.
 */
const db = require('../database/db');

/**
 * @param {string} jid
 * @param {'oui'|'non'} etat - kept for backward compatibility with the
 *   old JSON version's values ('oui' = on, 'non' = off)
 */
async function ajouterOuMettreAJourJid(jid, etat) {
  await db.updateGroupSetting(jid, 'antilink', etat === 'oui' ? 'on' : 'off');
}

async function mettreAJourAction(jid, action) {
  await db.updateGroupSetting(jid, 'antilink_action', action || 'delete');
}

async function verifierEtatJid(jid) {
  const settings = await db.getGroupSettings(jid);
  return settings.antilink === 'on';
}

async function recupererActionJid(jid) {
  const settings = await db.getGroupSettings(jid);
  return settings.antilink_action || 'delete';
}

module.exports = {
  ajouterOuMettreAJourJid,
  mettreAJourAction,
  verifierEtatJid,
  recupererActionJid,
};
