import React, { useEffect , useState } from 'react';
import { useNavigate } from 'react-router-dom';

const DoctorSchedule = () => {
    const navigate = useNavigate()
    const mappedData = JSON.parse(localStorage.getItem('mappedData'));
    const doctors = mappedData.otherDoctorDetails

    doctors.sort((a, b) => (a.email === mappedData.email ? -1 : b.email === mappedData.email ? 1 : 0))

    const [dateTime , setDateTime] = useState(new Date())

    useEffect(() => {
        const timer = setInterval(() => {
            setDateTime(new Date())
        } , 1000)

        return () => clearInterval(timer)
    } , [])

    const formatDate = (date) => {
        const options = {weekday : 'long' , year : 'numeric' , month : 'long' , day : 'numeric'}
        return date.toLocaleDateString('en-GB' , options)
    }

    const formatTime = (date) => {
        return date.toLocaleTimeString('en-GB')
    }

    const navigateToWeeklySchedule = () => {
        navigate('scheduleTable')
    }

    // const doctors = [
    //     {
    //         name: "Dr. Kriti Paudel",
    //         credentials: "MBBS,MD",
    //         specialty: "Cardiologist",
    //         position: "Medical Officer",
    //         morning: "09:00-12:00",
    //         afternoon: "14:00-17:00",
    //         cabin: "05",
    //         status: "Available",
    //         image: "/api/placeholder/48/48"
    //     },
        
    // ];

    return (
        <div className="max-w-full p-4 bg-gradient-to-b from-teal-100 to-white min-h-full scrollbar-webkit scrollbar-thin">
            <div className="bg-[#0A1929] text-white p-4 rounded-t-lg mb-2 h-[50px]">
                <h1 className="text-s font-semibold flex justify-center">Doctor Timings</h1>
            </div>

            <div className="flex justify-between items-center p-2 mb-1">
                <div className="flex justify-between items-center space-x-2 bg-white rounded-md border px-3 py-2 border-black w-[700px] border-2">
                    <span className="text-black-500 font-normal">(Today)</span>
                    <span className='text-black-700 font-semibold'>{formatDate(dateTime)}</span>
                    <span className='text-black-700 font-semibold'>{formatTime(dateTime)}</span>
                </div>
                <button onClick={navigateToWeeklySchedule} className="bg-teal-700 text-white px-4 py-2 rounded-md hover:bg-teal-800 w-[420px] shadow-2xl border-black border-2">
                    View Weekly Schedule
                </button>
            </div>

            <div className="space-y-2">
                {doctors.map((doctor, index) => (
                    <div
                        key={index}
                        className="flex items-center p-4 border rounded-lg bg-gradient-to-b from-teal-50 to-white hover:from-teal-100 hover:to-white hover:border-black"
                        >
                        <img
                            src={doctor.profilePicture}
                            alt={doctor.fullName}
                            className="w-12 h-12 rounded-full mr-4"
                        />

                        <div className="flex-1 grid grid-cols-4 gap-4 items-center">
                            <div>
                                <h2 className="font-semibold">{doctor.fullName} ({doctor.degree})</h2>
                                <p className="text-gray-600 text-sm italic">{doctor.specialization}</p>
                                {doctor.position && (
                                    <p className="text-black-700 font-semibold text-sm">{doctor.position}</p>
                                )}
                            </div>

                            <div className="text-center">
                                {doctor.availableOrNot === "false" ? (
                                    <span className="text-black-700 font-semibold">On Leave</span>
                                ) : (
                                    <>
                                        <div className='text-black-700 font-semibold'>{"09:00-12:00" || "-"}</div>
                                        <br />
                                        <div className='text-black-700 font-semibold'>{"14:00-17:00" || "-"}</div>
                                    </>
                                )}
                            </div>

                            <div className="text-center">
                                <span className='text-black-700 font-semibold'>Cabin</span>
                                <div className="font-semibold">05</div>
                            </div>

                            <div className="text-right">
                                <span className={`px-3 py-1 rounded-full ${doctor.availableOrNot === "true"
                                        ? "text-green-700"
                                        : doctor.availableOrNot === "false"
                                            ? "text-red-700"
                                            : "text-gray-700"
                                    } font-semibold`}>
                                    {doctor.availableOrNot == "false" ? "Not Available" : "Available"}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};


export default DoctorSchedule;






