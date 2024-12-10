import mongoose , {Schema} from "mongoose";

const patientSchema = new Schema(
    {
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
            type: Map,
            of: [String] //cloudinry url
        },
        medicalHistory: {
            type: Map,
            of: [String] //cloudinry url
        }
    }
)

export const Patient = mongoose.model("Patient" , patientSchema)