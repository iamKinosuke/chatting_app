import cloudinary from '../lib/cloudinary.js'

import Message from '../models/Message.js'
import User from '../models/User.js'

import { getReceiverSocketId, io } from '../lib/socket.js'

export const getAllContacts = async (req, res) => {
  try {
    const loggedInUserId = req.user._id

    const contacts = await User.find({
      _id: { $ne: loggedInUserId }
    })
      .select('-password')

    return res.status(200)
      .json(contacts)
  } catch (error) {
    return res.status(500)
      .json({ message: 'Internal server error' })
  }
}

export const getMessagesByUserId = async (req, res) => {
  try {
    const loggedInUserId = req.user._id
    const userId = req.params.id

    const messages = await Message.find({
      $or: [
        { senderId: loggedInUserId, receiverId: userId },
        { senderId: userId, receiverId: loggedInUserId }
      ],
    })

    return res.status(200)
      .json(messages)
  } catch (error) {
    return res.status(500)
      .json({ message: 'Internal server error' })
  }
}

export const sendMessage = async (req, res) => {
  try {
    const {
      text,
      image,
    } = req.body

    const senderId = req.user._id
    const receiverId = req.params.id

    if (!text && !image) {
      return res.status(400)
        .json({ message: 'Message text or image is required' })
    }

    if (senderId.toString() === receiverId.toString()) {
      return res.status(400)
        .json({ message: 'You cannot send a message to yourself' })
    }

    let imageUrl

    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image)

      imageUrl = uploadResponse.secure_url
    }

    const newMessage = new Message({
      senderId: senderId,
      receiverId: receiverId,
      text,
      image: imageUrl,
    })

    await newMessage.save()

    const receiverSocketId = getReceiverSocketId(receiverId)

    if (receiverSocketId) {
      io.to(receiverSocketId).emit('newMessage', newMessage)
    }

    return res.status(201)
      .json(newMessage)
  } catch (error) {
    return res.status(500)
      .json({ message: 'Internal server error' })
  }
}

export const getChatPartners = async (req, res) => {
  try {
    const loggedInUserId = req.user._id

    const messages = await Message.find({
      $or: [
        { senderId: loggedInUserId },
        { receiverId: loggedInUserId }
      ]
    })

    const partnerIds = [...new Set(messages.map(msg =>
      msg.senderId.toString() === loggedInUserId.toString()
        ? msg.receiverId.toString()
        : msg.senderId.toString()
    ))]

    const partners = await User.find({
      _id: { $in: partnerIds }
    })

    return res.status(200)
      .json(partners)
  } catch (error) {
    return res.status(500)
      .json({ message: 'Internal server error' })
  }
}
