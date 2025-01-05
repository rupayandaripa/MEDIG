import { Router } from "express";
import { upload } from '../middleware/multer.middleware.js'
import { verifyJWT } from '../middleware/auth.middleware.js'

import {
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
    uploadDocumentInGoogleDrive,
    sendEmailFromMediGId,
    updateMedicalHistoryInGoogleDrive
} from '../controllers/user.controller.js'

import { ConfidentialClientApplication } from '@azure/msal-node';

import { asyncHandler } from "../utils/asyncHandler.js";






const router = Router()

// const msalConfig = {
//     auth: {
//         clientId: process.env.CLIENT_ID,
//         authority: `https://login.microsoftonline.com/${process.env.TENANT_ID}`,
//         clientSecret: process.env.CLIENT_SECRET,
//         redirectUri: process.env.REDIRECT_URI,
//     },
// };

// const confidentialClient = new ConfidentialClientApplication(msalConfig);

// // Step 1: Generate Auth URL
// router.route('/auth/login').get(
//     asyncHandler(async (req, res) => {
//         try {
//             const authUrl = await confidentialClient.getAuthCodeUrl({
//                 scopes: ["Mail.Send", "User.Read", "offline_access"], // Add offline_access to get refresh tokens
//                 redirectUri: msalConfig.auth.redirectUri,
//             });

//             return res.redirect(authUrl);
//         } catch (error) {
//             console.error("Error generating auth URL:", error);
//             return res.status(500).send("Failed to generate authentication URL");
//         }
//     })
// );

// Step 2: Handle Callback and Acquire Token
// router.route('/auth/callback').get(
//     asyncHandler(async (req, res) => {
//         const { code } = req.query;

//         if (!code) {
//             return res.status(400).send("Authorization code missing");
//         }

//         try {
//             const tokenResponse = await confidentialClient.acquireTokenByCode({
//                 code,
//                 scopes: ["Mail.Send", "User.Read", "offline_access"],
//                 redirectUri: msalConfig.auth.redirectUri,
//             });

//             const { accessToken, refreshToken, expiresOn } = tokenResponse;

//             // Redirect back to frontend with token data
//             res.redirect(
//                 `http://localhost:3000?accessToken=${accessToken}&refreshToken=${refreshToken}&expiresOn=${expiresOn}`
//             );
//         } catch (error) {
//             console.error("Error during token acquisition:", error);
//             return res.status(500).send("Failed to acquire token");
//         }
//     })
// );


// // Step 3: Refresh Access Token
// router.route('/auth/refresh-token').post(
//     asyncHandler(async (req, res) => {
//         const { refreshToken } = req.body;

//         if (!refreshToken) {
//             return res.status(400).send("Refresh token missing");
//         }

//         try {
//             const tokenResponse = await confidentialClient.acquireTokenByRefreshToken({
//                 refreshToken,
//                 scopes: ["Mail.Send", "User.Read"],
//             });

//             console.log("New access token:", tokenResponse.accessToken);

//             return res.status(200).json({
//                 accessToken: tokenResponse.accessToken,
//                 expiresOn: tokenResponse.expiresOn,
//             });
//         } catch (error) {
//             console.error("Error refreshing access token:", error);
//             return res.status(500).send("Failed to refresh token");
//         }
//     })
// );


router.route('/doctor/send-mail').post(
    verifyJWT,
    checkRole('Doctor'),
    upload.single('prescription'),
    //sendEmailWithAttachment
    //sendEmailWithAttachment1
    sendEmailFromMediGId

)

router.route("/register").post(
    upload.fields([
        {
            name: "profilePicture",
            maxCount: 1
        }
    ]),
    registerUser
)

router.route("/login").post(upload.none(), loginUser)

//secured routes
router.route('/logout').post(verifyJWT, logoutUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/profile-picture").patch(
    verifyJWT,
    upload.single("profilePicture"),
    updateUserProfilePicture
)
router.route('/change-password').post(
    verifyJWT,
    upload.none(),
    changeCurrentPassword
)

router.route('/get-current-user').get(
    verifyJWT,
    getCurrentUser
)

router.route('/patient/upload-document').patch(
    verifyJWT,
    checkRole('Patient'),
    upload.single('document'),
    uploadDocument
)

router.route('/other-doctor-schedule').get(
    verifyJWT,
    checkRole('Doctor'),
    getOtherDoctorsSchedule
)

router.route('/availability').post(
    verifyJWT,
    checkRole('Doctor'),
    upload.none(),
    changeCurrentAvailability
)

router.route('/doctor/update-medical-history').patch(
    verifyJWT,
    checkRole('Doctor'),
    upload.single('prescription'),
    uploadPrescription
)

router.route('/update-patient-count').patch(
    verifyJWT,
    checkRole('Doctor'),
    upload.none(),
    noOfPatientsInLast7Days
)

router.route('/change-weekly-schedule').patch(
    verifyJWT,
    checkRole('Doctor'),
    upload.none(),
    changeWeeklySchedule
)

router.route('/get-doctor-details').get(
    verifyJWT,
    checkRole('Doctor'),
    getDoctorDetails
)

router.route('/get-patient-details').get(
    verifyJWT,
    checkRole('Doctor'),
    getPatientDetails
)

// router.route('/upload-document-in-azure').put(
//     verifyJWT,
//     checkRole('Patient'),
//     upload.single('medicalDocument'),
//     uploadDocumentInAzure
// )

router.route('/upload-document-in-google-drive').post(
    verifyJWT,
    checkRole('Patient'),
    upload.single('medicalDocument'),
    uploadDocumentInGoogleDrive
)

router.route('/update-medical-history-in-google-drive').post(
    verifyJWT,
    checkRole('Doctor'),
    upload.single('prescription'),
    updateMedicalHistoryInGoogleDrive
)



export default router