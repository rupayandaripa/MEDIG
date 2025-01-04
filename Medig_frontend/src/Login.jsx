import React, { useState, useEffect } from "react";
import Union from './assets/Union.png'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { changeData } from "./Reduxtoolkit/MediGSlice";

function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const navigate = useNavigate()
    const dispatch = useDispatch()

    const handleSubmit = async (e) => {
        e.preventDefault()

        await login()

    }

    async function login() {
        try {

            const response = await fetch('http://localhost:8000/api/v0/users/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            })

            if (response.ok) {
                const userInfo = await response.json()
                console.log("UserInfo: ", userInfo.data.user.fullName)
                const data = userInfo.data.user
                const accessToken = userInfo.data.accessToken; // Assuming accessToken is in data 
                const doctorInfoResponse = await fetch('http://localhost:8000/api/v0/users/get-doctor-details', {
                    method: 'GET',
                    headers: { 'Authorization': `Bearer ${accessToken}` }
                }
                );

                const doctorInfo = await doctorInfoResponse.json()
                const doctorData = doctorInfo.data

                const otherDoctorDetailsResponse = await fetch('http://localhost:8000/api/v0/users/other-doctor-schedule' , {
                    method: 'GET',
                    headers: { 'Authorization': `Bearer ${accessToken}`}
                })

                const otherDoctorInfo = await otherDoctorDetailsResponse.json()
                const otherDoctorData = otherDoctorInfo.data
                console.log("Other doctor info" , otherDoctorData)

                console.log("Doctor Data: " , doctorData)
                
                const mappedData = {
                    fullName: data.fullName,
                    email: data.email,
                    profilePicture: data.profilePicture,
                    gender: data.gender,
                    role: data.role,
                    degree: doctorData.degree,
                    specialization: doctorData.specialization,
                    position: doctorData.position,
                    age: doctorData.age,
                    bloodGroup: doctorData.bloodGroup,
                    availableTime: doctorData.availableTime,
                    noOfPatientsInLast7Days: doctorData.noOfPatientsInLast7Days,
                    availableOrNot: doctorData.availableOrNot,
                    weeklyAvailability: doctorData.weeklyAvailability,
                    otherDoctorDetails: otherDoctorData,
                    accessToken: accessToken
                }

                dispatch(changeData(mappedData))
                localStorage.setItem('mappedData', JSON.stringify(mappedData))
                console.log("Mapped Data: ", mappedData)
                // //const data = await response.json()
                navigate('loginSuccess')
            }



        }
        catch (error) {
            console.log("We have an error!!", error.code, " :: ", error.message)
        }
    }



    return (
        <div className="flex flex-col items-center justify-center min-h-screen w-screen bg-gradient-to-b from-teal-100 to-white">
            <h2 className="text-xl font-bold text-center mb-4">IITG Hospital</h2>
            <div className="text-center p-4 w-full max-w-4xl">
                <h1 className="text-6xl font-bold text-teal-700 mb-2 flex items-center justify-center">
                    Medi
                    <img
                        src={Union}
                        alt="Union"
                        className="w-12 h-12 mx-2" // Adjust the size of the image as needed
                    />
                    G
                </h1>
                <p className="text-xl text-teal-600">Medical section made easy</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    type="text"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 border rounded-md   
 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <br />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full
 px-4 py-2 border rounded-md focus:outline-none focus:ring-2   
 focus:ring-blue-500"
                />
                <br />
                <br />
                <br />
                <br />
                <button
                    type="submit"
                    className="w-full px-8 py-2 bg-black text-white rounded-md hover:bg-gray-800" // Adjust padding for wider button
                >
                    Log In
                </button>
            </form>
        </div>
    )
}

export default Login