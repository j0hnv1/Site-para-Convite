/**
 * CONVITE LINDA 21 — servidor das confirmações (Google Apps Script)
 * ------------------------------------------------------------------
 * Guarda as confirmações numa planilha do Google e entrega a lista ao
 * painel do convite SOMENTE para quem souber usuário e senha.
 * Passo a passo de instalação: backend/LEIA-ME.md
 */

// ► TROQUE se quiser (o convite NÃO guarda estes dados: a conferência é feita aqui).
var ADMIN_USER = 'linda123@';
var ADMIN_PASS = 'linda123@';

var SHEET_NAME = 'Confirmacoes';
var MAX_GUESTS = 10;
var HEADERS = ['chave', 'nome', 'acompanhantes', 'nomes_acompanhantes', 'total_pessoas', 'atualizado_em'];

function doGet() {
  return respond_({ ok: true, service: 'convite-linda-21', version: 4, actions: ['rsvp', 'list', 'delete'] });
}

function doPost(e) {
  var data;
  try {
    data = JSON.parse(e.postData.contents);
  } catch (err) {
    return respond_({ ok: false, error: 'bad_request' });
  }
  if (!data || typeof data !== 'object') return respond_({ ok: false, error: 'bad_request' });
  if (data.action === 'rsvp') return saveRsvp_(data);
  if (data.action === 'list') return listRsvps_(data);
  if (data.action === 'delete') return deleteRsvp_(data);
  return respond_({ ok: false, error: 'unknown_action' });
}

/** Grava (ou atualiza) a confirmação. A mesma pessoa confirmando de novo substitui a anterior. */
function saveRsvp_(data) {
  var name = clean_(data.name, 100);
  if (!name) return respond_({ ok: false, error: 'name_required' });

  var guests = Math.round(Number(data.guests));
  if (!isFinite(guests) || guests < 0) guests = 0;
  if (guests > MAX_GUESTS) guests = MAX_GUESTS;

  var guestNames = guests > 0 ? clean_(data.guestNames, 800) : '';
  if (guests > 0 && !guestNames) return respond_({ ok: false, error: 'guest_names_required' });

  var key = keyOf_(name);
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
  } catch (err) {
    return respond_({ ok: false, error: 'busy' });
  }
  try {
    var sh = sheet_();
    var last = sh.getLastRow();
    var row = 0;
    if (last > 1) {
      var keys = sh.getRange(2, 1, last - 1, 1).getValues();
      for (var i = 0; i < keys.length; i++) {
        if (String(keys[i][0]) === key) {
          row = i + 2;
          break;
        }
      }
    }
    var values = [key, safe_(name), guests, safe_(guestNames), 1 + guests, new Date().toISOString()];
    if (row) sh.getRange(row, 1, 1, 6).setValues([values]);
    else sh.appendRow(values);
  } finally {
    lock.releaseLock();
  }
  return respond_({ ok: true });
}

/** Lista as confirmações (exige usuário e senha). */
function listRsvps_(data) {
  if (!isAdmin_(data)) {
    Utilities.sleep(800); // dificulta tentativas em sequência
    return respond_({ ok: false, error: 'auth' });
  }
  var sh = sheet_();
  var last = sh.getLastRow();
  var rows = [];
  if (last > 1) {
    var vals = sh.getRange(2, 1, last - 1, 6).getValues();
    for (var i = 0; i < vals.length; i++) {
      var r = vals[i];
      rows.push({
        name: String(r[1]).trim(),
        guests: Number(r[2]) || 0,
        guestNames: String(r[3]).trim(),
        total: Number(r[4]) || 1,
        updatedAt: String(r[5]),
      });
    }
  }
  return respond_({ ok: true, rows: rows });
}

/** Remove a confirmação de uma pessoa (exige usuário e senha). */
function deleteRsvp_(data) {
  if (!isAdmin_(data)) {
    Utilities.sleep(800);
    return respond_({ ok: false, error: 'auth' });
  }
  var key = keyOf_(clean_(data.name, 100));
  if (!key) return respond_({ ok: false, error: 'name_required' });
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
  } catch (err) {
    return respond_({ ok: false, error: 'busy' });
  }
  var deleted = false;
  try {
    var sh = sheet_();
    var last = sh.getLastRow();
    if (last > 1) {
      var keys = sh.getRange(2, 1, last - 1, 1).getValues();
      for (var i = keys.length - 1; i >= 0; i--) {
        if (String(keys[i][0]) === key) {
          sh.deleteRow(i + 2);
          deleted = true;
        }
      }
    }
  } finally {
    lock.releaseLock();
  }
  return respond_({ ok: true, deleted: deleted });
}

// ----- utilidades -----
function isAdmin_(data) {
  return String(data.user) === ADMIN_USER && String(data.password) === ADMIN_PASS;
}

function respond_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function sheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.appendRow(HEADERS);
    sh.setFrozenRows(1);
    sh.getRange('B:B').setNumberFormat('@'); // texto puro (nada vira fórmula)
    sh.getRange('D:D').setNumberFormat('@');
  }
  return sh;
}

/** Remove caracteres de controle, espaços repetidos e limita o tamanho. */
function clean_(value, max) {
  return String(value == null ? '' : value)
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);
}

/** Impede que um texto começando com = + - @ seja interpretado como fórmula na planilha. */
function safe_(text) {
  return /^[=+\-@]/.test(text) ? ' ' + text : text;
}

/** "Ana  SOUZA" e "ana souza" são a mesma pessoa. */
function keyOf_(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}
