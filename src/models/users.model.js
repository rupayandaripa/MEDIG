import mongoose , {Schema} from "mongoose";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const userSchema = new Schema(
    {
        entityId: {
            type: mongoose.Schema.Types.ObjectId,
            refPath: "role",
            required: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        fullName: {
            type: String,
            required: true,
            trim: true,
            index: true
        },
        profilePicture: {
            type: String, //cloudinary url
            required: true
        },
        password: {
            type: String,
            required: [true , "Password is required"]
        },
        refreshToken: {
            type: String
        },
        gender: {
            type: String,
            required: true
        },
        role: {
            type: String,
            required: true,
            enum: ['Doctor' , 'Patient']
        }
    },
    {
        timestamps: true
    }
)

userSchema.pre("save" , async function (next) {
    if(this.isModified("password")) {
        this.password = await bcrypt.hash(this.password , 10)
        next()
    }
    else {
        return next()
    }
})

userSchema.methods.isPasswordCorrect = async function(password) {
    return await bcrypt.compare(password , this.password)
}

userSchema.methods.generateAccessToken = function() {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = function() {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User" , userSchema)