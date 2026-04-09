import type { LocalSignupInput } from "../schema/schema.localSignup.js";
import type { LocalLoginInput } from "../schema/schema.localLogin.js";
import AuthModel from "../model/model.auth.js";
import { v4 as uuidV4 } from "uuid";
import bcrypt from "bcrypt";
import UserClient from "../client/client.user.js";
import { generateToken } from "../utils/jwt.js";

const authService = {

    async localSignup(user:LocalSignupInput){

        const phoneExists = await UserClient.checkPhone(user.user_phone);
        const emailExists = await AuthModel.checkEmail(user.user_email);
        
        if(emailExists.emailExists){
            throw new Error("EMAIL_EXISTS")
        }

        if(phoneExists.phoneExists){
            throw new Error("PHONE_EXISTS")
        }

        const user_public_id = uuidV4();
        const hashedPassword = await bcrypt.hash(user.user_password,10);

        const userAuth = {
            user_public_id: user_public_id,
            email:user.user_email,
            password_hash: hashedPassword,
            auth_app:"LOCAL"
        }

        const userProfile = {
            user_public_id: user_public_id,
            user_fname:user.user_fname,
            user_lname:user.user_lname,
            user_country_code:user.user_country_code,
            user_phone:user.user_phone,
        }

        const sent = await fetch("http://localhost:3002/users", {
            method:'POST',
            headers:{ 'Content-Type': 'application/json' },
            body: JSON.stringify( userProfile )
        });

        const data = await sent.json();

        if (!sent.ok){
            throw new Error("User_Service_Error");

        } else{

            const inserted = await AuthModel.addAuthUser(userAuth);

            if(inserted)
                return true
            else
                return false
        }
    },

    async localLogin(user:LocalLoginInput){

        const login = await AuthModel.login(user.email) as any;

        if(!login){
            return null;
        }

        const match = await bcrypt.compare(user.password, login.password_hash);

        if(!match){
            return null;
        }

        const token = generateToken({
            user_public_id: login.user_public_id,
            role: login.role
        });

        return token;
    },

    async checkUserExistence(provider_id:string,email:string){
        const user = await AuthModel.verifyUserExistence(provider_id,email);

        if(user){

            if(user.provider_user_id){
                return user;
            }else{
                const insert = await AuthModel.linkOauth(email,provider_id);

                if(insert)
                    return user;
                else
                    return "Linking Failed";
            }
        } else {
            return null;
        }
    },

    async addNewAuth(email:string,provider_id:string){

        const user_public_id = uuidV4();
        return await AuthModel.insertNewAuth(email,provider_id,user_public_id);
        
    },

    async userStatus(user_public_id:string){
        return await AuthModel.fetchStatus(user_public_id)
    },

    async statusActivate(user_public_id:string){
        return await AuthModel.updateActiveStatus(user_public_id)
    },

    async statusDeactivate(user_public_id:string){
        return await AuthModel.updateInactiveStatus(user_public_id)
    },

    async resetPassword(user_public_id:string){
        return await AuthModel.resetPassword(user_public_id)
    },

    async setRole(user_public_id:string){
        return await AuthModel.updateUserRole(user_public_id)
    },

    async getEmail(user_public_id:string){
        return await AuthModel.fetchEmail(user_public_id);
    }
}

export default authService;