import dotenv from "dotenv";
dotenv.config();

import authRouter from "../src/routers/route.auth.js";
import express from "express";
import passport from "passport";
import cors from "cors";
import cookieParser from "cookie-parser";
import "./config/passport.js";

const app = express();

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());

app.use(passport.initialize());

app.use("/auth",authRouter);

export default app;