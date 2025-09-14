import bcrypt from 'bcryptjs'

import User from '../models/User.js'

import { generateToken } from '../lib/utils.js'

import cloudinary from '../lib/cloudinary.js'

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

export const login = async (req, res) => {
  const {
    email,
    password,
  } = req.body

  try {
    if (!email || !password) {
      return res.status(400)
        .json({ message: 'All fields are required' })
    }

    const user = await User.findOne({ email })

    if (!user) {
      return res.status(400)
        .json({ message: 'Invalid email or password' })
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
      return res.status(400)
        .json({ message: 'Invalid email or password' })
    }

    generateToken(user._id, res)

    return res.status(200)
      .json({
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
      })
  } catch (error) {
    return res.status(500)
      .json({ message: 'Internal server error' })
  }
}

export const logout = (_, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    maxAge: 0,
  })

  return res.status(200)
    .json({ message: 'Logged out successfully' })
}

export const updateProfile = async (req, res) => {
  try {
    const { profilePicture } = req.body

    if (!profilePicture) {
      return res.status(400)
        .json({ message: 'Profile picture is required' })
    }

    const userId = req.user._id

    const uploadResponse = await cloudinary.uploader.upload(profilePicture)

    await User.findByIdAndUpdate(userId, {
      profilePicture: uploadResponse.secure_url,
    }, {
      new: true,
    })

    return res.status(200)
      .json({ message: 'Profile updated successfully' })
  } catch (error) {
    return res.status(500)
      .json({ message: 'Internal server error' })
  }
}
