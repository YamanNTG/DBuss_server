const User = require('../models/User');
const Issues = require('../models/Issues');

const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');

const createIssue = async (req, res) => {
  req.body.user = req.user.userId;
  const issue = await Issues.create(req.body);

  res.status(StatusCodes.OK).json({ issue });
};
const getAllIssues = async (req, res) => {
  const issues = await Issues.find({})
    .populate({
      path: 'user',
      select: 'name profileImage',
    })
    .sort({ createdAt: -1 });
  res.status(StatusCodes.OK).json({ issues, count: issues.length });
};
const getSingleIssue = async (req, res) => {
  const { id: issueId } = req.params;
  const issue = await Issues.findOne({ _id: issueId });
  if (!issue) {
    throw new CustomError.NotFoundError(`No issue with id : ${issueId}`);
  }
  res.status(StatusCodes.OK).json({ issue });
};

const updateIssue = async (req, res) => {
  const { id: issueId } = req.params;
  const issue = await Issues.findOneAndUpdate({ _id: issueId }, req.body, {
    new: true,
    runValidators: true,
  });
  if (!issue) {
    throw new CustomError.NotFoundError(`No issue with id : ${issueId}`);
  }
  res.status(StatusCodes.OK).json({ issue });
};

const deleteIssue = async (req, res) => {
  const { id: issueId } = req.params;
  const issue = await Issues.findOne({ _id: issueId });
  if (!issue) {
    throw new CustomError.NotFoundError(`No news with id : ${issueId}`);
  }
  await issue.remove();
  res.status(StatusCodes.OK).json({ msg: 'Success! Issue removed.' });
};

module.exports = {
  createIssue,
  getAllIssues,
  getSingleIssue,
  updateIssue,
  deleteIssue,
};
