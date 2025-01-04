import React from 'react';
import { ChevronDown } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Clock } from 'lucide-react';
import { ChevronUp } from 'lucide-react'; // Icons for toggling
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import ProfilePicture from './assets/ProfilePicMediG.png'
import { useNavigate, useLocation } from 'react-router-dom'

export const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const items = ['Dashboard', 'Schedule', 'Patients', 'Applications'];

    const handleLogout = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/v0/users/logout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            })

            navigate('/login');
        } catch (error) {
            console.error('Logout error:', error);

        }
    }
    const isItemActive = (item) => {
        const currentPath = location.pathname.toLowerCase();
        const itemPath = item.toLowerCase();

        if (item === 'Dashboard') {
            // Check if we're at the layout root or explicitly on the dashboard path
            return currentPath.endsWith('/layout') || currentPath.endsWith('/dashboard');
        }

        return currentPath.includes(itemPath);
    };

    
        
    const handleNavigation = (item) => {
        const path = item.toLowerCase();
        
        function navigateUntilLayout() {
            const currentPath = window.location.pathname;
            const pathSegments = currentPath.split('/').filter(Boolean);
            const lastWord = pathSegments[pathSegments.length - 1];
            
            if (lastWord !== 'layout') {
                navigate(-1);
                setTimeout(navigateUntilLayout, 100);
                return;
            }
            
            navigate(path === 'dashboard' ? '' : path);
        }
    
        navigateUntilLayout();
    };

    return (
        <div className="bg-gray-900 text-white w-64 py-4 flex flex-col h-full">
            {items.map((item) => (
                <div
                    key={item}
                    className={`py-3 px-6 ${isItemActive(item)
                        ? 'bg-gray-100 text-gray-900 font-semibold'
                        : 'hover:bg-gray-800'
                        } cursor-pointer`}
                    onClick={() => handleNavigation(item)}
                >
                    {item}
                </div>
            ))}
            <div className="mt-auto">
                <div
                    className="py-3 px-6 hover:bg-gray-800 cursor-pointer"
                    onClick={handleLogout}
                >
                    Log out
                </div>
            </div>
        </div>
    );
};

const DoctorInfo = ({ name, specialization, role, age, gender, bloodType, workHours , profilePicture }) => (
    <div className="bg-gray-100 p-4 rounded-lg flex items-start space-x-6 bg-gradient-to-b from-teal-100 to-white">
        <img src={profilePicture} alt={ProfilePicture} className="w-20 h-20 rounded-full border-4 border-teal-500" />
        <div>
            <h2 className="text-xl font-bold">{name}</h2>
            <p className="text-gray-600 italic">{specialization}</p>
            <p className="text-sm font-bold">{role}</p>
            <p className="text-sm font-bold">
                <span className="mr-4">{gender}</span>
                <span>{age}</span>
            </p>
            <p className="text-red-600 font-bold text-sm">{bloodType}</p>
            <div className="mt-2 bg-white px-2 py-1 rounded-lg inline-flex items-center space-x-2 border border-black font-semibold">
                <Clock size={16} />
                {workHours.map((hours, index) => (
                    <span key={index} className="text-sm">{hours}</span>
                ))}
            </div>

        </div>
    </div>
);

