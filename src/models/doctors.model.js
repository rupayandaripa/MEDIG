import mongoose, {Schema} from "mongoose";

const doctorSchema = new Schema(
    {
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
                    //required: true
                }
            ]
        },
        availableOrNot: {
            type: String,
            required: true,
            default: 'true'
        },
        weeklyAvailability: {
            type: [
                {
                    type: String,
                    //required: true
                }
            ]
        }
    },
    {
        timestamps: true
    }
)


export const Doctor = mongoose.model("Doctor" , doctorSchema)