const createError = require("http-errors");

const { clearTokens } = require("../utils/auth");

const { users, tokens } = require("../data/data");

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

const login = async (req, res, next) => {
  const { username, password } = req.body;
  try {
    // Missing fields
    if (!username || !password) {
      return res
        .status(422)
        .json({ error: "Please fill all the required fields" });
    }

    // User exists?
    const userExists = users.find((user) => {
      if (user.userName === username || user.email === username) {
        return true;
      }
      return false;
    });

    // User doesnt exist throw error
    if (!userExists) {
      const error = createError.Unauthorized("Invalid username or password");
      throw error;
    }

    // Passwords match
    const passwordsMatch = user.password === password;

    // Passwords dont match throw error
    if (!passwordsMatch) {
      const error = createError.Unauthorized("Invalid username or password");
      throw error;
    }

    // User is logged in
    req.userId = user.id;
    return next();
  } catch (error) {
    return next(error);
  }
};

const logout = async (req, res, next) => {
  await clearTokens(req, res, next);
  return res.sendStatus(204);
};

const refreshAccessToken = async (req, res, next) => {
  // Get env vars
  const { REFRESH_TOKEN_SECRET, ACCESS_TOKEN_SECRET, ACCESS_TOKEN_LIFE } =
    process.env;

  // Access and validate refreshtoken from cookies
  const { refreshToken: refreshTokenFromCookies } = req.signedCookies;
  if (!refreshTokenFromCookies) {
    return res.sendStatus(204);
  }

  try {
    // Find and validate refreshtoken from database
    const refreshTokenInDB = tokens.find(
      (token) => token.refreshToken === refreshTokenFromCookies
    )?.refreshToken;

    if (!refreshTokenInDB) {
      await clearTokens(req, res, next);
      const error = createError.Unauthorized();
      throw error;
    }

    try {
      const decodedToken = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
      const { userId } = decodedToken;

      const user = users.find((user) => user.id === userId);
      if (!user) {
        await clearTokens(req, res);
        const error = createError("Invalid credentials", 401);
        throw error;
      }

      // Generate JWT refreshtoken and send to user
      const accessToken = generateJWT(
        user.id,
        ACCESS_TOKEN_SECRET,
        ACCESS_TOKEN_LIFE
      );

      return res.status(200).json({
        user,
        accessToken,
        expiresAt: new Date(Date.now() + ms(ACCESS_TOKEN_LIFE)),
      });
    } catch (error) {
      return next(error);
    }
  } catch (error) {
    return next(error);
  }
};

module.exports = { signUp, login, logout, refreshAccessToken };
