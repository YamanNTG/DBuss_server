const express = require('express');
const router = express.Router();

const {
  authenticateUser,
  authorizePermissions,
} = require('../middleware/authentication');

const {
  createNews,
  getAllNews,
  getSingleNews,
  updateNews,
  deleteNews,
  uploadImage,
} = require('../controllers/newsController');

router
  .route('/')
  .post([authenticateUser, authorizePermissions('admin')], createNews)
  .get(getAllNews);
router
  .route('/uploadImage')
  .post([authenticateUser, authorizePermissions('admin')], uploadImage);
router
  .route('/:id')
  .get(getSingleNews)
  .patch([authenticateUser, authorizePermissions('admin')], updateNews)
  .delete([authenticateUser, authorizePermissions('admin')], deleteNews);

module.exports = router;
