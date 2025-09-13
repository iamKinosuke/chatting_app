import path from 'path'

import express from 'express'
import dotenv from 'dotenv'

import authRoutes from './routes/auth.route.js'
import messageRoutes from './routes/message.route.js'

dotenv.config()

const app = express()
const __dirname = path.resolve()

app.use('/api/auth', authRoutes)
app.use('/api/messages', messageRoutes)

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')))

  app.get('*', (_, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend', 'dist','index.html'))
  })
}

app.listen(process.env.PORT, () => {
  console.log(`Server is running on http://localhost:${process.env.PORT}`)
})
