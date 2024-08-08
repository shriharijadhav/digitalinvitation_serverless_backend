const mongoose = require('mongoose');

const audioFileSchema = mongoose.Schema({
    audioFile_secureUrl:{
        type: String,
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

const AudioFileModel = mongoose.model('AudioFile', audioFileSchema);

module.exports = AudioFileModel;
