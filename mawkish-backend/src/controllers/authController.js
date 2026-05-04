const jwt   = require('jsonwebtoken')
const Admin = require('../models/Admin')

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' })

/* POST /api/auth/login */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' })
    }

    const admin = await Admin.findOne({ email, active: true })
    if (!admin || !(await admin.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' })
    }

    admin.lastLogin = new Date()
    await admin.save({ validateBeforeSave: false })

    const token = signToken(admin._id)

    res.json({
      success: true,
      token,
      data: admin, // password already stripped via toJSON()
    })
  } catch (err) {
    next(err)
  }
}

/* GET /api/auth/me — protected */
const getMe = async (req, res) => {
  res.json({ success: true, data: req.admin })
}

/* POST /api/auth/register — superadmin only (or first-run seed) */
const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body

    const exists = await Admin.findOne({ email })
    if (exists) {
      return res.status(409).json({ success: false, message: 'Admin with this email already exists' })
    }

    const admin = await Admin.create({ name, email, password, role: role || 'admin' })
    const token = signToken(admin._id)

    res.status(201).json({ success: true, token, data: admin })
  } catch (err) {
    next(err)
  }
}

/* PATCH /api/auth/change-password — protected */
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body
    const admin = await Admin.findById(req.admin._id)

    if (!(await admin.matchPassword(currentPassword))) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' })
    }

    admin.password = newPassword
    await admin.save()

    res.json({ success: true, message: 'Password updated successfully' })
  } catch (err) {
    next(err)
  }
}

module.exports = { login, getMe, register, changePassword }
