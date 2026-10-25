const jwt = require('jsonwebtoken')
const User = require('../models/User')

function createToken(user) {
  if (!process.env.JWT_SECRET) {
    const error = new Error('JWT_SECRET is not configured')
    error.statusCode = 500
    throw error
  }

  const userId = user._id.toString()

  return jwt.sign({ id: userId, userId, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  })
}

function userResponse(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  }
}

async function register(req, res) {
  const { name, email, password, role } = req.body

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required' })
  }

  if (!role) {
    return res.status(400).json({ message: 'Role is required' })
  }

  if (!['student', 'facilitator'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role' })
  }

  const normalizedEmail = email.trim().toLowerCase()
  const existingUser = await User.findOne({ email: normalizedEmail })

  if (existingUser) {
    return res.status(409).json({ message: 'An account with this email already exists' })
  }

  try {
    const user = await User.create({
      name,
      email: normalizedEmail,
      password,
      role,
    })

    return res.status(201).json({ user: userResponse(user) })
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'An account with this email already exists' })
    }

    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message })
    }

    throw error
  }
}

async function login(req, res) {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' })
  }

  const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password')
  const passwordMatches = user && (await user.comparePassword(password))

  if (!passwordMatches) {
    return res.status(401).json({ message: 'Invalid email or password' })
  }

  return res.json({
    user: userResponse(user),
    token: createToken(user),
  })
}

async function getMe(req, res) {
  try {
    const user = await User.findById(req.user.userId)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }
    return res.json({ user: userResponse(user) })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

module.exports = { register, login, getMe }


/*

8u qybe e 
ie8 hah e a000au e
ba auue wo u u  apj si all aiii asjsaoiellw
apjieeeu auidn aondudjnaj  aiuns akaona 

*/