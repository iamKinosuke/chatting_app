import express from 'express'

import { protectRoute } from '../middlewares/auth.middleware.js'

import {
  getAllContacts,
  getMessagesByUserId,
  sendMessage,
  getChatPartners,
} from '../controllers/message.controller.js'

const router = express.Router()

router.get('/contacts', protectRoute, getAllContacts)

router.get('/chats', protectRoute, getChatPartners)

router.get('/:id', protectRoute, getMessagesByUserId)

router.post('/send/:id', protectRoute, sendMessage)

export default router
