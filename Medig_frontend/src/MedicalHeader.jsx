import React from 'react';
import { Bell, Menu } from 'lucide-react';
import { useSelector } from 'react-redux';
import Union from './assets/Union.png';
import ProfilePicture from './assets/ProfilePicMediG.png'

const MedicalHeader = () => {
  const name = useSelector(state => state.fullName);

  return (
    <header className="w-screen bg-gray-800 text-white py-3 px-6 flex items-center justify-between">
      {/* Left: Name */}
      <div className="flex items-center space-x-3">
        <img src={ProfilePicture} className="w-8 h-8 rounded-full border" />
        <p className="font-semibold text-s">{name}</p>
      </div>

      {/* Center: Medical Section */}
      <div className="absolute left-1/2 transform -translate-x-1/2">
        <p className="text-xs text-gray-300 text-center">
          Medical Section, IIT Guwahati
        </p>
      </div>

      {/* Right: Medi G */}
      <div className="flex items-center space-x-4">
        <h6 className="text-xl font-bold text-teal-700 mb-2 flex items-center justify-center">
          Medi
          <img 
            src={Union} 
            alt="Union" 
            className="w-4 h-4 mx-2" // Adjust the size of the image as needed
          />
          G
        </h6>
        <Bell size={25} />
        <Menu size={25} />
      </div>
    </header>
  );
};

export default MedicalHeader;