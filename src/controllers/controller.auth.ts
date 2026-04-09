import type{ Request, Response } from "express";
import { LocalSignupSchema } from "../schema/schema.localSignup.js";
import { LocalLoginSchema } from "../schema/schema.localLogin.js";
import authService from "../services/service.auth.js";
import { generateToken, verifyToken } from "../utils/jwt.js";

const authController = {
   async localSignup(req:Request, res:Response){
        try{
            const user = LocalSignupSchema.parse(req.body);
            const result = await authService.localSignup(user);
            return res.status(201).json(result);

        }catch(err:any){

            if(err.message === "EMAIL_EXISTS" || err.message === "PHONE_EXISTS"){
                return res.status(409).json({message: err.message});
            }

            if(err.message === "User_Service_Error")
                return res.status(500).json({message:err.message});

            res.status(500).json({message:err.message});
        }
   },

    async localLogin(req:Request,res:Response){
        try{
            
            const user = LocalLoginSchema.parse(req.body);
            const token = await authService.localLogin(user);
            
            if(!token)
                return res.status(401).json({message:"Login Failed"});

            res.cookie("token", token , {
                httpOnly: true,
                secure: true,
                sameSite: "none",
                maxAge: 24 * 60 * 60 * 1000
            });

            return res.status(200).json({message:"Login Completed"});
        } catch(err:any){   
             console.log("LOGIN ERROR:", err);
            if(!res.headersSent){
                return res.status(500).json({error:err.message});
            }
        }
    },

    async googleLogin(req:Request,res:Response){
         const user = req.user as any;

        const token = generateToken({
            user_public_id: user.user_public_id,
            role: user.role
        });

        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 24 * 60 * 60 * 1000
        });

        res.redirect("http://localhost:5173/");
    },

    async authenticate(req:Request, res:Response){

        const token = req.cookies.token as any;
        
        if (!token) {
            return res.status(401).json({ message: "Not logged in" });
        }

        try {
            const decoded = verifyToken(token);
            return res.status(200).json(decoded);
        } catch (err) {
            return res.status(401).json({ message: "Invalid token" });
        }
    },

    async logout(req:Request, res:Response){
        res.clearCookie("token");
        return res.status(200).json({ message: "Logged out" });
    },

    async userStatus(req:Request, res:Response){
        try{
             const user_public_id = req.params.user_public_id as string;
            if(!user_public_id){
                return res.status(400).json({message:"User Id Not Found"});
            }
            const status = await authService.userStatus(user_public_id);
            return status;
        }catch(err){
            return res.status(500).json({error:err});
        }
    },

    async statusActivate(req:Request, res:Response){
        try{
            const user_public_id = req.params.user_public_id as string;

            if(!user_public_id){
                return res.status(400).json({message:"User Id Not Found"});
            }

            const status = await authService.userStatus(user_public_id);
            return res.status(200).json(status);
        }catch(err){
            return res.status(500).json({error:err});
        }
    },

    async statusDeactivate(req:Request, res:Response){
        try{
            const user_public_id = req.params.user_public_id as string;

            if(!user_public_id){
                return res.status(400).json({message:"User Id Not Found"});
            }

            await authService.statusActivate(user_public_id);
            return res.status(200).json({message:"Status Activated"});

        }catch(err){
            return res.status(500).json({error:err});
        }
    },

    async resetPassword(req:Request, res:Response){
        try{
            const user_public_id = req.params.user_public_id as string;

            if(!user_public_id){
                return res.status(400).json({message:"User Id Not Found"});
            }

            await authService.statusDeactivate(user_public_id);
            return res.status(200).json({message:"Status Deactivated"});

        }catch(err){
            return res.status(500).json({error:err});
        }
    },

    async setRole(req:Request, res:Response){
        try{
            const user_public_id = req.params.user_public_id as string;
            if(!user_public_id){
                return res.status(400).json({message:"User Id Not Found"});
            }

            await authService.setRole(user_public_id);
            return res.status(200).json({message:"Status Deactivated"});
        }catch(err){
            return res.status(500).json({error:err});
        }
    },

    async getEmail(req:Request, res:Response){
        try{
            const user_public_id = req.params.user_public_id as string;
            if(!user_public_id){
                return res.status(400).json({message:"User Id Not Found"});
            }

            const email = await authService.getEmail(user_public_id);
            return res.status(200).json(email);
        }catch(err){
            return res.status(500).json({error:err});
        }
    }
} 

export default authController;
