const mongoose = require('mongoose');

const haldiSchema = mongoose.Schema({
    haldiDate:{
        type:String,
    },
    raw_haldiDate:{
        type:String,
    },
    haldiTime:{
        type:String,
    },
    haldiAddress:{
        type:String,
    },
    card:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'cards',
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'users',
    },
    event:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'events',
    }

}) 

const HaldiModel = mongoose.model('haldis',haldiSchema)

module.exports = HaldiModel