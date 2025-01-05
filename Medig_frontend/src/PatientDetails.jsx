import React, { useState, useRef } from 'react';
import { Sun, Moon, Sunrise } from 'lucide-react';
import { useNavigate } from 'react-router-dom';



const PatientDetails = () => {


  const navigate = useNavigate()
  const patientDetails = JSON.parse(localStorage.getItem('patientDetails'));
  const [isExpanded, setIsExpanded] = useState(true);
  const [isExpanded1, setIsExpanded1] = useState(false);
  const [isExpanded2, setIsExpanded2] = useState(false);

  const [isEditingModeOn, setIsEditingModeOn] = useState(true)

  const [medicines, setMedicines] = useState(
    Array(8)
      .fill()
      .map(() => ({
        medicine: "",
        quantity: "",
        frequency: { morning: false, afternoon: false, night: false }, // Updated to track all periods
        isActive: false,
      }))
  );

  // Activate first row by default
  medicines[0].isActive = true;

  const handleInputChange = (index, field, value) => {
    const newMedicines = [...medicines];
    newMedicines[index][field] = value;

    // Activate next row if the current row has input
    if (value && index + 1 < medicines.length) {
      newMedicines[index + 1].isActive = true;
    }

    setMedicines(newMedicines);
  };

  const handleFrequencyClick = (index, period) => {
    const newMedicines = [...medicines];
    newMedicines[index].frequency[period] = !newMedicines[index].frequency[period]; // Toggle the selected period
    setMedicines(newMedicines);

  };


  const [comments, setComments] = useState([{ id: 1, text: '' }]);
  const activeInputRef = useRef(null);

  const handleClick = () => {
    if (!isExpanded2) {
      setIsExpanded2(true);
      // Focus the input after expansion
      setTimeout(() => {
        activeInputRef.current?.focus();
      }, 100);
    }
  };

  const handleKeyDown = (e, index, comment) => {
    if (e.key === 'Enter' && comment.text.trim() !== '') {
      e.preventDefault();
      // Add new bullet point
      const newComments = [...comments];
      newComments.splice(index + 1, 0, { id: Date.now(), text: '' });
      setComments(newComments);
      // Focus new input after render
      setTimeout(() => {
        const inputs = document.querySelectorAll('.comment-input');
        inputs[index + 1]?.focus();
      }, 0);
    } else if (e.key === 'Backspace' && comment.text === '' && comments.length > 1) {
      e.preventDefault();
      // Remove empty bullet point
      const newComments = comments.filter((_, i) => i !== index);
      setComments(newComments);
      // Focus previous input
      setTimeout(() => {
        const inputs = document.querySelectorAll('.comment-input');
        inputs[index - 1]?.focus();
      }, 0);
    }
  };

  const handleChange = (index, value) => {
    const newComments = [...comments];
    newComments[index].text = value;
    setComments(newComments);
  };

  const handleGenerateReceipt = () => {
    navigate('pharmacyConfirmation')
    localStorage.setItem('prescription', JSON.stringify({ medicines: medicines, comments: comments }))
  }

  //console.log("Medicines: ", medicines)

  return (

    <div className="w-full h-full bg-gradient-to-br from-teal-50 to-white p-3">

      {isEditingModeOn ?

        <div className="grid grid-cols-13 grid-rows-13 gap-3 min-w-full bg-transparent">
          {/* Patient Info Section */}
          {isEditingModeOn ?
            <div className={`bg-transparent transition-all duration-300 ease-in-out ${!isExpanded ? 'row-start-8 row-end-13 mt-auto col-start-1 col-end-5' : 'row-start-1 row-end-13 col-start-1 col-end-4'
              }`}>
              <div className={`h-full transition-all duration-300 ${!isExpanded
                ? 'bg-gray-900 text-white p-3 rounded-lg flex items-center gap-4'
                : 'bg-white rounded-lg p-4 space-y-4'
                }`}>
                {!isExpanded ? (
                  // Collapsed View
                  <>
                    <div className="flex-1" onClick={() => { setIsExpanded(true); setIsExpanded1(false); setIsExpanded2(false) }}>
                      <div className="text-lg font-bold">{patientDetails.rollNumber}</div>
                      <div className="text-sm">{patientDetails.fullName} ({patientDetails.age} Y)</div>
                      <div className="text-sm opacity-75">{patientDetails.gender}</div>
                      <div className="text-sm text-red-400">{patientDetails.bloodGroup}</div>
                    </div>
                    <div className="h-16 w-16 rounded-lg overflow-hidden">
                      <img
                        src={patientDetails.profilePicture}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </>
                ) : (
                  // Expanded View
                  <>
                    {/* ID Number */}
                    <div className="bg-teal-50 p-2 rounded-lg border border-teal-400">
                      <p className="text-gray-700 font-mono text-sm">{patientDetails.rollNumber}</p>
                    </div>

                    {/* Profile Info */}
                    <div className="bg-teal-50 p-4 rounded-lg space-y-4 border border-teal-400">
                      <div className="flex space-x-4">
                        <div className="w-24 h-24 overflow-hidden rounded-full">
                          <img
                            src={patientDetails.profilePicture}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="space-y-2">
                          <h2 className="text-sm font-semibold text-gray-800">{patientDetails.fullName}</h2>
                          <p className="text-gray-600 text-sm">{patientDetails.dateOfBirth}</p>
                          <p className="text-gray-600 text-sm">{patientDetails.gender}</p>
                          <p className="text-gray-600 text-sm">Blood Group- {patientDetails.bloodGroup}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex">
                          <span className="font-medium text-teal-700 text-sm">Allergies</span>
                          <span className="ml-2 text-teal-900 text-sm">:</span>
                          <span className="ml-2 text-teal-900 text-sm">
                            {patientDetails.allergies.length > 0 ? patientDetails.allergies.join(", ") : "None"}
                          </span>
                        </div>
                        <div className="flex">
                          <span className="font-medium text-teal-700 text-sm">Conditions</span>
                          <span className="ml-2 text-teal-900 text-sm">:</span>
                          <span className="ml-2 text-teal-900 text-sm">
                            {patientDetails.conditions.length > 0 ? patientDetails.conditions.join(", ") : "None"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div className="bg-teal-50 p-4 rounded-lg space-y-2 border border-teal-400">
                      <div className="flex">
                        <span className="text-gray-600 w-24 text-sm">Contact</span>
                        <span className="text-gray-800 text-sm">: {patientDetails.phoneNumber}</span>
                      </div>
                      <div className="flex">
                        <span className="text-gray-600 w-24 text-sm">Emergency</span>
                        <span className="text-gray-800 text-sm">: {patientDetails.emergencyNumber}</span>
                      </div>
                      <div className="flex">
                        <span className="text-gray-600 w-24 text-sm">Hostel</span>
                        <span className="text-gray-800 text-sm">: {patientDetails.hostel}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2">
                      <button 
                      className="w-full bg-gray-900 text-white p-3 rounded-lg hover:bg-gray-800 transition-colors text-sm"
                      onClick={() => {navigate('medicalHistory')}}
                      >
                        View medical history
                      </button>
                      <button
                        className="w-full bg-gray-900 text-white p-3 rounded-lg hover:bg-gray-800 transition-colors text-sm"
                        onClick={() => { navigate('medicalDocuments') }}
                      >
                        View medical documents
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
            :
            ""
          }


          {/* Medicine and Comments Section */}
          {isExpanded2 ?

            <div className={`bg-transparent rounded-lg transition-all duration-300 ease-in-out col-start-1 col-end-5 row-start-1 row-end-8`}>
              <div className='bg-transparent overflow-hidden cursor-pointer rounded-lg'>

                <table className="w-full">
                  <thead className="bg-gray-900 text-white">
                    <tr className='border border-black'>
                      <th className="px-4 py-3 text-center">Medicine</th>
                    </tr>
                  </thead>
                  <tbody>
                    {medicines.map((row, index) => (
                      <tr key={index} className="border border-black">
                        {isExpanded && (
                          <td className="px-4 py-2 text-gray-600">{index + 1}</td>
                        )}
                        <td className="px-4 py-2">
                          <input
                            type="text"
                            placeholder={index === 0 ? "Enter Medicine..." : ""}
                            value={row.medicine}
                            onChange={(e) => handleInputChange(index, "medicine", e.target.value)}
                            className="w-full bg-transparent placeholder-gray-400 focus:outline-none text-sm"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>


              </div>
            </div> :

            <div className={`bg-transparent rounded-lg transition-all duration-300 ease-in-out ${isExpanded1 ? 'col-start-1 col-end-13 row-start-1 row-end-7' : 'col-start-5 col-end-13 row-start-1 row-end-8'
              }`}>
              {/* Medicine Table */}
              <div
                className="bg-transparent overflow-hidden cursor-pointer rounded-lg"
                onClick={() => { setIsExpanded1(true); setIsExpanded(false) }}
              >
                <table className="w-full">
                  <thead className="bg-gray-900 text-white">
                    <tr className='border border-black'>
                      {isExpanded && <th className="px-4 py-3 text-center w-16">Sl. No.</th>}
                      <th className="px-4 py-3 text-center">Medicine</th>
                      <th className="px-4 py-3 text-center">Quantity</th>
                      <th className="px-4 py-3 text-center">Frequency</th>
                    </tr>
                  </thead>
                  <tbody>
                    {medicines.map((row, index) => (
                      <tr key={index} className="border border-black">
                        {isExpanded && (
                          <td className="px-4 py-2 text-gray-600">{index + 1}</td>
                        )}
                        <td className="px-4 py-2">
                          <input
                            type="text"
                            placeholder={index === 0 ? "Enter Medicine..." : ""}
                            value={row.medicine}
                            onChange={(e) => handleInputChange(index, "medicine", e.target.value)}
                            className="w-full bg-transparent placeholder-gray-400 focus:outline-none text-sm"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="text"
                            value={row.quantity}
                            onChange={(e) => handleInputChange(index, "quantity", e.target.value)}
                            className="w-full bg-transparent focus:outline-none text-sm text-center"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <div className="flex justify-center space-x-2">
                            <button
                              onClick={() => handleFrequencyClick(index, "morning")}
                              className={`p-1 rounded ${row.frequency.morning ? "bg-yellow-500 text-white" : "text-gray-400"}`}
                            >
                              <Sunrise size={16} />
                            </button>
                            <button
                              onClick={() => handleFrequencyClick(index, "afternoon")}
                              className={`p-1 rounded ${row.frequency.afternoon ? "bg-yellow-500 text-white" : "text-gray-400"}`}
                            >
                              <Sun size={16} />
                            </button>
                            <button
                              onClick={() => handleFrequencyClick(index, "night")}
                              className={`p-1 rounded ${row.frequency.night ? "bg-blue-500 text-white" : "text-gray-400"}`}
                            >
                              <Moon size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          }




          {/* Comments Section */}
          <div className={`bg-white align-right ${isExpanded2 ? "col-start-6 col-end-13" : "col-start-5 col-end-13"} ${isExpanded2 ? "row-start-1 row-end-8" : "row-start-8 row-end-12"} border border-black rounded-lg`}>
            <div className="h-full bg-transparent rounded-lg shadow-sm p-4" onClick={() => { setIsExpanded(false); handleClick() }}>

              {comments.map((comment, index) => (
                <div key={comment.id} className='flex items-start gap-2'>
                  <span className="mt-2 text-gray-600">•</span>
                  <textarea
                    value={comment.text}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, index, comment)}
                    placeholder="Additional comments..."
                    className="bg-transparent resize-none focus:outline-none text-gray-600 placeholder-gray-400 comment-input w-full"
                    rows={3}
                  />
                </div>
              ))}


            </div>

            {isExpanded2 ?
              <div className="w-full flex justify-center">
                <button className="bg-green-700 hover:bg-green-800 text-white font-medium px-8 py-2 rounded-lg shadow-md transition-colors duration-200 mt-4"
                  onClick={() => { setIsEditingModeOn(false) }}
                >
                  Save
                </button>

              </div>
              :
              ""
            }

          </div>




        </div>
        :


        <div className="grid grid-cols-13 grid-rows-13 gap-3 min-w-full bg-transparent">


          <div className={`bg-transparent rounded-lg transition-all duration-300 ease-in-out col-start-1 col-end-2 row-start-1 row-end-6`}>
            {/* Medicine Table */}
            <div
              className="bg-transparent overflow-hidden cursor-pointer rounded-lg"
            // onClick={() => { setIsExpanded1(true); setIsExpanded(false) }}
            >
              <table className="w-full">
                <thead className="bg-gray-900 text-white">
                  <tr className='border border-black'>
                    {isExpanded && <th className="px-4 py-3 text-center w-16">Sl. No.</th>}
                    <th className="px-4 py-3 text-center">Medicine</th>
                    <th className="px-4 py-3 text-center">Quantity</th>
                    <th className="px-4 py-3 text-center">Frequency</th>
                  </tr>
                </thead>
                <tbody>
                  {medicines.map((row, index) => (
                    <tr key={index} className="border border-black">
                      {isExpanded && (
                        <td className="px-4 py-2 text-gray-600">{index + 1}</td>
                      )}
                      <td className="px-4 py-2">
                        <input
                          type="text"
                          placeholder={index === 0 ? "Enter Medicine..." : ""}
                          value={row.medicine}
                          onChange={(e) => handleInputChange(index, "medicine", e.target.value)}
                          className="w-full bg-transparent placeholder-gray-400 focus:outline-none text-sm"
                          disabled={true}
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="text"
                          value={row.quantity}
                          onChange={(e) => handleInputChange(index, "quantity", e.target.value)}
                          className="w-full bg-transparent focus:outline-none text-sm text-center"
                          disabled={true}
                        />
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex justify-center space-x-2">
                          <button
                            onClick={() => handleFrequencyClick(index, "morning")}
                            className={`p-1 rounded ${row.frequency.morning ? "bg-yellow-500 text-white" : "text-gray-400"}`}
                            disabled={true}
                          >
                            <Sunrise size={16} />
                          </button>
                          <button
                            onClick={() => handleFrequencyClick(index, "afternoon")}
                            className={`p-1 rounded ${row.frequency.afternoon ? "bg-yellow-500 text-white" : "text-gray-400"}`}
                            disabled={true}
                          >
                            <Sun size={16} />
                          </button>
                          <button
                            onClick={() => handleFrequencyClick(index, "night")}
                            className={`p-1 rounded ${row.frequency.night ? "bg-blue-500 text-white" : "text-gray-400"}`}
                            disabled={true}
                          >
                            <Moon size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className={`bg-white align-right col-start-2 col-end-13 row-start-1 row-end-6 border border-black rounded-lg`}>
            <div className="h-full bg-transparent rounded-lg shadow-sm p-4" >
              {comments.map((comment, index) => (
                <div key={comment.id} className='flex items-start gap-2'>
                  <span className="mt-2 text-gray-600">•</span>
                  <textarea
                    value={comment.text}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, index, comment)}
                    placeholder="Additional comments..."
                    className="bg-transparent resize-none focus:outline-none text-gray-600 placeholder-gray-400 comment-input w-full"
                    rows={3}
                    disabled={true}
                  />
                </div>
              ))}
            </div>


          </div>


          <div className="col-start-1 col-end-13 flex justify-center mt-8 gap-4 px-4">
            <button
              className="w-1/2 bg-gray-900 hover:bg-gray-800 text-white font-medium px-6 py-3 rounded-lg shadow-lg transition-colors duration-200 max-w-md"
              onClick={() => { setIsEditingModeOn(true) }}
            >
              Edit Prescription
            </button>
            <button
              className="w-1/2 bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-3 rounded-lg shadow-lg transition-colors duration-200 max-w-md"
              onClick={handleGenerateReceipt}
            >
              Generate Receipt
            </button>
          </div>




        </div>
      }



    </div>


  )

}





export default PatientDetails

