const User = require('../models/User');
const Issues = require('../models/Issues');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const socketService = require('../utils/socketService');

const createIssue = async (req, res) => {
  req.body.user = req.user.userId;
  const issue = await Issues.create(req.body);

  socketService.getIO().emit('issueCreated', issue);

  res.status(StatusCodes.OK).json({ issue });
};
const getAllIssues = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const issues = await Issues.find({})
    .populate({
      path: 'user',
      select: 'name profileImage',
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Issues.countDocuments();

  res.status(StatusCodes.OK).json({
    issues,
    count: issues.length,
    currentPage: page,
    totalPages: Math.ceil(total / limit),
    hasMore: skip + issues.length < total,
  });
};
const getActiveIssues = async (req, res) => {
  const activeIssues = await Issues.find({
    status: { $in: ['open', 'in=progress'] },
  });
  const resolvedIssues = await Issues.find({
    status: { $in: ['resolved'] },
  });

  const totalActiveIssues = activeIssues.length;
  const totalResolvedIssues = resolvedIssues.length;

  res.status(StatusCodes.OK).json({ totalActiveIssues, totalResolvedIssues });
};
const getSingleIssue = async (req, res) => {
  const { id: issueId } = req.params;
  const issue = await Issues.findOne({ _id: issueId }).populate({
    path: 'user',
    select: 'name profileImage',
  });
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

  socketService.getIO().emit('issueUpdated', issue);

  res.status(StatusCodes.OK).json({ issue });
};

const deleteIssue = async (req, res) => {
  const { id: issueId } = req.params;
  const issue = await Issues.findOne({ _id: issueId });
  await issue.remove();

  socketService.getIO().emit('issueDeleted', issueId);

  res.status(StatusCodes.OK).json({ msg: 'Success! Issue removed.' });
};

module.exports = {
  createIssue,
  getAllIssues,
  getSingleIssue,
  updateIssue,
  deleteIssue,
  getActiveIssues,
};
