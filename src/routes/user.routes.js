import { Router } from "express";
import {upload} from '../middleware/multer.middleware.js'
import {verifyJWT} from '../middleware/auth.middleware.js'

import {registerUser , 
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
changeCurrentAvailability} from '../controllers/user.controller.js'

    import { ConfidentialClientApplication } from '@azure/msal-node';

    import { asyncHandler } from "../utils/asyncHandler.js";






const router = Router()

const msalConfig = {
    auth: {
        clientId: process.env.CLIENT_ID,
        authority: `https://login.microsoftonline.com/${process.env.TENANT_ID}`,
        clientSecret: process.env.CLIENT_SECRET,
        redirectUri: process.env.REDIRECT_URI,
    },
};

const confidentialClient = new ConfidentialClientApplication(msalConfig);

router.route('/auth/login').get(
    asyncHandler(async (req, res) => {
        try {
            const authUrl = await confidentialClient.getAuthCodeUrl({
                scopes: ["Mail.Send", "User.Read" , "SMTP.Send"],
                redirectUri: msalConfig.auth.redirectUri,
            });
            console.log(authUrl)
            // Redirect the user directly to the auth URL instead of sending it in JSON
            return res.status(200).json({authUrl})
        } catch (error) {
            console.error("Error generating auth URL:", error);
            return res.status(500).send("Failed to generate authentication URL");
        }
    })
);

router.route('/auth/callback').get(
    asyncHandler(async (req, res) => {
        const { code } = req.query;

        //console.log("Code: " , code)

        if (!code) {
            return res.status(400).send("Authorization code missing");
        }

        try {
            const tokenResponse = await confidentialClient.acquireTokenByCode({
                code,
                scopes: [
                    //"SMTP.Send",
                    "Mail.Send", 
                    "User.Read",
                ],
                redirectUri: msalConfig.auth.redirectUri,
                //prompt: "consent"
            });

            // Store the tokens
            req.session.accessToken = tokenResponse.accessToken;
            if (tokenResponse.refreshToken) {
                req.session.refreshToken = tokenResponse.refreshToken;
            }

            console.log("AccessToken: " , req.session.accessToken)

            return res.redirect("/doctor/send-mail");
        } catch (error) {
            console.error("Error during token acquisition:", error);
            return res.status(500).send("Failed to acquire token");
        }
    })
);

router.route('/doctor/send-mail').post(
    verifyJWT,
    checkRole('Doctor'),
    upload.single('prescription'),
    sendEmailWithAttachment
    //sendEmailWithAttachment1
    
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

router.route("/login").post(upload.none() , loginUser)

//secured routes
router.route('/logout').post(verifyJWT , logoutUser)
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




export default router