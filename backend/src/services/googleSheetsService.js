const dbOps = require('../db');

/**
 * Google Apps Script Integration Service for WatchLab
 */
const GOOGLE_APPS_SCRIPT_CODE = `/**
 * WatchLab Cebu - Google Sheets Synchronization Script
 * 
 * SETUP INSTRUCTIONS:
 * 1. Open your Google Sheet.
 * 2. Click Extensions > Apps Script.
 * 3. Replace all existing code with this script.
 * 4. Click 'Save' (disk icon).
 * 5. Click 'Deploy' > 'New deployment' (or Manage Deployments > Edit > New Version).
 * 6. Select Type: 'Web app', Execute as: 'Me', Access: 'Anyone'.
 * 7. Click 'Deploy', authorize permissions, and copy the Web App URL.
 * 8. Paste the URL into WatchLab Admin Dashboard > Google Sheets Sync settings!
 * 
 * FEATURES:
 * - Automatically routes Watch Inventory to main sheet ("Sheet1" / "Watches").
 * - Automatically routes Featured Transactions to a separate sheet tab named "Transactions".
 * - Creates tabs and headers automatically if they don't exist!
 */

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    // 1. FEATURED TRANSACTIONS ACTIONS
    if (data.action === "upsert_transaction" || data.action === "delete_transaction" || data.sheet_name === "Transactions") {
      var txSheet = ss.getSheetByName("Transactions");
      if (!txSheet) {
        txSheet = ss.insertSheet("Transactions");
      }
      if (txSheet.getLastRow() === 0) {
        setupTxHeader(txSheet);
      }

      if (data.action === "upsert_transaction" && data.transaction) {
        var tx = data.transaction;
        var lastRow = txSheet.getLastRow();
        var foundRow = -1;

        if (lastRow > 1) {
          var ids = txSheet.getRange(2, 1, lastRow - 1, 1).getValues();
          for (var i = 0; i < ids.length; i++) {
            var cellVal = ids[i][0];
            if (String(cellVal).trim() === String(tx.id).trim() || Number(cellVal) === Number(tx.id)) {
              foundRow = i + 2;
              break;
            }
          }
        }

        var rowData = [
          tx.id,
          tx.title || '',
          tx.subtitle || '',
          tx.location || '',
          tx.category || '',
          tx.badge || '',
          tx.note || '',
          tx.image_url || tx.image || '',
          tx.updated_at || new Date().toISOString()
        ];

        if (foundRow > 0) {
          txSheet.getRange(foundRow, 1, 1, 9).setValues([rowData]);
        } else {
          txSheet.appendRow(rowData);
        }

        return ContentService.createTextOutput(JSON.stringify({
          status: "success",
          message: "Transaction #" + tx.id + " updated."
        })).setMimeType(ContentService.MimeType.JSON);
      }

      if (data.action === "delete_transaction" && (data.id !== undefined && data.id !== null)) {
        var lastRow = txSheet.getLastRow();
        var deletedCount = 0;
        if (lastRow > 1) {
          var ids = txSheet.getRange(2, 1, lastRow - 1, 1).getValues();
          for (var i = ids.length - 1; i >= 0; i--) {
            var cellVal = ids[i][0];
            if (String(cellVal).trim() == String(data.id).trim() || Number(cellVal) == Number(data.id)) {
              txSheet.deleteRow(i + 2);
              deletedCount++;
            }
          }
        }
        return ContentService.createTextOutput(JSON.stringify({
          status: "success",
          message: "Deleted " + deletedCount + " transaction row(s) for ID #" + data.id
        })).setMimeType(ContentService.MimeType.JSON);
      }
    }

    // 2. WATCH INVENTORY ACTIONS (Default Sheet)
    var sheet = ss.getSheetByName("Watches") || ss.getActiveSheet();
    if (sheet.getLastRow() === 0) {
      setupHeader(sheet);
    }
    
    if (data.action === "sync_all" && Array.isArray(data.watches)) {
      var lastRow = sheet.getLastRow();
      if (lastRow > 1) {
        sheet.getRange(2, 1, lastRow - 1, 9).clearContent();
      }
      
      var rows = data.watches.map(function(w) {
        return [
          w.id,
          w.name,
          w.brand,
          w.price,
          w.stock,
          w.condition,
          w.description,
          w.image_url,
          w.updated_at || new Date().toISOString()
        ];
      });
      
      if (rows.length > 0) {
        sheet.getRange(2, 1, rows.length, 9).setValues(rows);
      }
      
      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: "Successfully synchronized " + rows.length + " items to Google Sheets.",
        synced_count: rows.length
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    if (data.action === "upsert_watch" && data.watch) {
      var w = data.watch;
      var lastRow = sheet.getLastRow();
      var foundRow = -1;
      
      if (lastRow > 1) {
        var ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
        for (var i = 0; i < ids.length; i++) {
          var cellVal = ids[i][0];
          if (String(cellVal).trim() === String(w.id).trim() || Number(cellVal) === Number(w.id)) {
            foundRow = i + 2;
            break;
          }
        }
      }
      
      var rowData = [
        w.id,
        w.name,
        w.brand,
        w.price,
        w.stock,
        w.condition,
        w.description,
        w.image_url,
        w.updated_at || new Date().toISOString()
      ];
      
      if (foundRow > 0) {
        sheet.getRange(foundRow, 1, 1, 9).setValues([rowData]);
      } else {
        sheet.appendRow(rowData);
      }
      
      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: "Watch #" + w.id + " updated."
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    if (data.action === "delete_watch" && (data.id !== undefined && data.id !== null)) {
      var sheets = ss.getSheets();
      var deletedCount = 0;

      for (var s = 0; s < sheets.length; s++) {
        var curSheet = sheets[s];
        var lastRow = curSheet.getLastRow();
        if (lastRow > 1) {
          var ids = curSheet.getRange(2, 1, lastRow - 1, 1).getValues();
          for (var i = ids.length - 1; i >= 0; i--) {
            var cellVal = ids[i][0];
            if (String(cellVal).trim() == String(data.id).trim() || Number(cellVal) == Number(data.id)) {
              curSheet.deleteRow(i + 2);
              deletedCount++;
            }
          }
        }
      }
      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: "Deleted " + deletedCount + " row(s) for Watch #" + data.id
      })).setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: "Unsupported action: " + data.action
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. Fetch Watches from "Watches" sheet or first sheet tab
  var watchSheet = ss.getSheetByName("Watches") || ss.getSheets()[0];
  var watchData = watchSheet ? watchSheet.getDataRange().getValues() : [];
  var watches = [];
  if (watchData.length > 1) {
    for (var i = 1; i < watchData.length; i++) {
      var row = watchData[i];
      if (!row[0] && !row[1]) continue;
      watches.push({
        id: Number(row[0]),
        name: String(row[1] || ''),
        brand: String(row[2] || ''),
        price: Number(row[3]) || 0,
        stock: Number(row[4]) || 0,
        condition: String(row[5] || 'Brand New'),
        description: String(row[6] || ''),
        image_url: String(row[7] || ''),
        updated_at: String(row[8] || new Date().toISOString())
      });
    }
  }

  // 2. Fetch Transactions from "Transactions" sheet tab
  var txSheet = ss.getSheetByName("Transactions");
  var txData = txSheet ? txSheet.getDataRange().getValues() : [];
  var transactions = [];
  if (txData.length > 1) {
    for (var j = 1; j < txData.length; j++) {
      var trow = txData[j];
      if (!trow[0] && !trow[1]) continue;
      transactions.push({
        id: Number(trow[0]),
        title: String(trow[1] || ''),
        subtitle: String(trow[2] || ''),
        location: String(trow[3] || ''),
        category: String(trow[4] || ''),
        badge: String(trow[5] || ''),
        note: String(trow[6] || ''),
        image_url: String(trow[7] || ''),
        updated_at: String(trow[8] || new Date().toISOString())
      });
    }
  }

  return ContentService.createTextOutput(JSON.stringify({
    status: "success",
    watches: watches,
    transactions: transactions
  })).setMimeType(ContentService.MimeType.JSON);
}

function setupHeader(sheet) {
  var headers = [["ID", "Watch Name", "Brand", "Price (PHP)", "Stock", "Condition", "Description", "Image URL", "Last Updated"]];
  var headerRange = sheet.getRange(1, 1, 1, 9);
  headerRange.setValues(headers);
  headerRange.setFontWeight("bold");
  headerRange.setBackground("#1E293B");
  headerRange.setFontColor("#FFFFFF");
  sheet.setFrozenRows(1);
}

function setupTxHeader(sheet) {
  var headers = [["ID", "Title", "Subtitle / Model", "Location", "Category", "Badge", "Client Note", "Image URL", "Last Updated"]];
  var headerRange = sheet.getRange(1, 1, 1, 9);
  headerRange.setValues(headers);
  headerRange.setFontWeight("bold");
  headerRange.setBackground("#4C1D95");
  headerRange.setFontColor("#FFFFFF");
  sheet.setFrozenRows(1);
}
`;

