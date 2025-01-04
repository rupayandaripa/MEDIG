import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/users.model.js";
import { uploadOnCloudinary, deleteFromCloudinary, uploadFileInAFolder } from '../utils/cloudinary.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import jwt from 'jsonwebtoken'
import { Patient } from "../models/patients.model.js";
import { Doctor } from "../models/doctors.model.js";
import nodemailer from 'nodemailer'
import 'isomorphic-fetch';
//import fs from 'fs/promises';
import { scheduler } from "timers/promises";
import { google } from 'googleapis'
import path from "path";
import fs from 'fs'



const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }
    }
    catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access token")
    }
}

const registerUser = asyncHandler(async (req, res) => {
    const { fullName, email, password, gender, role, ...additionalFields } = req.body


    if (
        [fullName, email, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({
        $or: [{ email }]
    })

    if (existedUser) {
        throw new ApiError(409, "User with email already exists")
    }

    let profilePictureLocalPath
    if (req.files && Array.isArray(req.files.profilePicture) && req.files.profilePicture.length > 0) {
        profilePictureLocalPath = req.files.profilePicture[0].path
    }

    const profilePicture = await uploadOnCloudinary(profilePictureLocalPath)



    //await user.save()

    let entityId

    if (role == "Doctor") {
        const { degree, specialization, position, age, bloodGroup, availableTime, noOfPatientsInLast7Days, availableOrNot, weeklyAvailability } = additionalFields

        const doctor = await Doctor.create({
            degree,
            specialization,
            position,
            age,
            bloodGroup,
            availableTime,
            noOfPatientsInLast7Days,
            availableOrNot,
            weeklyAvailability
        })

        entityId = doctor._id
    }
    else if (role == 'Patient') {
        const { dateOfBirth, rollNumber, bloodGroup, allergies, conditions, medicalDocuments, medicalHistory, phoneNumber, emergencyNumber, hostel } = additionalFields
        const patient = await Patient.create({
            email,
            phoneNumber,
            emergencyNumber,
            hostel,
            dateOfBirth,
            rollNumber,
            bloodGroup,
            allergies,
            conditions,
            medicalDocuments,
            medicalHistory,
        })

        entityId = patient._id
    }
    else {
        throw new ApiError(400, "Invalid role specified")
    }

    const user = await User.create({
        entityId,
        email,
        fullName,
        profilePicture: profilePicture?.url || "",
        password,
        gender,
        role
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    )
})

const loginUser = asyncHandler(async (req, res) => {

    // console.log("Request headers:", req.headers);
    // console.log("Content-Type:", req.headers['content-type']);
    // console.log("Full request body:", req.body);

    const { email, password } = req.body
    //console.log("Extracted values:", {email, fullName, password});

    if (!email) {
        throw new ApiError(400, "username or password is required")
    }

    const user = await User.findOne({
        $or: [{ email }]
    })

    if (!user) {
        throw new ApiError(404, "User does not exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid User Credentials")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true,
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken
                },
                "User logged In Successfully"
            )
        )
})

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out Successfully"))
})

const checkRole = (role) => {
    return (req, res, next) => {
        //console.log(req.user.role , " " , role)
        if (!req.user || req.user.role !== role) {
            return res
                .status(403)
                .json(new ApiError(403, "Access Denied!!"))
        }



        next()
    }
}

const refreshAccessToken = asyncHandler(async (req, res) => {


    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request")
    }

    let decodedToken;
    try {
        decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    } catch (error) {
        throw new ApiError(401, "Invalid or expired refresh token");
    }

    const user = await User.findById(decodedToken?._id)

    if (!user) {
        throw new ApiError(401, "Invalid Refresh Token")
    }

    console.log("Incoming refreshToken: ", incomingRefreshToken)
    console.log("Saved refreshToken: ", user?.refreshToken)
    if (incomingRefreshToken !== user?.refreshToken) {
        throw new ApiError(401, "Refresh token is expired or used")
    }



    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)

    console.log("New refreshToken: ", refreshToken);

    await User.findByIdAndUpdate(
        user?._id,
        {
            $set: {
                refreshToken: refreshToken
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }


    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                { accessToken, refreshToken },
                "Access token refreshed successfully"
            )
        )
})

const changeCurrentPassword = asyncHandler(async (req, res) => {
    console.log(req.body)
    const { oldPassword, newPassword } = req.body

    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid Password")
    }

    user.password = newPassword

    await user.save({ validateBeforeSave: false })

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password changed Successfully"))
})


const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(new ApiResponse(200, req.user, "User details fetched successfully"))
})

