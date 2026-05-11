// Maps each frontend service name to the matching Google Sheet tab name
const SHEET_TABS = {
  'Lead Generation': 'Lead Generation',
  'Social Media Management': 'Social Media Management',
  'Web Development': 'Web Development',
  Events: 'Events',
}

// Defines the exact columns saved for each service tab
const SERVICE_FIELDS = {
  'Lead Generation': [
    'submittedAt',
    'name',
    'company',
    'email',
    'phone',
    'industry',
    'budget',
    'description',
  ],

  'Social Media Management': [
    'submittedAt',
    'name',
    'company',
    'email',
    'phone',
    'socialHandles',
    'industry',
    'budget',
    'description',
  ],

  'Web Development': [
    'submittedAt',
    'name',
    'email',
    'phone',
    'company',
    'packagePreference',
    'industry',
    'websiteType',
    'timeline',
    'description',
  ],

  Events: [
    'submittedAt',
    'track',
    'name',
    'company',
    'industry',
    'objective',
    'geography',
    'phone',
    'budget',
    'event',
    'email',
  ],
}

const ALLOWED_SERVICES = Object.keys(SHEET_TABS)

module.exports = {
  SHEET_TABS,
  SERVICE_FIELDS,
  ALLOWED_SERVICES,
}