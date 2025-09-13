const User = require('../models/User');
const News = require('../models/News');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const socketService = require('../utils/socketService');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');

const createNews = async (req, res) => {
  req.body.user = req.user.userId;
  const news = await News.create(req.body);

  // Emit socket event for real-time updates
  socketService.getIO().emit('newsCreated', news);

  res.status(StatusCodes.OK).json({ news });
};

const getAllNews = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const news = await News.find({})
    .populate({
      path: 'user',
      select: 'name profileImage',
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await News.countDocuments();

  res.status(StatusCodes.OK).json({
    news,
    count: news.length,
    currentPage: page,
    totalPages: Math.ceil(total / limit),
    hasMore: skip + news.length < total,
  });
};

const getSingleNews = async (req, res) => {
  const { id: newsId } = req.params;
  const news = await News.findOne({ _id: newsId }).populate({
    path: 'user',
    select: 'name profileImage',
  });

  if (!news) {
    throw new CustomError.NotFoundError(`No news with id : ${newsId}`);
  }

  res.status(StatusCodes.OK).json({ news });
};

const updateNews = async (req, res) => {
  const { id: newsId } = req.params;
  const news = await News.findOneAndUpdate({ _id: newsId }, req.body, {
    new: true,
    runValidators: true,
  });

  if (!news) {
    throw new CustomError.NotFoundError(`No news with id : ${newsId}`);
  }

  // Emit socket event for real-time updates
  socketService.getIO().emit('newsUpdated', news);

  res.status(StatusCodes.OK).json({ news });
};

const deleteNews = async (req, res) => {
  const { id: newsId } = req.params;
  const news = await News.findOne({ _id: newsId });

  if (!news) {
    throw new CustomError.NotFoundError(`No news with id : ${newsId}`);
  }

  await news.remove();

  // Emit socket event for real-time updates
  socketService.getIO().emit('newsDeleted', newsId);

  res.status(StatusCodes.OK).json({ msg: 'Success! News removed.' });
};

const uploadImage = async (req, res) => {
  const result = await cloudinary.uploader.upload(
    req.files.image.tempFilePath,
    {
      use_filename: true,
      folder: 'TransitTask-Assets',
    }
  );
  fs.unlinkSync(req.files.image.tempFilePath);

  return res.status(StatusCodes.OK).json({ image: result.secure_url });
};

const uploadImageLocal = async (req, res) => {
  if (!req.files) {
    throw new CustomError.BadRequestError('No file Uploaded');
  }

  const newsImage = req.files.image;
  if (!newsImage.mimetype.startsWith('image')) {
    throw new CustomError.BadRequestError('Please Upload Image');
  }
  const maxSize = 1024 * 1024 * 2;
  if (newsImage.size > maxSize) {
    throw new CustomError.BadRequestError(
      'Please upload image smaller than 2 MB'
    );
  }
  const imagePath = path.join(
    __dirname,
    '../public/uploads/' + `${newsImage.name}`
  );
  await newsImage.mv(imagePath);
  return res
    .status(StatusCodes.OK)
    .json({ image: { src: `/uploads/${newsImage.name}` } });
};

module.exports = {
  createNews,
  getAllNews,
  getSingleNews,
  updateNews,
  deleteNews,
  uploadImage,
  uploadImageLocal,
};
