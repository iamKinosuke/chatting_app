import jwt from 'jsonwebtoken'

import User from '../models/User.js'

export const socketAuthMiddleware = async (socket, next) => {
  try {
    const token = socket.handshake.headers.cookie
      ?.split(' ')
      .find((row) => row.startsWith('jwt='))
      ?.split('=')[1]

    if (!token) {
      return next(new Error('Unauthorized - No Token Provided'))
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    if (!decoded) {
      return next(new Error('Unauthorized - Invalid Token'))
    }

    const user = await User.findById(decoded.userId).select('-password')

    if (!user) {
      return next(new Error('User not found'))
    }

    socket.user = user
    socket.userId = user._id.toString()

    next()
  } catch (error) {
    next(new Error('Unauthorized - Authentication failed'))
  }
}
