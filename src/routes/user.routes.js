import { Router } from "express";
import { upload } from "../middleware/multer.middleware";
import { verifyJWT } from "../middleware/auth.middleware";
import {registerUser,
        loginUser,
        logoutUser,
        checkRole
    
    } from '../controllers/user.controller.js'


const router = Router()

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser   
)

router.route("/login").post(loginUser)

//secured routes
router.route('/logout').post(verifyJWT , logoutUser)

//Doctor Specific Routes


//Patient Specific Routes