const getDoctorDetails = asyncHandler(async (req, res) => {
    const entityId = req.user.entityId

    const response = await Doctor.findById(entityId)

    if (!response) {
        throw new ApiError(404, "Doctor not found")
    }

    return res
        .status(201)
        .json(new ApiResponse(201, response, "Data fetched successfully"))
})

const updateUserProfilePicture = asyncHandler(async (req, res) => {
    const profilePictureLocalPath = req.file?.path
    console.log(req.user)
    const profilePictureToBeDestroyed = req.user.profilePicture


    if (!profilePictureLocalPath) {
        throw new ApiError(400, "Profile picture file is missing")
    }

    const profilePicture = await uploadOnCloudinary(profilePictureLocalPath)

    if (!profilePicture) {
        throw new ApiError(400, "Error while uploading profile picture")
    }

    console.log("Profile picture to be deleted: ", profilePictureToBeDestroyed)

    const destroyResult = await deleteFromCloudinary(profilePictureToBeDestroyed)

    console.log(destroyResult)

    if (!destroyResult) {
        throw new ApiError(400, "Error while deleting old profile picture")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                profilePicture: profilePicture.url
            }
        },
        {
            new: true
        }
    ).select("-password")

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Profile picture updated successfully"))

})

const uploadDocument = asyncHandler(async (req, res) => {
    const { folderName } = req.body
    const fileToBeUploaded = req.file?.path

    if (!fileToBeUploaded) {
        throw new ApiError(400, "No file uploaded")
    }

    const uploadedFile = await uploadFileInAFolder(fileToBeUploaded, folderName)

    console.log("Uploaded File: ", uploadedFile)

    if (!uploadedFile) {
        throw new ApiError(400, "Error while uploading file in a folder")
    }

    const patient = await Patient.findById(req.user.entityId)
    if (!patient) {
        throw new ApiError(404, "Patient not found")
    }

    const medicalDocuments = patient.medicalDocuments || new Map();
    const existingFiles = medicalDocuments.get(folderName) || [];

    existingFiles.push(uploadedFile.url)

    medicalDocuments.set(folderName, existingFiles)

    patient.medicalDocuments = medicalDocuments
    const response = await patient.save()

    if (!response) {
        throw new ApiError(400, "Error while updating document library")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, patient, "Document uploaded and medical documents updated successfully"))

})

const uploadPrescription = asyncHandler(async (req, res) => {
    const timestamp = Date.now()
    const date = new Date(timestamp)

    const day = date.getDate().toString().padStart(2, '0')
    const month = date.toLocaleString('en-US', { month: 'long' })
    const year = date.getFullYear()

    const folderName = `${day} ${month} ${year}`

    const fileToBeUploaded = req.file?.path
    const { rollNumber } = req.body

    if (!fileToBeUploaded) {
        throw new ApiError(400, "No file uploaded")
    }

    const uploadedFile = await uploadFileInAFolder(fileToBeUploaded, folderName)

    if (!uploadedFile) {
        throw new ApiError(400, "Error while uploading file in a folder")
    }

    //console.log(rollNumber)
    const patient = await Patient.findOne({ rollNumber: rollNumber })

    if (!patient) {
        throw new ApiError(404, "Student not found")
    }

    const medicalHistory = patient.medicalHistory || new Map();
    const existingFiles = medicalHistory.get(folderName) || [];

    existingFiles.push(uploadedFile.url)

    medicalHistory.set(folderName, existingFiles)

    patient.medicalHistory = medicalHistory
    const response = await patient.save()

    if (!response) {
        throw new ApiError(400, "Error while updating document library")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, patient, "Successfully updated medical history"))

})

const sendEmailWithAttachment = asyncHandler(async (req, res) => {
    const  accessToken  = JSON.parse(localStorage.getItem('accessToken'))
    const patientDetails = JSON.parse(localStorage.getItem('patientDetails'));
    
    const prescription = req?.file.path

    //console.log("Access token", accessToken)
    console.log("User email: ", req.user.email)

    if (!accessToken) {
        throw new ApiError(401, "User is not authenticated");
    }

    const transporter = nodemailer.createTransport({
        host: "smtp.office365.com",
        port: 587,
        secure: false,
        auth: {
            type: "OAuth2",
            user: req.user.email,
            accessToken: accessToken,
            clientId: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
            //refreshToken: req.session.refreshToken || undefined
        },
        logger: true,
        debug: true
    });

    const mailOptions = {
        from: req.user.email,
        to: /*process.env.RECEIPIENT_EMAIL*/ receipientEmail,
        replyTo: req.user.email,
        subject: `Prescription for ${req.body.rollNumber}`,
        text: "Find the prescription attached",
        attachments: [
            {
                path: prescription,
            },
        ],
    };

    const info = await transporter.sendMail(mailOptions);

    if (info && info.rejected && info.rejected.length > 0) {
        throw new ApiError(500, `Failed to send email: ${info.rejected.join(', ')}`);
    }

    return res.status(201).json(new ApiResponse(201, info, "Mail sent"));
});


