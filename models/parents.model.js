const mongoose = require('mongoose')

const parentSchema = mongoose.Schema({
    brideMotherFirstName:{
        type:String,
    },
    brideMotherLastName:{
        type:String,
    },
    brideFatherFirstName:{
        type:String,
    },
    brideFatherLastName:{
        type:String,
    },
    brideMotherImageUrl:{
        type:String,
        defaultValue:''
    },
    brideFatherImageUrl:{
        type:String,
        defaultValue:''
    },
    groomMotherFirstName:{
        type:String,
    },
    groomMotherLastName:{
        type:String,
    },
    groomFatherFirstName:{
        type:String,
    },
    groomFatherLastName:{
        type:String,
    },
    groomMotherImageUrl:{
        type:String,
        defaultValue:''
    },
    groomFatherImageUrl:{
        type:String,
        defaultValue:''
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

const ParentModel = mongoose.model('parents',parentSchema)

module.exports = ParentModel