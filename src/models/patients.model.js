import mongoose, { Schema } from "mongoose";

const patientSchema = new Schema(
    {
        phoneNumber: {
            type: String,
            required: true
        },
        emergencyNumber: {
            type: String,
            required: true
        },
        hostel: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        dateOfBirth: {
            type: String,
            required: true
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
        },
    }
)

export const Patient = mongoose.model("Patient", patientSchema)