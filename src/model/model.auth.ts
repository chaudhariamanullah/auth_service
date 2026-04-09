import pool from "../config/db.js";
import type { RowDataPacket,ResultSetHeader } from "mysql2";
import type { UserAuth } from "../types/type.user.js";

const AuthModel = {

    async checkEmail(email:string){
        const sql = "SELECT email from auth_users where email = ?";

        const [rows] = await pool.execute<RowDataPacket[]>(sql,[email]);

        return {
            emailExists: rows.length > 0
        }
    },

    async addAuthUser(user:UserAuth){
        const sql = `INSERT INTO 
                    auth_users(user_public_id,email,password_hash,auth_app)
                    VALUES(?,?,?,?)`;
        
        const [result] = await pool.execute<ResultSetHeader>(sql,[
            user.user_public_id,
            user.email,
            user.password_hash,
            user.auth_app
        ]);

        if(result.affectedRows === 1)
            return true
        else
            return false

    },

    async login(email:string){

        const sql = `SELECT user_public_id, role, password_hash FROM auth_users 
                    WHERE email = ?`;

        const [row] = await pool.execute<RowDataPacket[]>(sql,[email]);
        return row[0] ?? null

    },

    async verifyUserExistence(provider_id:string,email:string){
        const sql = `SELECT user_public_id, role, provider_user_id, email
                    FROM auth_users
                    WHERE email = ? OR provider_user_id = ?
                    LIMIT 1`;

        const [rows] = await pool.execute<RowDataPacket[]>(sql,[email,provider_id]);
        return rows[0] ?? null;
    },

    async linkOauth(email:string,provider_id:string){
        const sql = `UPDATE auth_users
                    SET 
                    provider_user_id = ?,
                    oauth_app = 'GOOGLE'
                    WHERE email = ?`;

        const [result] = await pool.execute<ResultSetHeader>(sql,[provider_id,email]);
        if(result.affectedRows === 1)
            return true
        else
            return false
    },

    async insertNewAuth(email:string,provider_id:string,user_public_id:string){

        const sql = `INSERT INTO 
                    auth_users(user_public_id,email,provider_user_id,auth_app)
                    VALUES (?,?,?,'GOOGLE')`;

        await pool.execute<ResultSetHeader>(sql,[user_public_id,email,provider_id]);
        return {
            user_public_id,
            email,
            role: "user"
        };
        
    },

    async fetchStatus(user_public_id:string){
        const sql = `SELECT 
                     status 
                     FROM auth_users 
                     WHERE user_public_id = ?`;

        return await pool.execute(sql,[user_public_id]);
    },

    async updateActiveStatus(user_public_id:string){
        const sql = `UPDATE 
                     auth_users 
                     SET status = 'inactive' 
                     WHERE user_public_id = ?`;

        return await pool.execute(sql,[user_public_id]);
    },

    async updateInactiveStatus(user_public_id:string){
        const sql = `UPDATE 
                     auth_users 
                     SET status = 'active' 
                     WHERE user_public_id = ?`;

        return await pool.execute(sql,[user_public_id]);
    },

    async resetPassword(user_public_id:string){
        const sql = `UPDATE 
                     auth_users 
                     SET password_hash = ? 
                     WHERE user_public_id = ?`;

        return await pool.execute(sql,[user_public_id]);
    },

    async updateUserRole(user_public_id:string){
        const sql = `UPDATE 
                     auth_users 
                     SET role = ? 
                     WHERE user_public_id = ?`

        return await pool.execute(sql,[user_public_id]);
    },

    async fetchEmail(user_public_id:string){
        const sql = `SELECT email FROM auth_users
                    WHERE user_public_id = ?`;

        const [email] = await pool.execute<RowDataPacket[]>(sql,[user_public_id]);
        return email[0];
    }
}

export default AuthModel;