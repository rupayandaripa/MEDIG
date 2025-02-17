import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import session from 'express-session'
import userRouter from './routes/user.routes.js'

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit: "1mb"}))

app.use(express.urlencoded({extended: true , limit: "16kb"}))

app.use(express.static("public"))

app.use(cookieParser())

app.use("/api/v0/users" , userRouter)



export {app}