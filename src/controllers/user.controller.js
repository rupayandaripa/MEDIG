import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/users.model.js";
import {uploadOnCloudinary , deleteFromCloudinary , uploadFileInAFolder} from '../utils/cloudinary.js'
import {ApiResponse} from '../utils/ApiResponse.js'
import jwt from 'jsonwebtoken'
import { Patient } from "../models/patients.model.js";
import { Doctor } from "../models/doctors.model.js";
import nodemailer from 'nodemailer'
import 'isomorphic-fetch';
import fs from 'fs/promises';
import { scheduler } from "timers/promises";


const generateAccessAndRefreshTokens = async(userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false})

        return {accessToken , refreshToken}
    }
    catch(error) {
        throw new ApiError(500 , "Something went wrong while generating refresh and access token")
    }
}

const registerUser = asyncHandler(async(req,res) => {
    const {fullName , email , password , gender , role , ...additionalFields} = req.body
    

    if(
        [fullName , email , password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400 , "All fields are required")
    }

    const existedUser = await User.findOne({
        $or: [{email}]
    })

    if(existedUser) {
        throw new ApiError(409 , "User with email already exists")
    }

    let profilePictureLocalPath
    if(req.files && Array.isArray(req.files.profilePicture) && req.files.profilePicture.length > 0) {
        profilePictureLocalPath = req.files.profilePicture[0].path
    }

    const profilePicture = await uploadOnCloudinary(profilePictureLocalPath)

    

    //await user.save()

    let entityId

    if(role == "Doctor") {
        const {degree , specialization , position , age , bloodGroup , availableTime , noOfPatientsInLast7Days , availableOrNot , weeklyAvailability} = additionalFields

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
        const { dateOfBirth, rollNumber, bloodGroup, allergies, conditions, medicalDocuments, medicalHistory } = additionalFields
        const patient = await Patient.create({ 
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
        throw new ApiError(400 , "Invalid role specified")
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

    if(!createdUser) {
        throw new ApiError(500 , "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200 , createdUser , "User registered successfully")
    )
})

const loginUser = asyncHandler(async(req , res) => {

    console.log("Request headers:", req.headers);
    console.log("Content-Type:", req.headers['content-type']);
    console.log("Full request body:", req.body);
    
    const {email, fullName, password} = req.body
    console.log("Extracted values:", {email, fullName, password});

    if(!fullName && !email) {
        throw new ApiError(400 , "username or password is required")
    }

    const user = await User.findOne({
        $or: [{fullName} , {email}]
    })

    if(!user) {
        throw new ApiError(404 , "User does not exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid) {
        throw new ApiError(401 , "Invalid User Credentials")
    }

    const {accessToken , refreshToken} = await generateAccessAndRefreshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .cookie("accessToken" , accessToken , options)
        .cookie("refreshToken" , refreshToken , options)
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

const logoutUser = asyncHandler(async(req,res) => {
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
    .clearCookie("accessToken" , options)
    .clearCookie("refreshToken" , options)
    .json(new ApiResponse(200 , {} , "User logged out Successfully"))
})

const checkRole = (role) => {
    return (req,res,next) => {
        //console.log(req.user.role , " " , role)
        if(!req.user || req.user.role !== role) {
            return res
            .status(403)
            .json(new ApiError(403 , "Access Denied!!"))
        }

        

        next()
    }
}

const refreshAccessToken = asyncHandler(async(req,res) => {


    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request")
    }

    let decodedToken; 
    try { 
        decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET); 
    } catch (error) { 
        throw new ApiError(401, "Invalid or expired refresh token"); 
    }

    const user = await User.findById(decodedToken?._id)

    if(!user) {
        throw new ApiError(401 , "Invalid Refresh Token")
    }

    console.log("Incoming refreshToken: " , incomingRefreshToken)
    console.log("Saved refreshToken: " , user?.refreshToken)
    if(incomingRefreshToken !== user?.refreshToken) {
        throw new ApiError(401 , "Refresh token is expired or used")
    }

    

    const {accessToken , refreshToken} = await generateAccessAndRefreshTokens(user._id)

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
    .cookie("accessToken" , accessToken , options)
    .cookie("refreshToken" , refreshToken , options)
    .json(
        new ApiResponse(
            200,
            {accessToken , refreshToken},
            "Access token refreshed successfully"
        )
    )
})

const changeCurrentPassword = asyncHandler(async(req,res) => {
    console.log(req.body)
    const {oldPassword , newPassword} = req.body

    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if(!isPasswordCorrect) {
        throw new ApiError(400 , "Invalid Password")
    }

    user.password = newPassword

    await user.save({validateBeforeSave: false})

    return res
           .status(200)
           .json(new ApiResponse(200 , {} , "Password changed Successfully"))
})


const getCurrentUser = asyncHandler(async(req,res) => {
    return res
    .status(200)
    .json(new ApiResponse(200 , req.user , "User details fetched successfully"))
})

const updateUserProfilePicture = asyncHandler(async(req,res) => {
    const profilePictureLocalPath = req.file?.path
    console.log(req.user)
    const profilePictureToBeDestroyed = req.user.profilePicture


    if(!profilePictureLocalPath) {
        throw new ApiError(400 , "Profile picture file is missing")
    }

    const profilePicture = await uploadOnCloudinary(profilePictureLocalPath)

    if(!profilePicture) {
        throw new ApiError(400 , "Error while uploading profile picture")
    }

    console.log("Profile picture to be deleted: " , profilePictureToBeDestroyed)

    const destroyResult = await deleteFromCloudinary(profilePictureToBeDestroyed)

    console.log(destroyResult)

    if(!destroyResult) {
        throw new ApiError(400 , "Error while deleting old profile picture")
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
           .json(new ApiResponse(200 , user , "Profile picture updated successfully"))

})

const uploadDocument = asyncHandler(async(req,res) => {
    const {folderName} = req.body
    const fileToBeUploaded = req.file?.path

    if(!fileToBeUploaded) {
        throw new ApiError(400 , "No file uploaded")
    }

    const uploadedFile = await uploadFileInAFolder(fileToBeUploaded , folderName)

    if(!uploadedFile) {
        throw new ApiError(400 , "Error while uploading file in a folder")
    }

    const patient = await Patient.findById(req.user.entityId)
    if(!patient) {
        throw new ApiError(404 , "Patient not found")
    }

    const medicalDocuments = patient.medicalDocuments || new Map();
    const existingFiles = medicalDocuments.get(folderName) || [];

    existingFiles.push(uploadedFile.url)

    medicalDocuments.set(folderName , existingFiles)

    patient.medicalDocuments = medicalDocuments
    const response = await patient.save()

    if(!response) {
        throw new ApiError(400 , "Error while updating document library")
    }

    return res
           .status(200)
           .json(new ApiResponse(200 , patient , "Document uploaded and medical documents updated successfully"))

})

const uploadPrescription = asyncHandler(async(req,res) => {
    const timestamp = Date.now()
    const date = new Date(timestamp)
    
    const day = date.getDate().toString().padStart(2 , '0')
    const month = date.toLocaleString('en-US' , {month: 'long'})
    const year = date.getFullYear()

    const folderName = `${day} ${month} ${year}`

    const fileToBeUploaded = req.file?.path
    const {rollNumber} = req.body

    if(!fileToBeUploaded) {
        throw new ApiError(400 , "No file uploaded")
    }

    const uploadedFile = await uploadFileInAFolder(fileToBeUploaded , folderName)

    if(!uploadedFile) {
        throw new ApiError(400 , "Error while uploading file in a folder")
    }

    //console.log(rollNumber)
    const patient = await Patient.findOne({rollNumber: rollNumber})

    if(!patient) {
        throw new ApiError(404 , "Student not found")
    }

    const medicalHistory = patient.medicalHistory || new Map();
    const existingFiles = medicalHistory.get(folderName) || [];

    existingFiles.push(uploadedFile.url)

    medicalHistory.set(folderName , existingFiles)

    patient.medicalHistory = medicalHistory
    const response = await patient.save()

    if(!response) {
        throw new ApiError(400 , "Error while updating document library")
    }

    return res
           .status(200)
           .json(new ApiResponse(200 , patient , "Successfully updated medical history"))
    
})

const sendEmailWithAttachment = asyncHandler(async (req, res) => {
    const { accessToken } = req.body
    const prescription = req?.file.path

    console.log("Access token" , accessToken)
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
        to: process.env.RECEIPIENT_EMAIL,
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

const getOtherDoctorsSchedule = asyncHandler(async(req,res) => {

    const results = await User.aggregate([
        {
            $match: {role: 'Doctor'}
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
                'weeklyAvailability': '$doctorDetails.weeklyAvailability'
            }
        }
    ])

    if(!results) {
        throw new ApiError(404 , "Details not found!!")
    }

    return res
           .status(201)
           .json(new ApiResponse(201 , results , "Data fetched successfully"))
})

const changeCurrentAvailability = asyncHandler(async(req,res) => {
    const {availableOrNot} = req.body

    console.log(availableOrNot)

    if(!availableOrNot) {
        throw new ApiError(401 , "Data not fetched")
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

    if(!result) {
        throw new ApiError(401 , "Error in updating the value")
    }

    return res
           .status(201)
           .json(new ApiResponse(201 , result , "Availability updated successfully"))


})


export {
    registerUser , 
    loginUser , 
    logoutUser, 
    checkRole , 
    refreshAccessToken , 
    changeCurrentPassword , 
    getCurrentUser , 
    updateUserProfilePicture , 
    uploadDocument ,
    uploadPrescription,
    sendEmailWithAttachment,
    sendEmailWithAttachment1,
    getOtherDoctorsSchedule,
    changeCurrentAvailability
    
}

//dummy comment





