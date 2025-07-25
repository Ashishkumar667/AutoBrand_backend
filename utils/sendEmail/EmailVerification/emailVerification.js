import sendEmail from "../email.js";
export const generateVerificationEmail = async(userName, otp) => {
    const htmlContent =`
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9f9f9;
        }
        .container {
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #6e8efb, #a777e3);
            padding: 30px 20px;
            text-align: center;
            color: white;
        }
        .content {
            padding: 30px;
        }
        .otp-display {
            background: #f5f7ff;
            border: 1px dashed #6e8efb;
            padding: 15px;
            text-align: center;
            margin: 25px 0;
            border-radius: 5px;
        }
        .otp-code {
            font-size: 28px;
            letter-spacing: 3px;
            color: #2c3e50;
            font-weight: bold;
        }
        .button {
            display: inline-block;
            padding: 12px 24px;
            background: linear-gradient(135deg, #6e8efb, #a777e3);
            color: white;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            margin: 15px 0;
        }
        .footer {
            text-align: center;
            padding: 20px;
            font-size: 12px;
            color: #777;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Verify Your Email</h1>
            <p>Welcome to AutoBrand, ${userName}!</p>
        </div>
        
        <div class="content">
            <p>Please use the following OTP code to verify your email address:</p>
            
            <div class="otp-display">
                <div class="otp-code">${otp}</div>
                <p style="margin-top: 10px;">This code expires in 10 minutes</p>
            </div>
            
            <p>If you didn't request this, please ignore this email or contact support if you have questions.</p>
            
            <p>Thanks,<br>The Team</p>
        </div>
        
        <div class="footer">
            <p>© ${new Date().getFullYear()} AutoBrand. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`
   await sendEmail(userName, "Verify Your Email - OTP Inside", htmlContent);
    console.log(`Verification email sent to ${userName}`);
};