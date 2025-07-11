import express from "express";
import authenticationRoutes from './routes/authRoutes/index.js';
import brandRoutes from './routes/brandRoutes/brand.js';
import scraperScheduler from './utils/scheduler.js';
import airoutes from './routes/airoutes/AiRoutes.js';
import snap from './routes/snapshotRoutes/snap.routes.js';
import connectDB from './config/db.js';
import dotenv from "dotenv";
dotenv.config();
import cors from 'cors';

const app = express();

const PORT = process.env.PORT || 3000;

const allowedOrigin = [

    "http://localhost:3000",
    process.env.FRONTEND_URL
]

const corsRequired = {
    origin: allowedOrigin,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Authorization"],
    credentials: true,
    optionsSuccessStatus: 200
};


app.use(cors(corsRequired));
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Welcome to the AutoBrand API");
});

app.use('/api/v1', authenticationRoutes);
app.use('/api', brandRoutes);
app.use('/ai/', airoutes);
app.use('/api/snapshots', snap);
scraperScheduler();
connectDB();


app.listen(PORT, ()=>{
    console.log(`Server is running on port ${PORT}`);
})