const sendEmailWithAttachment1 = asyncHandler(async (req, res) => {
    const { accessToken } = req.body;
    const prescription = req?.file;

    if (!accessToken) {
        throw new ApiError(401, "User is not authenticated");
    }

    try {
        // Initialize Microsoft Graph client
        const client = Client.init({
            authProvider: (done) => {
                done(null, accessToken);
            }
        });

        // Read file and convert to base64
        const fileBuffer = await fs.promises.readFile(prescription.path);
        const base64File = fileBuffer.toString('base64');

        // Prepare email
        const email = {
            message: {
                subject: `Prescription for ${req.body.rollNumber}`,
                body: {
                    contentType: 'Text',
                    content: 'Find the prescription attached'
                },
                toRecipients: [
                    {
                        emailAddress: {
                            address: process.env.RECEIPIENT_EMAIL
                        }
                    }
                ],
                from: {
                    emailAddress: {
                        address: req.user.email
                    }
                },
                replyTo: [
                    {
                        emailAddress: {
                            address: req.user.email
                        }
                    }
                ],
                attachments: [
                    {
                        '@odata.type': '#microsoft.graph.fileAttachment',
                        name: prescription.originalname,
                        contentType: prescription.mimetype,
                        contentBytes: base64File
                    }
                ]
            }
        };


        // Send email using Microsoft Graph
        const info = await client.api('/me/sendMail')
            .post(email);

        if (!info) {
            throw new ApiError(500, "Email not sent");
        }

        // Delete the temporary file after sending
        await fs.promises.unlink(prescription.path);

        return res.status(201).json(new ApiResponse(201, info, "Mail sent"));

    } catch (error) {
        // Clean up the file in case of error
        if (prescription?.path) {
            try {
                await fs.promises.unlink(prescription.path);
            } catch (unlinkError) {
                console.error('Error deleting file:', unlinkError);
            }
        }

        console.error('Error sending email:', error);
        throw new ApiError(500, error?.message || "Failed to send email");
    }
});

const sendEmailFromMediGId = asyncHandler(async (req, res) => {
    try {
        // Ensure patient details are sent from the frontend
        const { email: receipientEmail, rollNumber } = req.body;

        if (!receipientEmail) {
            throw new ApiError(400, "Recipient email is required");
        }

        if (!req.file) {
            throw new ApiError(400, "Prescription file is missing");
        }

        // Set up Nodemailer transporter
        const transporter = nodemailer.createTransport({
            host: "smtp.office365.com",
            port: 587,
            secure: false,
            auth: {
                user: process.env.MEDIG_EMAIL_ID,
                pass: process.env.MEDIG_PASSWORD,
            },
        });

        // Define mail options
        const mailOptions = {
            from: `${req.user.name || "MediG"} <${process.env.MEDIG_EMAIL_ID}>`,
            to: receipientEmail,
            replyTo: req.user.email || process.env.MEDIG_EMAIL_ID,
            subject: `Prescription for ${rollNumber || "the patient"}`,
            text: "Find the prescription attached",
            attachments: [
                {
                    path: req.file.path,
                },
            ],
        };

        // Send email
        const info = await transporter.sendMail(mailOptions);

        if (!info) {
            throw new ApiError(500, "Failed to send the email");
        }

        return res.status(200).json(new ApiResponse(200, info, "Mail sent successfully"));
    } catch (error) {
        console.error("Error sending email:", error);
        throw new ApiError(500, "Error in sending mail");
    }
});


const getOtherDoctorsSchedule = asyncHandler(async (req, res) => {

    const results = await User.aggregate([
        {
            $match: { role: 'Doctor' }
        },
        {
            $lookup: {
                from: 'doctors',
                localField: 'entityId',
                foreignField: '_id',
                as: 'doctorDetails'
            }
        },
        {
            $unwind: '$doctorDetails'
        },
        {
            $project: {
                _id: 0,
                fullName: '$fullName',
                'availableOrNot': '$doctorDetails.availableOrNot',
                'availableTime': '$doctorDetails.availableTime',
                'weeklyAvailability': '$doctorDetails.weeklyAvailability',
                specialization: '$doctorDetails.specialization',
                position: '$doctorDetails.position',
                profilePicture: '$profilePicture',
                degree: '$doctorDetails.degree',
                email: '$email'
            }
        }
    ])

    if (!results) {
        throw new ApiError(404, "Details not found!!")
    }

    return res
        .status(201)
        .json(new ApiResponse(201, results, "Data fetched successfully"))
})

