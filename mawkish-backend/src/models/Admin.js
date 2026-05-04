const mongoose = require('mongoose')
const bcrypt   = require('bcryptjs')

const adminSchema = new mongoose.Schema(
  {
    name:     { type: String, required: true, trim: true },
    email:    { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true, minlength: 8 },
    role:     { type: String, enum: ['admin', 'superadmin'], default: 'admin' },
    active:   { type: Boolean, default: true },
    lastLogin:{ type: Date },
  },
  { timestamps: true },
)

/* Hash password before save */
adminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  const salt = await bcrypt.genSalt(12)
  this.password = await bcrypt.hash(this.password, salt)
  next()
})

/* Compare plain text password */
adminSchema.methods.matchPassword = async function (plain) {
  return bcrypt.compare(plain, this.password)
}

/* Never expose password in JSON output */
adminSchema.methods.toJSON = function () {
  const obj = this.toObject()
  delete obj.password
  return obj
}

module.exports = mongoose.model('Admin', adminSchema)
