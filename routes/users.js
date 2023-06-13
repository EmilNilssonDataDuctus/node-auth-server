const router = require("express").Router();

const { isAuthenticated } = require("../middlewares/auth");

const usersControllers = require("../controllers/users");

router.get("/list", isAuthenticated, usersControllers.getUsersList);

router.get("/me", isAuthenticated, usersControllers.getAuthenticatedUser);

router.get("/:id", isAuthenticated, usersControllers.getUserById);

module.exports = router;
