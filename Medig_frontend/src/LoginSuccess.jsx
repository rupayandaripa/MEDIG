import React from "react";
import { useNavigate} from "react-router-dom";
import { useEffect } from "react";
import { useSelector } from "react-redux";

const LoginSuccess = () => {
    const fullName = useSelector(state => state.fullName) || 'Guest'
    const navigate = useNavigate()

    console.log("Fullname: " , fullName)

    useEffect(() => {
        const timer = setTimeout(() => {
            navigate('layout')
        } , 3000)

        return () => clearTimeout(timer)
    } , [navigate])

    return (
        <div className="flex flex-col items-center justify-center min-h-screen w-screen bg-gradient-to-b from-teal-100 to-white">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
            <h1 className="text-3xl font-semibold text-center text-teal-800 mb-2">Welcome</h1>
            <h2 className="text-2xl font-bold text-center text-teal-900 mb-4">{fullName}</h2>
            <p className="text-center text-teal-700">You have successfully logged in.</p>
          </div>
        </div>
      );
}

export default LoginSuccess