const HospitalOccupancy = () => {
    const data = [
        { time: '6am', occupancy: 10 },
        { time: '8am', occupancy: 20 },
        { time: '10am', occupancy: 40 },
        { time: '12pm', occupancy: 60 },
        { time: '2pm', occupancy: 50 },
        { time: '4pm', occupancy: 40 },
        { time: '6pm', occupancy: 70 },
        { time: '8pm', occupancy: 60 },
        { time: '10pm', occupancy: 50 },
    ];

    return (
        <div className="bg-gray-100 p-2 rounded-lg bg-gradient-to-b from-teal-100 to-white">
            <div className="flex justify-between items-center mb-2">
                <div className="flex items-center">
                    <span className="bg-black text-white text-xs font-bold px-2 py-1 rounded mr-2">LIVE</span>
                    <span className="font-semibold text-sm">IIT-G Hospital</span>
                </div>
                <span className="text-xs text-gray-500">A little busy</span>
            </div>
            <ResponsiveContainer width="100%" height={80}>
                <BarChart data={data}>
                    <XAxis dataKey="time" axisLine={false} tickLine={false} />
                    <Bar dataKey="occupancy" fill="#0d9488" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

const PatientStatistics = () => {
    const mappedData = JSON.parse(localStorage.getItem('mappedData'));
    const noOfPatientsInLast7Days = mappedData.noOfPatientsInLast7Days

    console.log(noOfPatientsInLast7Days)
    const data = [
        { name: 'Mon', patients: parseInt(noOfPatientsInLast7Days[0] , 10) },
        { name: 'Tue', patients:  parseInt(noOfPatientsInLast7Days[1] , 10)},
        { name: 'Wed', patients: parseInt(noOfPatientsInLast7Days[2] , 10) },
        { name: 'Thu', patients: parseInt(noOfPatientsInLast7Days[3] , 10) },
        { name: 'Fri', patients: parseInt(noOfPatientsInLast7Days[4] , 10) },
        { name: 'Sat', patients: parseInt(noOfPatientsInLast7Days[5] , 10) },
        { name: 'Sun', patients: parseInt(noOfPatientsInLast7Days[6] , 10) },
    ];

    return (
        <div className="bg-gradient-to-b from-teal-100 to-white p-2 rounded-lg">
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-semibold">Patient Statistics</h3>
                <button className="bg-white px-2 py-1 rounded-full text-xs flex items-center border border-black">
                    Last 7 Days <ChevronDown size={12} />
                </button>
            </div>
            <ResponsiveContainer width="100%" height={120}>
                <LineChart data={data}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Line type="monotone" dataKey="patients" stroke="#0d9488" />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

const Updates = ({ updates }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    // Limit the number of updates to 4 when collapsed
    const visibleUpdates = isExpanded ? updates : updates.slice(0, 4);

    return (
        <div className="bg-gray-900 text-white rounded-lg bg-gradient-to-b from-teal-100 to-white">
            <h3 className="text-sm font-semibold mb-2 p-2 bg-black rounded">Updates</h3>

            {visibleUpdates.map((update, index) => (
                <div key={index} className="bg-gray-800 p-2  bg-gradient-to-b from-teal-100 to-white">
                    <h4 className="font-semibold text-sm text-black">{update.title}</h4>
                    <p className="text-xs text-black">{update.description}</p>
                </div>
            ))}

            {/* Toggle button */}
            <div
                className="flex justify-center cursor-pointer mt-2"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                {isExpanded ? (
                    <ChevronUp size={20} className="text-gray-300" />
                ) : (
                    <ChevronDown size={20} className="text-gray-300" />
                )}
            </div>
        </div>
    );
};

const Notes = ({ notes }) => (
    <div className="bg-gray-900 text-white p-2 rounded-lg bg-gradient-to-b from-teal-100 to-white min-h-[250px]">
      <h3 className="text-sm font-semibold mb-2 text-black">Notes</h3>
      <ul className="list-disc pl-5 space-y-1 text-xs text-black">
        {notes.map((note, index) => (
          <li key={index}>{note}</li>
        ))}
      </ul>
    </div>
  );

const Home = () => {
    const updates = [
        { title: 'Doctor on leave', description: 'Mr. Kandarpa Jyoti Das, Physiotherapist of IIT Guwahati will not be available for consultation on 26.08.2024 (today) at IITG Hospital.' },
        { title: 'Visiting doctor', description: 'Dr. B S Neog, Part Time Consultant (Psychiatry) will be available for OPD consultation on 19.07.2024 from 9:00 am to 01:00 pm at IITG Hospital instead of 18.07.2024.' },
    ];

    const notes = [
        'Review applications.',
        'Meet with CMO @ 16:00'
    ];




    const fullName = useSelector(state => state.fullName)
    const Age = useSelector(state => state.age)
    const AvailableTime1 = "09:00-12:00"
    const AvailableTime2 = "14:00-17:00"
    const BloodGroup = useSelector(state => state.bloodGroup)
    const Gender = useSelector(state => state.gender)
    const Qualification = useSelector(state => state.degree)
    const position = useSelector(state => state.position)
    const Specialization = useSelector(state => state.specialization)
    const profilePicture = useSelector(state => state.profilePicture)

    return (
        <div className="flex bg-gray-100 min-h-screen">
            <div className="flex-1 p-4 overflow-y-auto">
                <h1 className="text-2xl font-bold mb-2">Welcome {fullName}</h1>
                <p className="text-gray-600 mb-4 text-sm italic">Have a nice day at work.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-4">
                        <DoctorInfo
                            name={`${fullName} (${Qualification})`}
                            specialization={Specialization}
                            role={position}
                            gender={Gender}
                            age={Age}
                            bloodType={BloodGroup}
                            workHours={[AvailableTime1, AvailableTime2]}
                            profilePicture={profilePicture}
                        />
                        <PatientStatistics />
                        <HospitalOccupancy />
                    </div>
                    <div className="space-y-4">
                        <Updates updates={updates} />
                        <Notes notes={notes} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home