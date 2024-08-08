const mongoose = require('mongoose')

const cardSchema = mongoose.Schema({
    cardLink:{
        type: String,
    },
    cardStatus:{
        type:String,
        defaultValue:'inactive',
    },
    selectedTemplate:{
        type:String,
    },
    paymentStatus:{
        type:String,
        defaultValue:'unpaid',
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'users'
    }
})


const CardsModel = mongoose.model('cards', cardSchema);

module.exports = CardsModel;