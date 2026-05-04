const mongoose = require('mongoose')

const metricSchema = new mongoose.Schema({
  value: { type: String, required: true },
  label: { type: String, required: true },
}, { _id: false })

const resultDetailSchema = new mongoose.Schema({
  number: { type: String, required: true },
  desc:   { type: String, required: true },
}, { _id: false })

const caseStudySchema = new mongoose.Schema(
  {
    industry:   { type: String, required: true, trim: true },
    service:    { type: String, required: true, trim: true },
    title:      { type: String, required: true, trim: true, maxlength: 250 },

    /* Header metrics (3 highlighted numbers) */
    metrics: [metricSchema],

    /* Narrative sections */
    background: { type: String, required: true, trim: true },
    problem:    { type: String, required: true, trim: true },
    strategy:   { type: String, required: true, trim: true },
    execution:  { type: String, required: true, trim: true },

    /* Detailed results grid */
    results: [resultDetailSchema],

    featured:  { type: Boolean, default: false },
    order:     { type: Number,  default: 0 },
    published: { type: Boolean, default: true },
  },
  { timestamps: true },
)

caseStudySchema.index({ industry: 1 })
caseStudySchema.index({ featured: 1 })

module.exports = mongoose.model('CaseStudy', caseStudySchema)
