const jwt   = require('jsonwebtoken')
const Admin = require('../models/Admin')

const protect = async (req, res, next) => {
  let token

  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1]
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorised — no token' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.admin = await Admin.findById(decoded.id).select('-password')

    if (!req.admin || !req.admin.active) {
      return res.status(401).json({ success: false, message: 'Not authorised — account inactive' })
    }

    next()
  } catch (err) {
    next(err)
  }
}

const superAdmin = (req, res, next) => {
  if (req.admin?.role !== 'superadmin') {
    return res.status(403).json({ success: false, message: 'Forbidden — superadmin only' })
  }
  next()
}

module.exports = { protect, superAdmin }
