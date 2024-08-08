

const mongoose = require('mongoose');
const mailSender = require('../utility/mailSender');
const crypto = require('crypto');
const OTP = require('./otp');
const jwt = require('jsonwebtoken');
require('dotenv').config();


const userSchema = new mongoose.Schema({
    firstName:{
        type: String,
        required: true,
        trim: true,
    },
    lastName:{
        type: String,
        required: true,
        trim: true,
    },
    email:{
        type: String,
        required: true,
        trim: true,
    },
    password:{
        type: String,
        required: true,
        trim: true,
    },
    imageUrl:{
        type: String,
    },
    isVerifiedAccount:{
        type: Boolean,
        default: false,
    }
});


userSchema.pre('save',async function (next){



    if(this.isNew){

        const randomBytes = crypto.randomBytes(6);
        const randomNumber = BigInt('0x'+randomBytes.toString('hex')).toString().slice(0,6);
        const newOtp = randomNumber.toString();
        // console.log(randomNumber);


        
        try {
            const email = this.email;
            const firstName = this.firstName;
            const lastName = this.lastName;

            
            // console.log('url: ' + url)

            const savedDocument = await OTP.create({email:email,otp:newOtp})
            const otp = savedDocument.otp;
            
            await mailSender(email,'Secure Login System || Account Verification email',otp,firstName,lastName);

            
        } catch (error) {
            return next(error);
        }
    }
    next();


})



const userModel = mongoose.model('users', userSchema);

module.exports = userModel;