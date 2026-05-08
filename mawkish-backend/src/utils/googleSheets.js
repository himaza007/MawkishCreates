const { google } = require('googleapis')
const { SHEET_TABS, SERVICE_FIELDS } = require('../config/sheetConfig')

// Creates an authenticated Google Sheets client using service account credentials
const getSheetsClient = () => {
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n')

  if (!process.env.GOOGLE_SHEET_ID) {
    throw new Error('GOOGLE_SHEET_ID is missing in .env')
  }

  if (!clientEmail) {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_EMAIL is missing in .env')
  }

  if (!privateKey) {
    throw new Error('GOOGLE_PRIVATE_KEY is missing in .env')
  }

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: clientEmail,
      private_key: privateKey,
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })

  return google.sheets({
    version: 'v4',
    auth,
  })
}

// Converts empty values and arrays into sheet-friendly values
const formatValue = (value) => {
  if (Array.isArray(value)) return value.join(', ')
  if (value === undefined || value === null) return ''
  return value
}

// Builds the row according to the selected service fields
const buildRow = (leadData) => {
  const fields = SERVICE_FIELDS[leadData.service]

  if (!fields) {
    throw new Error(`No sheet fields configured for service: ${leadData.service}`)
  }

  return fields.map((field) => {
    if (field === 'submittedAt') {
      return leadData.submittedAt || new Date().toISOString()
    }

    return formatValue(leadData[field])
  })
}

// Adds the enquiry into the correct Google Sheet tab
const appendLeadToSheet = async (leadData) => {
  const sheets = getSheetsClient()

  const tabName = SHEET_TABS[leadData.service]

  if (!tabName) {
    throw new Error(`No Google Sheet tab configured for service: ${leadData.service}`)
  }

  const row = buildRow(leadData)

  await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: `${tabName}!A:Z`,
    valueInputOption: 'USER_ENTERED',
    insertDataOption: 'INSERT_ROWS',
    requestBody: {
      values: [row],
    },
  })
}

module.exports = {
  appendLeadToSheet,
}