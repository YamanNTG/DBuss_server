const express = require('express');
const router = express.Router();

const {
  authenticateUser,
  authorizePermissions,
} = require('../middleware/authentication');

const {
  createIssue,
  getAllIssues,
  getSingleIssue,
  updateIssue,
  deleteIssue,
} = require('../controllers/issuesController');

router.route('/').post(authenticateUser, createIssue).get(getAllIssues);
router
  .route('/:id')
  .get(getSingleIssue)
  .patch([authenticateUser, authorizePermissions('admin')], updateIssue)
  .delete([authenticateUser, authorizePermissions('admin')], deleteIssue);

module.exports = router;
