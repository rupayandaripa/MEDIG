import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/users.model.js";
import {uploadOnCloudinary , deleteFromCloudinary} from '../utils/cloudinary.js'
import {ApiResponse} from '../utils/ApiResponse.js'
import jwt from 'jsonwebtoken'
import { Patient } from "../models/patients.model.js";
import { Doctor } from "../models/doctors.model.js";

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

    const user = await User.create({
        email,
        fullName,
        profilePicture: profilePicture?.url || "",
        password,
        gender,
        role
    })

    //await user.save()

    if(role == "doctor") {
        const {degree , specialization , position , age , bloodGroup , availableTime , noOfPatientsInLast7Days , availableOrNot , weeklyAvailability} = additionalFields

        const doctor = await Doctor.create({
            user: user._id,
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
    }
    else if (role == 'patient') {
        const { dateOfBirth, rollNumber, bloodGroup, allergies, conditions, medicalDocuments, medicalHistory } = additionalFields
        const patient = await Patient.create({ 
            user: user._id,
            dateOfBirth, 
            rollNumber, 
            bloodGroup, 
            allergies, 
            conditions, 
            medicalDocuments, 
            medicalHistory, 
        })
    }
    else {
        throw new ApiError(400 , "Invalid role specified")
    }

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

    const {email , fullName , password} = req.body

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
        if(!req.user || req.user.role !== role) {
            return res
            .status(403)
            .json(new ApiError(403 , "Access Denied!!"))
        }

        next()
    }
}

export {registerUser , loginUser , logoutUser, checkRole}