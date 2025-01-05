import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MedicalHistory = () => {
  
  const patientDetails = JSON.parse(localStorage.getItem('patientDetails'))
  const medicalHistory = patientDetails.medicalHistory
  const navigate = useNavigate()

  const handleFolderClick = (folderName) => {
    navigate(`${folderName}`);
  };

  return (
    <div className="h-full bg-gradient-to-b from-teal-50 to-teal-100 w-full">
      <div className="w-full h-full mx-auto p-4">
        {/* Header */}
        <div className="bg-gray-900 text-white p-4 rounded-t-lg flex justify-between items-center">
          <h2 className="text-lg font-medium">Medical History</h2>
          <button className="hover:bg-gray-700 p-1 rounded">
            <X size={20} onClick={() => {navigate(-1)}} />
          </button>
        </div>

        {/* Documents Grid */}
        {medicalHistory ?
          <div className="bg-teal-50/80 p-6 rounded-b-lg h-full">
            <div className="grid grid-cols-8 gap-4">

              {Object.keys(medicalHistory).map((folderName) => (
                <div
                  key={folderName}
                  className="group cursor-pointer w-13 h-13"
                  onClick={() => handleFolderClick(folderName)}
                >
                  {/* Folder Icon */}
                  <div className="bg-teal-200 hover:bg-teal-300 transition-colors rounded-lg p-4 aspect-square flex items-center justify-center mb-2">
                    <FolderOpen
                      size={30}
                      className="text-teal-700 group-hover:text-teal-800 transition-colors"
                    />
                  </div>
                  {/* Folder Name */}
                  <p className="text-sm text-center text-gray-700 font-medium">
                    {folderName}
                  </p>
                </div>
              ))}
            </div>
          </div>
          :
          <div className='h-full w-full'>
            <div className="bg-gradient-to-b from-teal-100 to-white flex items-center justify-center min-h-full">
              <div className="bg-teal-200 p-8 rounded-lg max-w-md w-full mx-4 text-center">
                <div className="mb-6">
                  <p className="text-gray-600 justify-center">
                    No medical history yet!!
                  </p>
                </div>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  );
};

export default MedicalHistory