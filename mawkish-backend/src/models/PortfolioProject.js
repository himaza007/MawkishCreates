const mongoose = require('mongoose')

const resultSchema = new mongoose.Schema({
  value: { type: String, required: true },
  label: { type: String, required: true },
}, { _id: false })

const portfolioSchema = new mongoose.Schema(
  {
    industry:  { type: String, required: true, trim: true },
    year:      { type: String, required: true, trim: true },
    title:     { type: String, required: true, trim: true, maxlength: 200 },
    objective: { type: String, required: true, trim: true, maxlength: 500 },
    strategy:  { type: String, trim: true, default: '' },
    assets:    [{ type: String }], // image URLs / S3 keys
    results:   [resultSchema],
    tags:      [{ type: String, trim: true }],
    featured:  { type: Boolean, default: false },
    order:     { type: Number,  default: 0 },
    published: { type: Boolean, default: true },

    /* gradient used on the card (CSS value) */
    gradient: {
      type:    String,
      default: 'linear-gradient(145deg, #2d0a5e 0%, #5c18b8 100%)',
    },
  },
  { timestamps: true },
)

portfolioSchema.index({ industry: 1 })
portfolioSchema.index({ featured: 1 })
portfolioSchema.index({ order: 1 })

module.exports = mongoose.model('PortfolioProject', portfolioSchema)
