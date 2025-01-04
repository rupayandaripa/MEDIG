import React from "react";
import { useNavigate } from "react-router-dom";

const DoctorWeeklySchedule = () => {
  const mappedData = JSON.parse(localStorage.getItem("mappedData"));
  const doctorSchedule = mappedData.otherDoctorDetails;
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const navigate = useNavigate()

  doctorSchedule.sort((a, b) =>
    a.email === mappedData.email ? -1 : b.email === mappedData.email ? 1 : 0
  );

  const navigateBack = () => {
    navigate(-1)
  }

  return (
    <div className="flex justify-center items-center min-h-full bg-gradient-to-b from-teal-100 to-white">
      <div className="bg-gradient-to-b from-teal-100 to-white shadow-lg rounded-lg border overflow-y-scroll h-[80vh] min-w-screen-lg">
        {/* Main Header */}
        <div className="bg-[#0A1929] text-white p-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-center flex-grow">
            Doctor Weekly Schedule
          </h3>
          <button  onClick={navigateBack} className="text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>


        <div className="p-3">
          <div className="flex gap-1">
            {/* Doctor's Name Column Header */}

            <div className="rounded-lg bg-slate-900 p-3 w-96 h-12">
              <h2 className="text-lg font-medium text-white text-center">Doctor's Name</h2>
            </div>


            {/* Days Headers */}
            {days.map((day, index) => (
              <div key={index} className="w-28">
                <div className={`rounded-lg bg-transparent p-3 border border-black column-hover`}>
                  <h2 className="text-center font-medium">{day}</h2>
                </div>
              </div>
            ))}
          </div>

          {/* Content Rows */}
          {doctorSchedule.map((doctor, doctorIndex) => (
            <div key={doctorIndex} className="flex gap-1 mt-1">
              {/* Doctor Info Card */}
              <div className="w-96 rounded-lg bg-transparent p-3 border border-black hover:bg-teal-200">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 overflow-hidden rounded-full">
                    <img
                      src={doctor.profilePicture}
                      alt={doctor.fullName}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium leading-tight">{doctor.fullName}</h3>
                    <p className="text-sm italic text-gray-600 leading-tight">
                      {doctor.specialization}
                    </p>
                  </div>
                  <div className="text-sm text-gray-600">{doctor.cabin || "Visiting Doctor"}</div>
                </div>
              </div>

              {/* Schedule Cards */}
              {days.map((_, dayIndex) => (
                <div key={dayIndex} className="w-28 rounded-lg bg-transparent p-3 border border-black column-">
                  {!doctor.weeklyAvailability[dayIndex] ? (
                    <p className="text-sm font-medium text-red-500 text-center">On Leave</p>
                  ) : doctor.weeklyAvailability[dayIndex] === "-" ? (
                    <p className="text-sm text-center">-</p>
                  ) : doctor.weeklyAvailability[dayIndex] === "Off Duty" ? (
                    <p className="text-sm text-center">Off Duty</p>
                  ) : (
                    <div className="space-y-1 text-center">
                      {doctor.weeklyAvailability[dayIndex]?.split('\n').map((time, timeIndex) => (
                        <p key={timeIndex} className="text-sm leading-tight">
                          {time}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DoctorWeeklySchedule;







