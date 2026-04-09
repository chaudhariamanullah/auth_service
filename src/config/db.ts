import dotenv from "dotenv";
dotenv.config();

import mysql from "mysql2/promise";
import type { Pool } from "mysql2/promise";

if (!process.env.DB_HOST) throw new Error("Missing DB_HOST");

const pool: Pool = mysql.createPool({
    host: process.env.DB_HOST!,
    port: Number(process.env.DB_PORT!),
    user: process.env.DB_USER!,
    password: process.env.DB_PASSWORD!,
    database: process.env.DB_NAME!,
    ssl: {
        rejectUnauthorized: false
    }
});


export default pool;
