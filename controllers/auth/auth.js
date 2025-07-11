import User from "../../models/userModel/user.js";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from "dotenv";
import sendEmail from '../../utils/sendEmail/email.js';
dotenv.config();


export const registerUser = async( req, res) =>{
    const { Name, email, password } = req.body;
    try{
        
        const existingUser = await User.findOne({ email});

        if(existingUser){
            return res.status(400).json({error : "User is already registered with us."});
        }

        const NewUser = new User({
            Name,
            email,
            password,
            plan: "Free", // default plan
            isVerified: false // default value
        })
           

        await NewUser.save();
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const hashedOtp = await bcrypt.hash(otp, 10);
        NewUser.otp = hashedOtp;
        NewUser.otpExpires = Date.now() + 10 * 60 * 1000; 
        await NewUser.save();
        
        await sendEmail(NewUser.email, "Your OTP Code", `Your OTP is: ${otp}`); 
        
        return res.status(201).json({ message:
             "User registered successfully.We have sent a OTP, so please verify your email to continue.",
         user:{
            id: NewUser._id,
            Name: NewUser.Name,
            email: NewUser.email,
            plan: NewUser.plan,
            isVerified: NewUser.isVerified
        } });

    }catch(err){
        console.error("Error registering user:", err);
        return res.status(500).json({ error: "Internal server error", err : err.message });
    }
}


export const LoginUser = async ( req, res) =>{
    const { email, password } = req.body;
    try{
        const user = await User.findOne({ email});
        if(!user){
            return res.status(404).json({ error: "User not found" });
        }

        // check if email is verified or not
        if(!user.isVerified){
            return res.status(403).json({ error: "Please verify your email to login" });
        }

        const isMatch = await user.comparePassword(password);
        if(!isMatch){
            return res.status(401).json({ error: "Invalid credentials" });
        }
        const token = user.generateAuthToken();
        return res.status(200).json({ message: "Login successful", token, user:{
            id: user._id,
            Name: user.Name,
            email: user.email,
            plan: user.plan
        } });
    }
    catch(err){
        console.error("Error logging in user:", err);
        return res.status(500).json({ error: "Internal server error", err : err.message });
    }   
}

//get user profile 
export const UserProfile = async(req, res) =>{
    
    try{
      const user = await User.findById(req.user._id).select("-email");
      if(!user){
        return res.status(404).json({ error: "User not found" });
      }
      return res.status(200).json({ message: "User profile fetched successfully", user: {
          id: user._id,
          Name: user.Name,
          Email: user.email,
          plan: user.plan,
          isVerified: user.isVerified
      } });

    }catch(err){
        console.log("Error in getting users profile", err.message)
        return res.status(500).json({error: "Internal server error", err: err.message});
    }
}

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

export const sendOtp = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ error: "User not found" });

        const otp = generateOtp();
        const hashedOtp = await bcrypt.hash(otp, 10);
        user.otp = hashedOtp;
        user.otpExpires = Date.now() + 10 * 60 * 1000;
        await user.save();

        await sendEmail(email, "Your OTP Code", `Your OTP is: ${otp}`);
        res.status(200).json({ message: "OTP sent to your email" });
    } catch (err) {
        console.error("Error sending OTP:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const verifyOtp = async (req, res) => {
    const { email, otp } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ error: "User not found" });
        
        const isMatch = await bcrypt.compare(otp, user.otp);

        if (
            isMatch &&
            user.otpExpires &&
            user.otpExpires > Date.now()
        ) {
            user.isVerified = true;
            user.otp = undefined;
            user.otpExpires = undefined;
            await user.save();
            return res.status(200).json({ message: "Email verified successfully" });
        } else {
            return res.status(400).json({ error: "Invalid or expired OTP" });
        }
    } catch (err) {
        console.error("Error verifying OTP:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};