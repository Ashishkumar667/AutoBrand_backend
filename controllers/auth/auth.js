import User from "../../models/userModel/user.js";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from "dotenv";
import sendEmail from '../../utils/sendEmail/email.js';
import { generateVerificationEmail } from '../../utils/sendEmail/EmailVerification/emailVerification.js';
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
        
        await generateVerificationEmail(NewUser.email, otp); 

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
  const { email, purpose } = req.body; 
  
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    const otp = generateOtp();
    const hashedOtp = await bcrypt.hash(otp, 10);

    
    if (purpose === "verifyEmail") {
      user.otp = hashedOtp;
      user.otpExpires = Date.now() + 10 * 60 * 1000;
    } else if (purpose === "resetPassword") {
      user.resetOtp = hashedOtp;
      user.resetOtpExpires = Date.now() + 10 * 60 * 1000;
    } else {
      return res.status(400).json({ error: "Invalid purpose" });
    }

    await user.save();

   
    let subject, emailContent;

    if (purpose === "verifyEmail") {
      subject = "Verify Your Email - OTP Inside";
      emailContent = `
        <div style="font-family: Arial; padding:20px; background:#f8f9fa; color:#333;">
          <h2 style="color:#4f46e5;">Welcome to AutoBrand!</h2>
          <p>Please verify your email with the OTP below:</p>
          <div style="background:#fff; padding:15px; border:1px solid #ddd; text-align:center;">
            <h1 style="letter-spacing:5px; color:#000;">${otp}</h1>
          </div>
          <p>This OTP will expire in <strong>10 minutes</strong>.</p>
          <hr/>
          <p style="font-size:12px;color:#777;">AutoBrand Security Team</p>
        </div>`;
    } else if (purpose === "resetPassword") {
      subject = "Password Reset Request - OTP Inside";
      emailContent = `
        <div style="font-family: Arial; padding:20px; background:#f8f9fa; color:#333;">
          <h2 style="color:#4f46e5;">Password Reset Request</h2>
          <p>We received a request to reset your password. Use the OTP below:</p>
          <div style="background:#fff; padding:15px; border:1px solid #ddd; text-align:center;">
            <h1 style="letter-spacing:5px; color:#000;">${otp}</h1>
          </div>
          <p>This OTP will expire in <strong>10 minutes</strong>.</p>
          <hr/>
          <p style="font-size:12px;color:#777;">AutoBrand Security Team</p>
        </div>`;
    }

    await sendEmail(email, subject, emailContent);

    return res.status(200).json({ message: `OTP sent for ${purpose}` });
  } catch (err) {
    console.error("Error sending OTP:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};



export const verifyOtp = async (req, res) => {
  const { email, otp, purpose } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    let isMatch = false;
    let isExpired = true;

    if (purpose === "verifyEmail") {
      isMatch = await bcrypt.compare(otp, user.otp);
      isExpired = !user.otpExpires || user.otpExpires < Date.now();
    } else if (purpose === "resetPassword") {
      isMatch = await bcrypt.compare(otp, user.resetOtp);
      isExpired = !user.resetOtpExpires || user.resetOtpExpires < Date.now();
    } else {
      return res.status(400).json({ error: "Invalid purpose" });
    }

    if (!isMatch || isExpired) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }
    
    const token = user.generateAuthToken();

    if (purpose === "verifyEmail") {
      user.isVerified = true;
      user.otp = undefined;
      user.otpExpires = undefined;
      await user.save();
      return res.status(200).json({ message: " Email verified successfully","Token":token });
    } else if (purpose === "resetPassword") {
      user.resetOtpVerified = true; 
      await user.save();
      return res.status(200).json({ message: " OTP verified. Now you can set a new password.","Token":token });
    }

  } catch (err) {
    console.error("Error verifying OTP:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const setNewPassword = async (req, res) => {
  const { email, newPassword, confirmPassword } = req.body;

  try {
    if(newPassword != confirmPassword){
        return res.status(400).json({ error: "Passwords do not match" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    if (!user.resetOtpVerified) {
      return res.status(403).json({ error: "OTP not verified yet" });
    }
    if (!user.resetOtpExpires || user.resetOtpExpires < Date.now()) {
      return res.status(400).json({ error: "OTP has expired" });
    }
    user.password = newPassword;

    user.resetOtp = undefined;
    user.resetOtpExpires = undefined;
    user.resetOtpVerified = undefined;

    await user.save();

    res.status(200).json({ message: "Password reset successfully. Please login with your new password." });

  } catch (err) {
    console.error("Set New Password Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
