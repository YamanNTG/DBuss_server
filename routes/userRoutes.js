const express = require('express');
const router = express.Router();
const {
  authenticateUser,
  authorizePermissions,
} = require('../middleware/authentication');

const {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
} = require('../controllers/userCrontroller');

router
  .route('/')
  .get(authenticateUser, authorizePermissions('admin'), getAllUsers); //ap1/v1/users will be the main route

router.route('/showMe').get(authenticateUser, showCurrentUser); // ex. ap1/v1/users/showMe
router.route('/updateUser').patch(authenticateUser, updateUser);
router.route('/updateUserPassword').patch(authenticateUser, updateUserPassword);

router.route('/:id').get(authenticateUser, getSingleUser); // position matter so the other routes will not be cosidered as the id's

module.exports = router;
