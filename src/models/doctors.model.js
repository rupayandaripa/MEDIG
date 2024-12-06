import mongoose, {Schema} from "mongoose";
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

const doctorSchema = new Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        degree: {
            type: String,
            required: true,
        },
        specialization: {
            type: String,
            required: true
        },
        position: {
            type: String,
            required: true
        },
        age: {
            type: String,
            required: true
        },
        bloodGroup: {
            type: String,
            required: true
        },
        availableTime: {
            type: [
                {
                    type: String,
                    required: true
                }
            ]
        },
        noOfPatientsInLast7Days: {
            type: [
                {
                    type: String,
                    required: true
                }
            ]
        },
        availableOrNot: {
            type: Boolean,
            required: true
        },
        weeklyAvailability: {
            type: [
                {
                    type: String,
                    required: true
                }
            ]
        }
    },
    {
        timestamps: true
    }
)


export const Doctor = mongoose.model("Doctor" , doctorSchema)