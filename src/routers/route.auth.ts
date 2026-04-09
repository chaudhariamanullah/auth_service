import { Router } from "express";
import passport from "passport";
import authController from "../controllers/controller.auth.js";

const router = Router();


router.get("/google",passport.authenticate(
            'google',{
            scope:['profile','email']
}),);

router.get("/google/callback",
    passport.authenticate('google',{ failureRedirect: '/', session:false}),
    authController.googleLogin);


router.post("/signup", authController.localSignup);

router.post("/login", authController.localLogin);

router.get("/authenticate",authController.authenticate);

router.get("/logout",authController.logout);

router.get("/:user_public_id/status",authController.userStatus);

router.get("/:user_public_id",authController.getEmail);

router.patch("/:user_public_id/activate",authController.statusActivate);
router.patch("/:user_public_id/deactivate",authController.statusDeactivate);

router.patch("/:user_public_id/reset-password",authController.resetPassword);
router.patch("/:user_public_id/setRole",authController.setRole);

export default router;