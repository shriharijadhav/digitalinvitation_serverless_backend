import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import streamifier from 'streamifier';
import mongoose from 'mongoose';
import CardModel from '../models/cards.model';
import EventModel from '../models/events.model';
import EngagementModel from '../models/engagement.model';
import SangeetModel from '../models/sangeet.model';
import HaldiModel from '../models/haldi.model';
import BrideModel from '../models/bride.model';
import GroomModel from '../models/groom.model';
import PhotoGalleryModel from '../models/photoGallery.model';
import AudioFileModel from '../models/audioFile.model';
import FamilyModel from '../models/family.model';

dotenv.config();

const {
  CLOUDINARY_CLOUDNAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
  brideImagesFolderName,
  groomImagesFolderName,
  photoGalleryFolderName,
  allAudioFilesFolderName,
  allFamilyMembersFolder,
} = process.env;

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'audio/mpeg', 'audio/mp3'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file type'), false);
    }
  },
}).fields([
  { name: 'brideActualImage', maxCount: 1 },
  { name: 'groomActualImage', maxCount: 1 },
  { name: 'userAudioFile', maxCount: 1 },
  { name: 'photoGallery_', maxCount: 10 },
  { name: 'family_', maxCount: 10 },
]);

const uploadMiddleware = upload;

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUDNAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
  secure: true,
});

const runMiddleware = (req, res, fn) => {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
};

const uploadMediaToCloudinary = async (buffer, folder, resourceType = 'image') => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: resourceType },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

