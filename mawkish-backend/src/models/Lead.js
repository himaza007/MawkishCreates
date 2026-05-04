const mongoose = require('mongoose')

const leadSchema = new mongoose.Schema(
  {
    /* Contact */
    name:    { type: String, required: true, trim: true, maxlength: 100 },
    company: { type: String, required: true, trim: true, maxlength: 150 },
    email:   {
      type:     String,
      required: true,
      trim:     true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    phone: { type: String, trim: true, maxlength: 30, default: '' },

    /* Enquiry details */
    industry:    { type: String, required: true, trim: true },
    service:     {
      type: String,
      required: true,
      enum: [
        'Lead Generation',
        'Social Media Management',
        'Marketing Coaching',
        'Done-For-You Marketing',
        'Not Sure Yet',
      ],
    },
    budget:      { type: String, trim: true, default: '' },
    description: { type: String, trim: true, maxlength: 2000, default: '' },

    /* CRM workflow */
    status: {
      type:    String,
      enum:    ['new', 'contacted', 'qualified', 'proposal', 'closed_won', 'closed_lost'],
      default: 'new',
    },
    notes:       { type: String, default: '' },
    source:      { type: String, default: 'website' },
    ipAddress:   { type: String, default: '' },
    userAgent:   { type: String, default: '' },
  },
  { timestamps: true },
)

/* Indexes */
leadSchema.index({ email: 1 })
leadSchema.index({ status: 1 })
leadSchema.index({ createdAt: -1 })

module.exports = mongoose.model('Lead', leadSchema)
