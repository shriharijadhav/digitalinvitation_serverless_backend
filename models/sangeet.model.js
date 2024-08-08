const mongoose = require('mongoose');

const sangeetSchema = mongoose.Schema({
    sangeetDate:{
        type:String,
    },
    raw_sangeetDate:{
        type:String,
    },
    sangeetTime:{
        type:String,
    },
    sangeetAddress:{
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

const SangeetModel = mongoose.model('sangeets',sangeetSchema)

module.exports = SangeetModel