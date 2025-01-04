import React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Loader = () => {
    const [activeBlock, setActiveBlock] = useState(0);
    const totalBlocks = 4;
    const navigate = useNavigate()

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveBlock((prev) => (prev + 1) % (totalBlocks + 1));
        }, 300); // Adjust speed here

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            navigate('patientDetails')
        }, 5000)

        return () => clearTimeout(timer)
    }, [navigate])

    return (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-teal-100 to-white">
            <div className="flex flex-col items-center space-y-2">
                <div className="flex items-center justify-center space-x-2">
                    {[...Array(totalBlocks)].map((_, index) => (
                        <div
                            key={index}
                            className={`h-2 w-16 rounded-full transition-colors duration-200 ${index < activeBlock ? 'bg-teal-300' : 'bg-teal-100'
                                }`}
                        />
                    ))}
                </div>
                <span className="text-gray-600">Loading...</span>
                <div className="sr-only">Loading...</div>
            </div>
        </div>
    );
};

export default Loader;




