const mongoose = require('mongoose');

const engagementSchema = mongoose.Schema({
    engagementDate:{
        type:String,
    },
    raw_engagementDate:{
        type:String,
    },
    engagementTime:{
        type:String,
    },
    engagementAddress:{
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

const EngagementModel = mongoose.model('engagements',engagementSchema)

module.exports = EngagementModel