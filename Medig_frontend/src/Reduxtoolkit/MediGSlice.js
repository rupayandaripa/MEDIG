import {createSlice} from '@reduxjs/toolkit'

const initialState = {
    fullName: null,
    email: null,
    profilePicture: null,
    gender: null,
    role: null,
    degree: null,
    specialization: null,
    position: null,
    age: null,
    bloodGroup: null,
    availableTime: null,
    noOfPatientsInLast7Days: null,
    availableOrNot: null,
    weeklyAvailability: null,
    otherDoctorDetails: null
}
export const MediGSlice = createSlice({
    name: "userInfo",
    initialState,
    reducers: {
        changeData: (state , action) => {
            Object.assign(state , action.payload)
        }
    }
})

export const {changeData} = MediGSlice.actions
export default MediGSlice.reducer