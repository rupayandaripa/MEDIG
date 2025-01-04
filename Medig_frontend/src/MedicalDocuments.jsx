import React, { useState } from 'react';
import { X, File, FolderOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MedicalDocuments = () => {
    const navigate = useNavigate();
    const patientDetails = JSON.parse(localStorage.getItem('patientDetails'));

    const medicalDocuments = patientDetails.medicalDocuments
    
  
    const handleFolderClick = (folderName) => {
      navigate(`${folderName}`);
    };
  
    return (
      <div className="h-full bg-gradient-to-b from-teal-50 to-teal-100">
        <div className="w-full h-full mx-auto p-4 h-full">
          {/* Header */}
          <div className="bg-gray-900 text-white p-4 rounded-t-lg flex justify-between items-center">
            <h2 className="text-lg font-medium">Medical Documents</h2>
            <button className="hover:bg-gray-700 p-1 rounded">
              <X size={20} />
            </button>
          </div>
  
          {/* Documents Grid */}
          <div className="bg-teal-50/80 p-6 rounded-b-lg h-full">
          <div className="grid grid-cols-8 gap-4">

              {Object.keys(medicalDocuments).map((folderName) => (
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
        </div>
      </div>
    );
};

export default MedicalDocuments