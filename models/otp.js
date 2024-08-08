const mongoose = require('mongoose');
const mailSender = require('../utility/mailSender')


const otpSchema = mongoose.Schema({
    email:{
        type:String,
        required:true
    },
    otp:{
        type:String,
        required:true,
    },
    createdAt:{
        type:Date,
        default:Date.now,
        expires: 5 * 60 // 5 minutes in seconds

    }
})




module.exports = mongoose.model('otp', otpSchema);