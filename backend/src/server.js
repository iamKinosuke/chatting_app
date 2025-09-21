import path from 'path'

import express from 'express'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import cors from 'cors'

import authRoutes from './routes/auth.route.js'
import messageRoutes from './routes/message.route.js'

import { app, server } from './lib/socket.js'

import { connectDB } from './lib/db.js'

dotenv.config()

app.use(express.json({ limit: '5mb' }))
app.use(cookieParser())
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}))

const __dirname = path.resolve()

app.use('/api/auth', authRoutes)
app.use('/api/messages', messageRoutes)

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')))

  app.get('*', (_, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend', 'dist','index.html'))
  })
}

server.listen(process.env.PORT, () => {
  console.log(`Server is running on http://localhost:${process.env.PORT}`)
  connectDB()
})