const changeCurrentAvailability = asyncHandler(async (req, res) => {
    const { availableOrNot } = req.body

    console.log(availableOrNot)

    if (!availableOrNot) {
        throw new ApiError(401, "Data not fetched")
    }

    const result = await Doctor.findByIdAndUpdate(
        req.user.entityId,
        {
            $set: {
                availableOrNot: availableOrNot
            }
        },

        {
            new: true
        }
    )

    if (!result) {
        throw new ApiError(401, "Error in updating the value")
    }

    return res
        .status(201)
        .json(new ApiResponse(201, result, "Availability updated successfully"))


})

const noOfPatientsInLast7Days = asyncHandler(async (req, res) => {

    const { patientCount } = req.body

    if (!patientCount) {
        throw new ApiError(404, "Count not found")
    }

    const doctor = await Doctor.findById(req.user.entityId)

    if (!doctor) {
        throw new ApiError(401, "Doctor not found")
    }

    const noOfPatientsInLast7Days = doctor.noOfPatientsInLast7Days || []

    if (noOfPatientsInLast7Days.length == 7) {
        noOfPatientsInLast7Days.shift()
    }

    noOfPatientsInLast7Days.push(patientCount)

    doctor.noOfPatientsInLast7Days = noOfPatientsInLast7Days

    const response = await doctor.save()

    if (!response) {
        throw new ApiError(401, "Patient count was not updated!!")
    }

    return res
        .status(201)
        .json(new ApiResponse(201, response, "Successfully updated the patient count"))
})

const changeWeeklySchedule = asyncHandler(async (req, res) => {
    const { day, details } = req.body

    if (!day) {
        throw new ApiError(401, "Insufficient data: Day not specified!!")
    }

    if (!details) {
        throw new ApiError(401, "Insufficient data: details not specified!!")
    }

    const doctor = await Doctor.findById(req.user.entityId)

    if (!doctor) {
        throw new ApiError(401, "Doctor details not found!!")
    }

    const weeklyAvailability = doctor.weeklyAvailability || ["", "", "", "", "", "", ""]

    weeklyAvailability[day] = details

    const response = await doctor.save()

    if (!response) {
        throw new ApiError(401, "Data is not saved")
    }

    return res
        .status(201)
        .json(new ApiResponse(201, response, "weekly availability updated successfully!!"))
})

const getPatientDetails = asyncHandler(async (req, res) => {
    const { rollNumber } = req.query

    console.log(req.query)

    if (!rollNumber) {
        throw new ApiError(401, "Roll number required")
    }

    const patient = await Patient.findOne({ rollNumber: rollNumber })

    if (!patient) {
        throw new ApiError(404, "Patient not found!!")
    }

    const user = await User.findOne({ email: patient.email })

    if (!user) {
        throw new ApiError(404, "User not found!!")
    }

    const userResponse = {
        email: user.email,
        dateOfBirth: patient.dateOfBirth,
        fullName: user.fullName,
        rollNumber: patient.rollNumber,
        bloodGroup: patient.bloodGroup,
        allergies: patient.allergies,
        conditions: patient.conditions,
        medicalDocuments: patient.medicalDocuments,
        medicalHistory: patient.medicalHistory,
        gender: user.gender,
        profilePicture: user.profilePicture,
        phoneNumber: patient.phoneNumber,
        emergencyNumber: patient.emergencyNumber,
        hostel: patient.hostel
    }

    console.log("User response: ", userResponse)

    return res
        .status(201)
        .json(new ApiResponse(201, userResponse, "Data fetched successfully"))
})

// async function getAccessTokenForDocumentUploading() {
//     const tenantId = process.env.TENANT_ID
//     const clientId = process.env.CLIENT_ID
//     const clientSecret = process.env.CLIENT_SECRET
//     const scope = "https://graph.microsoft.com/.default"; // Required scope for Graph API

//     const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;

//     const params = new URLSearchParams();
//     params.append("grant_type", "client_credentials");
//     params.append("client_id", clientId);
//     params.append("client_secret", clientSecret);
//     params.append("scope", scope);

//     const response = await fetch(tokenUrl, {
//         method: "POST",
//         headers: {
//             "Content-Type": "application/x-www-form-urlencoded",
//         },
//         body: params,
//     });

