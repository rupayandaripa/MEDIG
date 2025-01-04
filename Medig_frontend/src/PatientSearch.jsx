import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const PatientSearch = () => {
  const [patientId , setPatientId] = useState("")
  const navigate = useNavigate()
  const mappedData = JSON.parse(localStorage.getItem('mappedData'));
  const accessToken = mappedData.accessToken

  //console.log("Access Token: " , accessToken)

  const handleProceed = async () => {
    if(!patientId) {
      console.log("Patient ID is required")
      return 
    }

    try {
      const response = await fetch(`http://localhost:8000/api/v0/users/get-patient-details?rollNumber=${patientId}` , {
        method: 'GET',
        headers: { 
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },  
      })

      const patientDetails = await response.json()
      localStorage.removeItem('patientDetails')
      localStorage.setItem('patientDetails', JSON.stringify(patientDetails.data))

      console.log(patientDetails)
      navigate('patientLoader')


    }
    catch(error) {
      console.log(error)
      throw error
    }
    
  }

  return (
    <div className="flex-1 p-6 bg-gradient-to-b from-teal-100 to-white h-full w-full">
      
        <div className="flex items-center space-x-4">
          <input
            type="text"
            placeholder="Enter patient unique ID..."
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={(e) => setPatientId("")}
            className="px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition duration-300"
          >
            Clear
          </button>
          <button
            onClick={handleProceed}
            className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition duration-300"
          >
            Proceed
          </button>
        </div>
    </div>
  );
};

export default PatientSearch;