const mongoose = require('mongoose');

const familySchema = mongoose.Schema({
    familyDetailsArray:{
        type:Array
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

const FamilyModel = mongoose.model('Family', familySchema)

module.exports = FamilyModel