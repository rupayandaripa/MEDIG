import mongoose , {Schema} from "mongoose";

const patientSchema = new Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        dateOfBirth: {
            type: String,
            require: true
        },
        rollNumber: {
            type: String,
            required: true
        },
        bloodGroup: {
            type: String,
            required: true
        },
        allergies: {
            type: [
                {
                    type: String,
                }
            ]
        },
        conditions: {
            type: [
                {
                    type: String
                }
            ]
        },
        medicalDocuments: {
            type: [
                {
                    type: String //cloudinary url
                }
            ]
        },
        medicalHistory: {
            type: [
                {
                    type: String //cloudinary url
                }
            ]
        }
    }
)

export const Patient = mongoose.model("Patient" , patientSchema)