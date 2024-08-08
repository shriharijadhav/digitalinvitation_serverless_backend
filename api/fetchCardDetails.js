const CardsModel = require("../models/cards.model");
const mongoose = require("mongoose");
const EventModel = require("../models/events.model");
const BrideModel = require("../models/bride.model");
const GroomModel = require("../models/groom.model");
const EngagementModel = require("../models/engagement.model");
const HaldiModel = require("../models/haldi.model");
const SangeetModel = require("../models/sangeet.model");
const PhotoGalleryModel = require("../models/photoGallery.model");
const FamilyModel = require('../models/family.model')
const AudioFileModel = require("../models/audioFile.model");

const dbConnect = require('../config/dbConnect');

export default async function handler(req, res) {
    await dbConnect();

     // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*'); // Allow all origins
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS'); // Allow all methods
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type'); // Allow specific headers

     // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

     try {
        const {cardUrl} = req.body;

    let engagementFromDB ;
    let haldiFromDB;
    let sangeetFromDB;
    let parentFromDB;
    let photoGallery;
    let familyMembers;
    let audioUrl;
 
 
    if(!cardUrl){
        return res.status(200).json({
            message:'Card Url is required.',
            isCardDetailsFetched: false,
        })
    }

    const cardFromDB = await CardsModel.findOne({cardLink:cardUrl},{__v:0})

    if(!cardFromDB){
        return res.status(200).json({
            message:'Card not found.',
            isCardDetailsFetched: false,

        })
    }

    const eventFromDB = await EventModel.findOne({card:cardFromDB._id},{user:0,__v:0})
    const brideFromDB = await BrideModel.findOne({card:cardFromDB._id},{user:0,__v:0,card:0,event:0})
    const groomFromDB = await GroomModel.findOne({card:cardFromDB._id},{user:0,__v:0,card:0,event:0})
    

    if(eventFromDB.addEngagementDetails){
         engagementFromDB = await EngagementModel.findOne({event:eventFromDB._id},{user:0,__v:0,card:0,event:0})
    }
    if(eventFromDB.addSangeetDetails){
        sangeetFromDB = await SangeetModel.findOne({event:eventFromDB._id},{user:0,__v:0,card:0,event:0})
    }
    if(eventFromDB.addHaldiDetails){
        haldiFromDB = await HaldiModel.findOne({event:eventFromDB._id},{user:0,__v:0,card:0,event:0})
    }
    if(eventFromDB.addFamilyDetails){
        // console.log('object')
        familyMembers = await FamilyModel.findOne({event:eventFromDB._id},{user:0,__v:0,card:0,event:0})
    }

    photoGallery = await PhotoGalleryModel.findOne({event:eventFromDB._id},{user:0,__v:0,card:0,event:0})
    audioUrl = await AudioFileModel.findOne({event:eventFromDB._id},{user:0,__v:0,card:0,event:0})
     
    return res.status(200).json({
        data:{
            cardFromDB,
            eventDetails:{
                eventFromDB,
                subEvents:{
                engagementDetails:engagementFromDB ? engagementFromDB : {},
                sangeetDetails:sangeetFromDB ? sangeetFromDB : {},
                haldiDetails:haldiFromDB ? haldiFromDB : {}
                },
                brideDetails:brideFromDB,
                groomDetails:groomFromDB,
                familyMembers:familyMembers ||[],
                photoGallery: photoGallery || [],
                audioUrl

            },
        },
        isCardDetailsFetched: true,

    })
    } catch (error) {
        return res.status(500).json({
            error: 'Failed to fetch todos'
        });
    }
}
