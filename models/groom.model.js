const mongoose = require('mongoose');

const groomSchema = mongoose.Schema({
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
    groomImageLink:{
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

const GroomModel = mongoose.model('grooms',groomSchema)

module.exports = GroomModel