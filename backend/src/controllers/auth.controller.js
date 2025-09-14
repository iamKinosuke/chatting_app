import bcrypt from 'bcryptjs'

import User from '../models/User.js'

import { generateToken } from '../lib/utils.js'

export const signup = async (req, res) => {
  const {
    fullName,
    email,
    password,
  } = req.body

  try {
    if (!fullName || !email || !password) {
      return res.status(400)
        .json({ message: 'All fields are required' })
    }

    if (password.length < 6) {
      return res.status(400)
        .json({ message: 'Password must be at least 6 characters' })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!emailRegex.test(email)) {
      return res.status(400)
        .json({ message: 'Invalid email format' })
    }

    const user = await User.findOne({
      email,
    })

    if (user) {
      return res.status(400)
        .json({ message: 'Email already in use' })
    }

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
    })

    if (newUser) {
      generateToken(newUser._id, res)

      await newUser.save()

      return res.status(201)
        .json({
          _id: newUser._id,
          fullName: newUser.fullName,
          email: newUser.email,
        })
    } else {
      return res.status(400)
        .json({ message: 'Invalid user data' })
    }
  } catch (error) {
    return res.status(500)
      .json({ message: 'Internal server error' })
  }
}