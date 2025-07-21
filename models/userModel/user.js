import mongoose from "mongoose";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from "dotenv";
dotenv.config();

const userSchema = new mongoose.Schema({
    Name: {
        type: String,
        required:true,
        trim: true

    },
    email:{
        type: String,
        required:true,
        unique: true,
    },
    password:{
        type: String,
        required:true,
        minlength: 6,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    plan: {
        type: String,
        enum: ['Free', 'Basic', 'Premium', 'Pro'],
        default: 'Free',
        stripeCustomerId: String,
        competitorBrands: [{ type: mongoose.Schema.Types.ObjectId, ref: "Brand" }],
    },
    planExpiry:{
        type: Date,
    },
    otp: { 
        type: String 
    },
    otpExpires: { 
        type: Date 
    },
    resetOtpExpires:{
        type:Date
    },
    resetOtp:{
        type: String
    },
    resetOtpVerified:{
        type: Boolean,
        default: false
    }
})

//pre save hook to hash password before saving
userSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

//we will use this to compare the password
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// assignToken to user
userSchema.methods.generateAuthToken = function() {
    return jwt.sign(
        { _id: this._id, email: this.email, plan: this.plan, Name: this.Name },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );
};

const User = mongoose.model('User', userSchema);

export default User;