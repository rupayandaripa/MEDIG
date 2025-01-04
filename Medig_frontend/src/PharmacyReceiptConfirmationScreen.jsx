import React from 'react';
import { useNavigate } from 'react-router-dom';

const PharmacyReceiptConfirmationScreen = () => {
    const navigate = useNavigate()
    const prescription = JSON.parse(localStorage.getItem('prescription'));

    console.log("Prescription" , prescription)

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-teal-100 to-white flex items-center justify-center">
      <div className="bg-transparent p-8 rounded-lg max-w-md w-full mx-4 text-center">
        <div className="mb-6">
          <div className="w-20 h-20 bg-teal-300 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl text-white">!</span>
          </div>
          <h2 className="text-gray-800 text-xl font-semibold mb-2">
            The receipt will be forwarded to the Pharmacy!
          </h2>
          <p className="text-gray-600">
            A copy will be forwarded to the Patient.
          </p>
        </div>
        
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => {navigate(-1)}}
            className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {navigate('receiptForwardSuccess')}}
            className="px-6 py-2 bg-green-700 text-white rounded hover:bg-green-800 transition-colors"
          >
            Proceed
          </button>
        </div>
      </div>
    </div>
  );
};

export default PharmacyReceiptConfirmationScreen