import React, { useEffect } from 'react';
import Union from './assets/Union.png'
import { useNavigate } from 'react-router-dom';

const SplashScreen = () => {
    const navigate = useNavigate()

    useEffect(() => {
        const timer = setTimeout(() => {
            navigate('login')
        } , 5000)

        return () => clearTimeout(timer)
    } , [navigate])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-screen bg-gradient-to-b from-teal-100 to-white">
      <div className="text-center p-4 w-full max-w-4xl">
        <h1 className="text-8xl font-bold text-teal-700 mb-2 flex items-center justify-center">
          Medi
          <img 
            src={Union} 
            alt="Union" 
            className="w-12 h-12 mx-2" // Adjust the size of the image as needed
          />
          G
        </h1>
        <p className="text-2xl text-teal-600">Medical section made easy</p>
      </div>
    </div>
  );
};

export default SplashScreen;