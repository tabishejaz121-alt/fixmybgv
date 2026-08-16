/**
 * Fix My BGV — booking form -> Google Sheet lead capture + email notification.
 *
 * Sheet already set up:
 * https://docs.google.com/spreadsheets/d/1FByNbcj6E8DNRRM-3SkocaNwvO6AlbpuVnPc-ciEiA4/edit
 * Headers, row 1: Timestamp | Name | Mobile | Email | Issue | Service
 * (Service is a new 6th column — add that header if it isn't there yet.)
 *
 * Setup:
 * 1. Open the sheet at the link above.
 * 2. Extensions -> Apps Script. Delete any starter code and paste this
 *    file's contents in. (Opening Apps Script from inside this specific
 *    sheet is what binds the script to it — SpreadsheetApp.getActiveSpreadsheet()
 *    below then always means this sheet, no ID needed.)
 * 3. Deploy -> New deployment -> type "Web app".
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 4. Click Deploy. You'll be asked to authorize TWO permissions this time:
 *    writing to the spreadsheet, and sending email as you (for the
 *    notification). Approve both, then copy the Web app URL.
 * 5. Paste that URL into SITE_CONFIG.sheetsWebAppUrl in assets/js/main.js
 *    (replacing "PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE").
 *
 * If you ever edit this script again, you must create a NEW deployment
 * version (Deploy -> Manage deployments -> Edit -> Version: New version)
 * for the change to take effect — saving alone is not enough.
 */
function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = JSON.parse(e.postData.contents);

  sheet.appendRow([
    new Date(),
    data.name || "",
    data.mobile || "",
    data.email || "",
    data.issue || "",
    data.service || "",
  ]);

  MailApp.sendEmail({
    to: "tajehtesham@gmail.com",
    subject: "New Fix My BGV booking — " + (data.name || "Unknown"),
    body: [
      "New booking received from the website:",
      "",
      "Name: " + (data.name || ""),
      "Mobile: " + (data.mobile || ""),
      "Email: " + (data.email || ""),
      "Service: " + (data.service || "Not specified"),
      "Issue: " + (data.issue || ""),
    ].join("\n"),
  });

  return ContentService
    .createTextOutput(JSON.stringify({ result: "success" }))
    .setMimeType(ContentService.MimeType.JSON);
}