async function postToWebhook(url, payload) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload),
    redirect: 'follow'
  });

  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch (e) {
    return { status: 'raw', message: text };
  }
}

const DEFAULT_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbyXdt8GP2HZ0KAaPLfVDaQD1YiPym949VTCyTmTVqbVOXy8d40tsaw6rGbp2ylnDdjnAg/exec';

function getWebhookUrl() {
  const envUrl = process.env.GOOGLE_SHEET_WEBHOOK_URL;
  if (envUrl && envUrl.trim()) return envUrl.trim();
  const config = dbOps.getGoogleSheetsConfig();
  if (config && config.webhook_url && config.webhook_url.trim()) return config.webhook_url.trim();
  return DEFAULT_WEBHOOK_URL;
}

async function syncAllToSheets(customUrl = null) {
  const url = customUrl || getWebhookUrl();

  if (!url) {
    throw new Error('GOOGLE_SHEET_WEBHOOK_URL environment variable is not configured in Vercel.');
  }

  const watches = await dbOps.getAllWatches();
  const result = await postToWebhook(url, {
    action: 'sync_all',
    watches: watches,
    timestamp: new Date().toISOString()
  });

  dbOps.updateGoogleSheetsConfig({
    last_synced: new Date().toISOString()
  });

  return result;
}

