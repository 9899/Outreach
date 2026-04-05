# HireReach — 5 Minute Setup for Live Response Tracking

## Step 1: Create your Google Sheet webhook (free, 2 minutes)

1. Go to https://script.google.com
2. Click "New project"
3. Delete everything and paste this code:

```javascript
function doPost(e) {
  const sheet = SpreadsheetApp.openById('YOUR_SHEET_ID').getActiveSheet();
  const data = JSON.parse(e.postData.contents);
  sheet.appendRow([
    new Date(),
    data.campaignId,
    data.contactId,
    data.name,
    data.type,
    data.phone || ''
  ]);
  return ContentService.createTextOutput(JSON.stringify({ok:true}))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  const campaignId = e.parameter.campaignId;
  const sheet = SpreadsheetApp.openById('YOUR_SHEET_ID').getActiveSheet();
  const rows = sheet.getDataRange().getValues();
  const responses = rows.slice(1)
    .filter(r => r[1] === campaignId)
    .map(r => ({
      time: r[0],
      campaignId: r[1],
      contactId: r[2],
      name: r[3],
      type: r[4],
      phone: r[5]
    }));
  return ContentService.createTextOutput(JSON.stringify({responses}))
    .setMimeType(ContentService.MimeType.JSON);
}
```

4. Create a Google Sheet at https://sheets.google.com
5. Copy the Sheet ID from the URL (the long string between /d/ and /edit)
6. Replace YOUR_SHEET_ID in the script above
7. In Apps Script: click Deploy → New deployment → Web app
8. Set "Execute as" = Me, "Who has access" = Anyone
9. Click Deploy → Copy the Web App URL

## Step 2: Add the URL to your app

Open index.html and find this line near the top of the <script> section:
  const WEBHOOK_URL = '';
Replace with:
  const WEBHOOK_URL = 'YOUR_WEB_APP_URL_HERE';

Also open respond/index.html and find:
  const WEBHOOK_URL = '';
Replace with the same URL.

Then push to GitHub:
  git add .
  git commit -m "add webhook"
  git push --set-upstream origin master

That's it! Every YES/NO response will be saved to your Google Sheet AND shown live in your dashboard.
