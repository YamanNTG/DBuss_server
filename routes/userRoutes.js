const express = require("express");
const router = express.Router();

const {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
} = require("../controllers/userCrontroller");

router.route("/").get(getAllUsers); //ap1/v1/users will be the main route

router.route("/showMe").get(showCurrentUser); // ex. ap1/v1/users/showMe
router.route("/updateUser").patch(updateUser);
router.route("/updateUserPassword").patch(updateUserPassword);

router.route("/:id").get(getSingleUser); // position matter so the other routes will not be cosidered as the id's

module.exports = router;