async function triggerAutoSync(action, data) {
  try {
    const url = getWebhookUrl();
    const config = dbOps.getGoogleSheetsConfig();
    const autoSync = config ? (config.auto_sync ?? true) : true;

    if (!url || !autoSync) {
      return;
    }

    if (action === 'upsert') {
      await postToWebhook(url, {
        action: 'upsert_watch',
        watch: data
      });
    } else if (action === 'delete') {
      await postToWebhook(url, {
        action: 'delete_watch',
        id: data
      });
    } else if (action === 'upsert_transaction') {
      await postToWebhook(url, {
        action: 'upsert_transaction',
        transaction: data,
        sheet_name: 'Transactions'
      });
    } else if (action === 'delete_transaction') {
      await postToWebhook(url, {
        action: 'delete_transaction',
        id: data,
        sheet_name: 'Transactions'
      });
    }
  } catch (err) {
    console.error('Background Google Sheets auto-sync error:', err.message);
  }
}

async function pullFromSheets(customUrl = null) {
  const url = customUrl || getWebhookUrl();

  if (!url) {
    throw new Error('GOOGLE_SHEET_WEBHOOK_URL environment variable is not configured in Vercel.');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);

  let response;
  try {
    response = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal
    });
  } catch (err) {
    throw new Error('Google Sheets request timed out or failed to connect: ' + err.message);
  } finally {
    clearTimeout(timeoutId);
  }

  const text = await response.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch (e) {
    throw new Error('Failed to parse response from Google Sheets. Ensure Web App URL is published to Anyone.');
  }

  const db = loadDatabase();
  const deletedWatchIds = new Set((db.deleted_watch_ids || []).map(id => String(id)));
  const deletedTxIds = new Set((db.deleted_tx_ids || []).map(id => String(id)));

  let importedCount = 0;

  if (json.watches && Array.isArray(json.watches)) {
    for (const remoteWatch of json.watches) {
      if (!remoteWatch.name || !remoteWatch.brand) continue;
      const remoteIdStr = String(remoteWatch.id);
      if (deletedWatchIds.has(remoteIdStr)) continue; // Skip deleted items

      const existingIndex = (db.watches || []).findIndex(w => String(w.id) === remoteIdStr || Number(w.id) === Number(remoteWatch.id));
      if (existingIndex !== -1) {
        dbOps.updateWatch(remoteWatch.id, remoteWatch);
      } else {
        dbOps.createWatch(remoteWatch);
      }
      importedCount++;
    }
  }

  if (json.transactions && Array.isArray(json.transactions)) {
    for (const remoteTx of json.transactions) {
      if (!remoteTx.title) continue;
      const remoteTxIdStr = String(remoteTx.id);
      if (deletedTxIds.has(remoteTxIdStr)) continue; // Skip deleted transactions

      const existingTx = (db.transactions || []).find(t => String(t.id) === remoteTxIdStr || Number(t.id) === Number(remoteTx.id));
      if (existingTx) {
        dbOps.updateTransaction(remoteTx.id, remoteTx);
      } else {
        dbOps.createTransaction(remoteTx);
      }
      importedCount++;
    }
  }

  dbOps.updateGoogleSheetsConfig({
    last_synced: new Date().toISOString()
  });

  return { importedCount };
}

