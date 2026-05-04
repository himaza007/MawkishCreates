const mongoose = require('mongoose')

const testimonialSchema = new mongoose.Schema(
  {
    name:    { type: String, required: true, trim: true, maxlength: 100 },
    role:    { type: String, required: true, trim: true, maxlength: 150 },
    company: { type: String, trim: true, default: '' },
    text:    { type: String, required: true, trim: true, maxlength: 1000 },
    rating:  { type: Number, min: 1, max: 5, default: 5 },
    initial: { type: String, trim: true, maxlength: 2, default: '' },
    avatar:  { type: String, default: '' }, // URL if photo is available
    featured:  { type: Boolean, default: false },
    order:     { type: Number,  default: 0 },
    published: { type: Boolean, default: true },
  },
  { timestamps: true },
)

testimonialSchema.index({ featured: 1 })

module.exports = mongoose.model('Testimonial', testimonialSchema)
