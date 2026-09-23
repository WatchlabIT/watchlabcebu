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
 * 5. Click 'Deploy' > 'New deployment'.
 * 6. Select Type: 'Web app'.
 * 7. Set 'Execute as': 'Me'.
 * 8. Set 'Who has access': 'Anyone'.
 * 9. Click 'Deploy', authorize permissions, and copy the Web App URL.
 * 10. Paste the URL into WatchLab Admin Dashboard > Google Sheets Sync settings!
 */

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
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
    
    if (data.action === "delete_watch" && data.id !== undefined) {
      var lastRow = sheet.getLastRow();
      if (lastRow > 1) {
        var ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
        for (var i = 0; i < ids.length; i++) {
          var cellVal = ids[i][0];
          if (String(cellVal).trim() === String(data.id).trim() || Number(cellVal) === Number(data.id)) {
            sheet.deleteRow(i + 2);
            break;
          }
        }
      }
      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: "Watch #" + data.id + " deleted."
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
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = sheet.getDataRange().getValues();
  
  if (data.length <= 1) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      watches: []
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  var watches = [];
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (!row[0]) continue;
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
  
  return ContentService.createTextOutput(JSON.stringify({
    status: "success",
    watches: watches
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
}`;

async function postToWebhook(url, payload) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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

function getWebhookUrl() {
  const envUrl = process.env.GOOGLE_SHEET_WEBHOOK_URL;
  if (envUrl && envUrl.trim()) return envUrl.trim();
  const config = dbOps.getGoogleSheetsConfig();
  return (config && config.webhook_url) ? config.webhook_url.trim() : '';
}

async function syncAllToSheets(customUrl = null) {
  const url = customUrl || getWebhookUrl();

  if (!url) {
    throw new Error('GOOGLE_SHEET_WEBHOOK_URL environment variable is not configured in Vercel.');
  }

  const watches = dbOps.getAllWatches();
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

  const response = await fetch(url, {
    method: 'GET',
    redirect: 'follow'
  });

  const text = await response.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch (e) {
    throw new Error('Failed to parse response from Google Sheets. Ensure Web App URL is published to Anyone.');
  }

  if (json.watches && Array.isArray(json.watches)) {
    // Import / update watches into local DB
    for (const remoteWatch of json.watches) {
      if (!remoteWatch.name || !remoteWatch.brand) continue;
      const existing = dbOps.getWatchById(remoteWatch.id);
      if (existing) {
        dbOps.updateWatch(remoteWatch.id, remoteWatch);
      } else {
        dbOps.createWatch(remoteWatch);
      }
    }
  }

  dbOps.updateGoogleSheetsConfig({
    last_synced: new Date().toISOString()
  });

  return { importedCount: json.watches ? json.watches.length : 0 };
}

module.exports = {
  GOOGLE_APPS_SCRIPT_CODE,
  syncAllToSheets,
  triggerAutoSync,
  pullFromSheets
};
