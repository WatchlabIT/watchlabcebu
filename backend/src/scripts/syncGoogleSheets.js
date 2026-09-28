const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

const { pullFromSheets } = require('../services/googleSheetsService');

async function sync() {
  console.log('====================================================');
  console.log(' 🔄 WatchLab Google Sheets Data Import Utility');
  console.log('====================================================');
  
  const webhookUrl = process.env.GOOGLE_SHEET_WEBHOOK_URL;
  if (!webhookUrl) {
    console.warn('⚠️ WARNING: GOOGLE_SHEET_WEBHOOK_URL environment variable is not set!');
  } else {
    console.log(`📡 Using Webhook: ${webhookUrl}`);
  }

  try {
    const result = await pullFromSheets(webhookUrl);
    console.log(`✅ SUCCESS: Imported ${result.importedCount} record(s) from Google Sheets into Railway DB!`);
    process.exit(0);
  } catch (err) {
    console.error('❌ ERROR importing data from Google Sheets:', err.message);
    process.exit(1);
  }
}

sync();
