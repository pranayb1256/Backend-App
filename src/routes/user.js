import { Router } from "express";
import { loginUser, logoutUser, refreshToken, registerUser } from "../controllers/user.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.js";
const router = Router();


// router.route("/register").post((req, res) => {
//     res.send("Register endpoint is working!");
// });

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
//Secured Routes

router.route("/logout").post(verifyJWT,logoutUser)

router.route("/refresh-token").post(refreshToken)

export default router;
