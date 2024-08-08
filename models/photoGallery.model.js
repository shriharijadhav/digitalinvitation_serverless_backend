const mongoose = require('mongoose')

const photoGallerySchema = mongoose.Schema({
    photoGallery:{
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

const PhotoGalleryModel = mongoose.model('photogallery', photoGallerySchema)

module.exports = PhotoGalleryModel