async function fetchLiveWatchesFromSheets() {
  try {
    const url = getWebhookUrl();
    if (!url) return null;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    let response;
    try {
      response = await fetch(url, {
        method: 'GET',
        redirect: 'follow',
        signal: controller.signal
      });
    } finally {
      clearTimeout(timeoutId);
    }

    const text = await response.text();
    let json;
    try { json = JSON.parse(text); } catch (e) { return null; }

    if (json && json.status === 'success' && Array.isArray(json.watches)) {
      return json.watches.map(w => ({
        id: Number(w.id),
        name: String(w.name || ''),
        brand: String(w.brand || ''),
        price: Number(w.price) || 0,
        stock: Number(w.stock) || 0,
        condition: String(w.condition || 'Brand New'),
        description: String(w.description || ''),
        image_url: String(w.image_url || ''),
        created_at: w.created_at || w.updated_at || new Date().toISOString(),
        updated_at: w.updated_at || new Date().toISOString()
      }));
    }
  } catch (err) {
    console.warn('Live watches fetch timeout or warning:', err.message);
  }
  return null;
}

async function fetchLiveTransactionsFromSheets() {
  try {
    const url = getWebhookUrl();
    if (!url) return null;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    let response;
    try {
      response = await fetch(url, {
        method: 'GET',
        redirect: 'follow',
        signal: controller.signal
      });
    } finally {
      clearTimeout(timeoutId);
    }

    const text = await response.text();
    let json;
    try { json = JSON.parse(text); } catch (e) { return null; }

    if (json && json.status === 'success' && Array.isArray(json.transactions)) {
      return json.transactions.map(t => ({
        id: Number(t.id),
        title: String(t.title || ''),
        subtitle: String(t.subtitle || ''),
        location: String(t.location || 'Cebu'),
        category: String(t.category || 'Handover'),
        badge: String(t.badge || 'Handover'),
        note: String(t.note || ''),
        image_url: String(t.image_url || ''),
        created_at: t.created_at || t.updated_at || new Date().toISOString(),
        updated_at: t.updated_at || new Date().toISOString()
      }));
    }
  } catch (err) {
    console.warn('Live transactions fetch timeout or warning:', err.message);
  }
  return null;
}

module.exports = {
  GOOGLE_APPS_SCRIPT_CODE,
  syncAllToSheets,
  triggerAutoSync,
  pullFromSheets,
  fetchLiveWatchesFromSheets,
  fetchLiveTransactionsFromSheets
};
