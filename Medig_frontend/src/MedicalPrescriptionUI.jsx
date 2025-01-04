import React, { useRef, useState } from 'react';
import { Sun, Sun as SunDim, Moon } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import iitgLogo from '/iitgLogo.png'

const PrescriptionUI = () => {

    const prescriptionRef = useRef(null)
    //const [age, setAge] = useState('')

    const date = new Date()

    const generatePDF = async () => {
        const prescription = prescriptionRef.current
        const canvas = await html2canvas(prescription)
        const imgData = canvas.toDataURL('public/iitgLogo.png')
        const pdf = new jsPDF('p', 'mm', 'a4')
        const pdfWidth = pdf.internal.pageSize.getWidth()
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
        //pdf.save('prescription.pdf')

        const pdfBlob = pdf.output('blob')
        return pdfBlob

    }

    const handleSendToPharmacy = async () => {
        try {

            const mappedData = JSON.parse(localStorage.getItem('mappedData'));

            const patientDetails = JSON.parse(localStorage.getItem("patientDetails"));
            // Generate and send email with the updated token
            const formData = new FormData();
            const pdfBlob = await generatePDF();
            formData.append("prescription", pdfBlob, "prescription.pdf");
            formData.append("email", patientDetails.email);
            formData.append("rollNumber", patientDetails.rollNumber || "");
    
            const emailResponse = await fetch("http://localhost:8000/api/v0/users/doctor/send-mail", {
                method: "POST",
                headers: { Authorization: `Bearer ${mappedData.accessToken}` },
                body: formData,
            });
    
            if (!emailResponse.ok) {
                const errorData = await emailResponse.json();
                console.error("Failed to send email:", errorData.message);
                alert("Failed to send the email to the pharmacy.");
                return;
            }
    
            const emailData = await emailResponse.json();
            console.log("Email sent successfully:", emailData);
            alert("Email sent successfully to the pharmacy!");
        } catch (error) {
            console.error("Error in the process:", error);
            alert("An error occurred. Please try again.");
        }
    };
    
    
    
    



    const prescription = JSON.parse(localStorage.getItem('prescription'))
    const mappedData = JSON.parse(localStorage.getItem('mappedData'))
    const patientDetails = JSON.parse(localStorage.getItem('patientDetails'));

    const prescriptionData = prescription.medicines
    const comments = prescription.comments

    const FrequencyIcons = ({ frequency }) => (
        <div className="flex gap-2">
            <Sun className={frequency.morning ? "text-yellow-500" : "text-gray-300"} size={20} />
            <SunDim className={frequency.afternoon ? "text-yellow-500" : "text-gray-300"} size={20} />
            <Moon className={frequency.night ? "text-blue-500" : "text-gray-300"} size={20} />
        </div>
    );

    const formatDate = (date) => {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
        return date.toLocaleDateString('en-GB', options)
    }

    const formatTime = (date) => {
        return date.toLocaleTimeString('en-GB')
    }

    function parseDate(dateString) {
        // Extract parts of the date string
        const [day, month, year] = dateString.split(" ");

        return Number(year)
    }

    function calculateAge(birthDateString) {
        const cleanedBirthDateString = birthDateString.replace(/(\d+)(st|nd|rd|th)/, "$1");
        const birthDate = parseDate(cleanedBirthDateString);

        //console.log("BirthDate: " , birthDate)

        if (isNaN(birthDate)) {
            throw new Error("Invalid birth date format");
        }

        let age = date.getFullYear() - birthDate

        //console.log("Age type: " , typeof(age))

        return age

    }

    //setAge(calculateAge(patientDetails.dateOfBirth).toString)

    return (
        <>
            <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-lg" ref={prescriptionRef}>
                <div className="bg-teal-800 text-white p-4 rounded-t-lg">
                    <div className="flex items-center gap-4">
                        <img src={iitgLogo} alt="Hospital Logo" className="w-12 h-12 rounded-full" />
                        <div>
                            <h1 className="text-xl font-bold">Indian Institute of Technology Guwahati Hospital</h1>
                            <p className="text-sm">Guwahati-781039, Assam</p>
                            <p className="text-sm">Phone:2582097(Emergency) E-mail:medsec@iitg.ac.in</p>
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="space-y-2">
                            <p><span className="font-semibold">Roll No.: </span>{patientDetails.rollNumber}</p>
                            <p><span className="font-semibold">Name: </span>{patientDetails.fullName}</p>
                            <p><span className="font-semibold">Gender: </span>{patientDetails.gender}</p>
                            <p><span className="font-semibold">DoB: </span>{patientDetails.dateOfBirth} ({calculateAge(patientDetails.dateOfBirth)} Y)</p>
                        </div>
                        <div className="space-y-2">
                            <p><span className="font-semibold">Token No.: </span>29</p>
                            <p><span className="font-semibold">Consultant: </span>{mappedData.fullName} ({mappedData.degree})</p>
                            <p><span className="font-semibold">Date/Time: </span>{formatDate(date)} / {formatTime(date)}</p>
                            <p><span className="font-semibold">Prescription Id: </span>ABC-12345</p>
                        </div>
                    </div>

                    <h2 className="text-xl font-bold mb-4">℞</h2>
                    <table className="w-full border-collapse">
                        <thead className="bg-teal-700 text-white">
                            <tr>
                                <th className="p-2 text-left">Sl. No.</th>
                                <th className="p-2 text-left">Medicine</th>
                                <th className="p-2 text-left">Quantity</th>
                                <th className="p-2 text-left">Frequency</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.entries(prescriptionData).map(([index, med]) => (
                                med.isActive && med.medicine && (
                                    <tr key={index} className="border-b">
                                        <td className="p-2">{parseInt(index) + 1}</td>
                                        <td className="p-2">{med.medicine}</td>
                                        <td className="p-2">{med.quantity}</td>
                                        <td className="p-2">
                                            <FrequencyIcons frequency={med.frequency} />
                                        </td>
                                    </tr>
                                )
                            ))}
                        </tbody>
                    </table>

                    <div className="mt-6 space-y-2">
                        {Object.entries(comments).map(([index, comment]) => (
                            <p className="flex items-center gap-2" key={index}>
                                <span className="text-teal-600">•</span> {comment.text}
                            </p>
                        ))}



                    </div>

                    <div className="mt-8 text-right">
                        <p className="text-sm text-gray-600">Digitally signed by</p>
                        <p className="font-semibold">{mappedData.fullName} ({mappedData.degree})</p>
                        <p className="text-sm text-gray-600">{formatDate(date)} {formatTime(date)}</p>
                    </div>
                </div>

                <button className="w-full mt-6 bg-teal-700 text-white py-2 rounded-lg hover:bg-teal-800">
                    Close
                </button>
            </div>

            <button
                onClick={handleSendToPharmacy}
                className='w-full mt-4 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700'
            >
                Send to Pharmacy
            </button>
        </>

    );
};

export default PrescriptionUI;