const createError = require("http-errors");

const { users } = require("../data/data");

const signUp = async (req, res, next) => {
  const { name, username, email, password } = req.body;

  if (!name || !username || !email || !password) {
    return res
      .status(422)
      .json({ error: "Please fill all the required fields" });
  }

  try {
    const userAlreadyExists = users.find((user) => {
      if (user.userName === username || user.email === email) {
        return true;
      }
      return false;
    });

    if (userAlreadyExists) {
      return res
        .status(422)
        .json({ error: "Username or email already exists" });
    }

    const newUser = {
      id: users[users.length - 1].id + 1,
      name: name,
      userName: username,
      email: email,
      password: password,
    };

    users.push(newUser);

    req.userId = newUser.id;
    return next();
  } catch (error) {
    return next(error);
  }
};

module.exports = { signUp };
