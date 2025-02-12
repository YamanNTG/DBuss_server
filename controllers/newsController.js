const User = require('../models/User');
const News = require('../models/News');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const { promises: fsPromises } = require('fs');

const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');

const createNews = async (req, res) => {
  req.body.user = req.user.userId;
  const news = await News.create(req.body);

  res.status(StatusCodes.OK).json({ news });
};

const getAllNews = async (req, res) => {
  const news = await News.find({});
  res.status(StatusCodes.OK).json({ news, count: news.length });
};
const getSingleNews = async (req, res) => {
  const { id: newsId } = req.params;
  const news = await News.findOne({ _id: newsId });
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
  res.status(StatusCodes.OK).json({ news });
};

const deleteNews = async (req, res) => {
  console.log(req.params);

  const { id: newsId } = req.params;
  const news = await News.findOne({ _id: newsId });
  if (!news) {
    throw new CustomError.NotFoundError(`No news with id : ${newsId}`);
  }
  await news.remove();
  res.status(StatusCodes.OK).json({ msg: 'Success! News removed.' });
};

const uploadImage = async (req, res) => {
  try {
    if (!req.files || !req.files.image) {
      throw new CustomError.BadRequestError('No file uploaded');
    }

    const file = req.files.image;

    if (!file.mimetype.startsWith('image')) {
      throw new CustomError.BadRequestError('Please upload an image file');
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new CustomError.BadRequestError('Image size must be less than 5MB');
    }

    try {
      const result = await cloudinary.uploader.upload(file.tempFilePath, {
        use_filename: true,
        folder: 'TransitTask-Assets',
      });

      // Use fsPromises.unlink instead of fs.unlink
      await fsPromises.unlink(file.tempFilePath);

      return res.status(StatusCodes.OK).json({ image: result.secure_url });
    } catch (cloudinaryError) {
      // Clean up temp file if cloudinary upload fails
      try {
        await fsPromises.unlink(file.tempFilePath);
      } catch (unlinkError) {
        console.error('Error cleaning up temp file:', unlinkError);
      }
      console.error('Cloudinary Error:', cloudinaryError);
      throw new CustomError.BadRequestError('Error uploading to cloud storage');
    }
  } catch (error) {
    console.error('Upload Error:', error);
    // If there's a temp file, try to clean it up
    if (req.files?.image?.tempFilePath) {
      try {
        await fsPromises.unlink(req.files.image.tempFilePath);
      } catch (unlinkError) {
        console.error('Error cleaning up temp file:', unlinkError);
      }
    }
    throw error;
  }
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
};