const uploadMultipleFiles = async (files, folderName) => {
  const uploadPromises = files.map((file) =>
    uploadMediaToCloudinary(file.buffer, folderName)
  );
  return Promise.all(uploadPromises);
};

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  await runMiddleware(req, res, uploadMiddleware);

  try {
    const allData = JSON.parse(req.body.allData);
    const eventData = allData.eventDetails;
    const engagementData = allData.eventDetails.subEvents.engagementDetails;
    const sangeetData = allData.eventDetails.subEvents.sangeetDetails;
    const haldiData = allData.eventDetails.subEvents.haldiDetails;
    const brideData = allData.brideDetails;
    const groomData = allData.groomDetails;

    let userAudioFilePath = '';
    if (req.files['userAudioFile']) {
      userAudioFilePath = req.files['userAudioFile'][0].buffer;
    }

    const brideActualImage = req.files['brideActualImage'] ? req.files['brideActualImage'][0] : null;
    const groomActualImage = req.files['groomActualImage'] ? req.files['groomActualImage'][0] : null;
    const imageArray = req.files['photoGallery_'] || [];
    const familyImages = req.files['family_'] || [];

    if (!brideActualImage || !groomActualImage) {
      return res.status(400).json({
        message: 'Bride or Groom image is not found',
      });
    }

    const brideImage_secureUrl = await uploadMediaToCloudinary(
      brideActualImage.buffer,
      brideImagesFolderName
    );
    const groomImage_secureUrl = await uploadMediaToCloudinary(
      groomActualImage.buffer,
      groomImagesFolderName
    );

    const { cardStatus, cardLink, paymentStatus, selectedTemplate, userId } = JSON.parse(req.body.allData);
    const user_Id = new mongoose.Types.ObjectId(userId);

    const isCardAlreadyExists = await CardModel.findOne({ cardLink: cardLink, user: userId });

    if (isCardAlreadyExists) {
      return res.status(400).json({
        message: 'Card with same link already exists.',
        cardLinkExistsInDB: true,
      });
    }

    const savedCard = await CardModel.create({
      cardLink: cardLink,
      cardStatus: cardStatus,
      selectedTemplate: selectedTemplate,
      paymentStatus: paymentStatus,
      user: user_Id,
    });

    const {
      eventName,
      eventDate,
      raw_eventDate,
      eventTime,
      eventAddress,
      eventAddressGoogleMapLink,
      addEngagementDetails,
      addSangeetDetails,
      addHaldiDetails,
      addFamilyDetails,
      isEngagementAddressSameAsWedding,
      isSangeetAddressSameAsWedding,
      isHaldiAddressSameAsWedding,
      priorityBetweenBrideAndGroom,
      priorityBetweenFamily,
    } = eventData;

    const savedEvent = await EventModel.create({
      eventName: eventName,
      eventDate: eventDate,
      raw_eventDate: raw_eventDate,
      eventTime: eventTime,
      eventAddress: eventAddress,
      eventAddressGoogleMapLink: eventAddressGoogleMapLink,
      addEngagementDetails: addEngagementDetails,
      addSangeetDetails: addSangeetDetails,
      addHaldiDetails: addHaldiDetails,
      priorityBetweenFamily: priorityBetweenFamily,
      priorityBetweenBrideAndGroom: priorityBetweenBrideAndGroom,
      isEngagementAddressSameAsWedding: isEngagementAddressSameAsWedding,
      isSangeetAddressSameAsWedding: isSangeetAddressSameAsWedding,
      isHaldiAddressSameAsWedding: isHaldiAddressSameAsWedding,
      addFamilyDetails: addFamilyDetails,
      card: savedCard._id,
      user: user_Id,
    });

    let isEngagementDetailsSaved = false;
    let isSangeetDetailsSaved = false;
    let isHaldiDetailsSaved = false;
    let isBrideDetailsSaved = false;
    let isGroomDetailsSaved = false;
    let isPhotoGallerySaved = false;
    let isAudioFileSaved = false;
    let isFamilyDetailsSaved = false;

    if (addEngagementDetails) {
      const { engagementDate, raw_engagementDate, engagementTime, engagementAddress } = engagementData;
      let temp_engagementAddress = isEngagementAddressSameAsWedding ? 'Same as Wedding address' : engagementAddress;

      const savedEngagement = await EngagementModel.create({
        engagementDate: engagementDate,
        raw_engagementDate: raw_engagementDate,
        engagementTime: engagementTime,
        engagementAddress: temp_engagementAddress,
        card: savedCard._id,
        event: savedEvent._id,
        user: user_Id,
      });

      isEngagementDetailsSaved = !!savedEngagement;
    }

    if (addSangeetDetails) {
      const { sangeetDate, raw_sangeetDate, sangeetTime, sangeetAddress } = sangeetData;
      let temp_sangeetAddress = isSangeetAddressSameAsWedding ? 'Same as Wedding address' : sangeetAddress;

      const savedSangeet = await SangeetModel.create({
        sangeetDate: sangeetDate,
        raw_sangeetDate: raw_sangeetDate,
        sangeetTime: sangeetTime,
        sangeetAddress: temp_sangeetAddress,
        card: savedCard._id,
        event: savedEvent._id,
        user: user_Id,
      });

      isSangeetDetailsSaved = !!savedSangeet;
    }

    if (addHaldiDetails) {
      const { haldiDate, raw_haldiDate, haldiTime, haldiAddress } = haldiData;
      let temp_haldiAddress = isHaldiAddressSameAsWedding ? 'Same as Wedding address' : haldiAddress;

      const savedHaldi = await HaldiModel.create({
        haldiDate: haldiDate,
        raw_haldiDate: raw_haldiDate,
        haldiTime: haldiTime,
        haldiAddress: temp_haldiAddress,
        card: savedCard._id,
        event: savedEvent._id,
        user: user_Id,
      });

      isHaldiDetailsSaved = !!savedHaldi;
    }

    if (brideActualImage && brideData) {
      const {
        brideName,
        brideFatherName,
        brideMotherName,
        brideNativePlace,
        brideHigherEducation,
        brideWorkingPlace,
        brideWorkingAs,
        brideFacebookLink,
        brideInstagramLink,
      } = brideData;

      const savedBride = await BrideModel.create({
        brideImageUrl: brideImage_secureUrl,
        brideName: brideName,
        brideFatherName: brideFatherName,
        brideMotherName: brideMotherName,
        brideNativePlace: brideNativePlace,
        brideHigherEducation: brideHigherEducation,
        brideWorkingPlace: brideWorkingPlace,
        brideWorkingAs: brideWorkingAs,
        brideFacebookLink: brideFacebookLink,
        brideInstagramLink: brideInstagramLink,
        card: savedCard._id,
        event: savedEvent._id,
        user: user_Id,
      });

      isBrideDetailsSaved = !!savedBride;
    }

    if (groomActualImage && groomData) {
      const {
        groomName,
        groomFatherName,
        groomMotherName,
        groomNativePlace,
        groomHigherEducation,
        groomWorkingPlace,
        groomWorkingAs,
        groomFacebookLink,
        groomInstagramLink,
      } = groomData;

      const savedGroom = await GroomModel.create({
        groomImageUrl: groomImage_secureUrl,
        groomName: groomName,
        groomFatherName: groomFatherName,
        groomMotherName: groomMotherName,
        groomNativePlace: groomNativePlace,
        groomHigherEducation: groomHigherEducation,
        groomWorkingPlace: groomWorkingPlace,
        groomWorkingAs: groomWorkingAs,
        groomFacebookLink: groomFacebookLink,
        groomInstagramLink: groomInstagramLink,
        card: savedCard._id,
        event: savedEvent._id,
        user: user_Id,
      });

      isGroomDetailsSaved = !!savedGroom;
    }

    if (imageArray.length > 0) {
      const uploadedImages = await uploadMultipleFiles(imageArray, photoGalleryFolderName);
      const imageObjects = uploadedImages.map((url) => ({
        imageUrl: url,
        card: savedCard._id,
        event: savedEvent._id,
        user: user_Id,
      }));

      const savedPhotoGallery = await PhotoGalleryModel.insertMany(imageObjects);
      isPhotoGallerySaved = savedPhotoGallery.length === imageArray.length;
    }

    if (userAudioFilePath) {
      const userAudio_secureUrl = await uploadMediaToCloudinary(
        userAudioFilePath,
        allAudioFilesFolderName,
        'video'
      );

      const savedAudio = await AudioFileModel.create({
        audioUrl: userAudio_secureUrl,
        card: savedCard._id,
        event: savedEvent._id,
        user: user_Id,
      });

      isAudioFileSaved = !!savedAudio;
    }

    if (familyImages.length > 0 && addFamilyDetails) {
      const uploadedFamilyImages = await uploadMultipleFiles(familyImages, allFamilyMembersFolder);
      const familyMembersArray = allData.familyDetails;
      const familyImageObjects = uploadedFamilyImages.map((url, index) => ({
        familyMemberName: familyMembersArray[index].familyMemberName,
        familyMemberRelation: familyMembersArray[index].familyMemberRelation,
        familyMemberImageUrl: url,
        card: savedCard._id,
        event: savedEvent._id,
        user: user_Id,
      }));

      const savedFamilyImages = await FamilyModel.insertMany(familyImageObjects);
      isFamilyDetailsSaved = savedFamilyImages.length === familyImages.length;
    }

    return res.status(200).json({
      success: true,
      savedCard,
      savedEvent,
      message: 'Data saved successfully',
      isBrideDetailsSaved,
      isGroomDetailsSaved,
      isPhotoGallerySaved,
      isAudioFileSaved,
      isFamilyDetailsSaved,
      isEngagementDetailsSaved,
      isSangeetDetailsSaved,
      isHaldiDetailsSaved,
    });
  } catch (error) {
    console.error('Error in handler:', error);
    return res.status(500).json({
      success: false,
      error: 'An error occurred while processing your request',
    });
  }
}
