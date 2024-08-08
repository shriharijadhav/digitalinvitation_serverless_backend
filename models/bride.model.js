const mongoose = require('mongoose');

const brideSchema = mongoose.Schema({
    firstName:{
        type:String,
    },
    lastName:{
        type:String,
    },
    instagramLink:{
        type:String,
        defaultValue:''
    },
    facebookLink:{
        type:String,
        defaultValue:''
    },
    youtubeLink:{
        type:String,
        defaultValue:''
    },
    brideImageLink:{
        type:String,
    },
    card:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'cards',
    },
    event:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'events',
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'users',
    }
})

const BrideModel = mongoose.model('brides',brideSchema)

module.exports = BrideModel