//     if (!response.ok) {
//         const error = await response.text();
//         console.error("Token Error:", error);
//         throw new Error("Failed to fetch access token");
//     }

//     const data = await response.json();
//     return data.access_token; // Return the JWT access token
// }


// const uploadDocumentInAzure = asyncHandler(async (req, res) => {
//     const accessToken = await getAccessTokenForDocumentUploading()

//     console.log("Access Token: ", accessToken)

//     const { folderPath, fileName } = req.body
//     const file = req.file

//     const uploadUrl = `https://graph.microsoft.com/v1.0/drive/root:/${folderPath}/${fileName}:/content`

//     const response = await fetch(uploadUrl, {
//         method: "PUT",
//         headers: {
//             Authorization: `Bearer ${accessToken}`,
//             "Content-Type": file.mimetype
//         },
//         body: file.buffer,
//     })

//     const responseBody = await response.text(); // Extract the response body as text for error analysis
//     console.error("Response Status:", response.status);
//     console.error("Response Body:", responseBody);

//     if (!response.ok) {
//         throw new ApiError(response.status, `Error in file upload: ${responseBody}`);
//     }

//     uploadedFile = await response.json()

//     const fileUrl = uploadedFile.webUrl

//     const patient = await Patient.findById(req.user._id)

//     if (!patient) {
//         throw new ApiError(404, "Patient not found")
//     }

//     const medicalDocuments = patient.medicalDocuments || new Map();
//     if (!medicalDocuments.has(documentType)) {
//         medicalDocuments.set(documentType, []); // Initialize an empty array for the document type if it doesn't exist
//     }

//     medicalDocuments.get(documentType).push(fileUrl); // Add the new file URL to the array

//     // Save the updated patient record
//     patient.medicalDocuments = medicalDocuments;
//     await patient.save();

//     return res
//         .status(201)
//         .json(new ApiResponse(201, response, "File uploaded successfully"))
// })

const uploadDocumentInGoogleDrive = asyncHandler(async (req, res) => {

    const { fileName, folderName } = req.body
    const filePath = req.file?.path

    if (!filePath) {
        return res.status(400).json({ message: 'No file uploaded.' });
    }

    const oauth2Client = new google.auth.OAuth2({
        clientId: process.env.GOOGLE_DRIVE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_DRIVE_CLIENT_SECRET,
        redirectUri: process.env.GOOGLE_DRIVE_REDIRECT_URI

    })

    oauth2Client.setCredentials({ refresh_token: process.env.GOOGLE_DRIVE_REFRESH_TOKEN })

    const drive = google.drive({ version: 'v3', auth: oauth2Client })

    const fileMetadata = {
        name: fileName || path.basename(filePath),
    }

    const media = {
        mimetype: 'application/pdf',
        body: fs.createReadStream(filePath)
    }

    const file = await drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id'
    })

    const fileId = file.data.id

    await drive.permissions.create({
        fileId: fileId,
        requestBody: {
            role: 'reader',
            type: 'anyone'
        }
    })

    const publicUrl = `https://drive.google.com/file/d/${fileId}/view`

    console.log("Public Url: " , publicUrl)

    const patient = await Patient.findById(req.user.entityId)

    //console.log("Patient: " , patient)

    if (!patient) {
        throw new ApiError(404, "Patient not found")
    }

    const medicalDocuments = patient.medicalDocuments || new Map();
    const existingFiles = medicalDocuments.get(folderName) || [];

    existingFiles.push(publicUrl)

    medicalDocuments.set(folderName, existingFiles)

    patient.medicalDocuments = medicalDocuments
    const response = await patient.save()

    if (!response) {
        throw new ApiError(400, "Error while updating document library")
    }

    fs.unlink(filePath , (err) => {
        if(err) {
            console.error("Error deleting file: " , err)
        }
    })

    return res
        .status(200)
        .json(new ApiResponse(200, patient, "Document uploaded and medical documents updated successfully"))

})


export {
    registerUser,
    loginUser,
    logoutUser,
    checkRole,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateUserProfilePicture,
    uploadDocument,
    uploadPrescription,
    sendEmailWithAttachment,
    sendEmailWithAttachment1,
    getOtherDoctorsSchedule,
    changeCurrentAvailability,
    noOfPatientsInLast7Days,
    changeWeeklySchedule,
    getDoctorDetails,
    getPatientDetails,
    //uploadDocumentInAzure,
    sendEmailFromMediGId,
    
    uploadDocumentInGoogleDrive

}

//dummy comment





