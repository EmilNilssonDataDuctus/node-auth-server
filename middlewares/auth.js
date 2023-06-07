const jwt = require("jsonwebtoken");
const createError = require("http-errors");
const ms = require("ms");

const { generateJWT } = require("../utils/auth");

const {
  ACCESS_TOKEN_LIFE,
  REFRESH_TOKEN_LIFE,
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET,
} = process.env;

const dev = NODE_ENV === "development";

const { users, tokens } = require("../data/data");

const generateAuthTokens = async (req, res, next) => {
  try {
    const user = user.find((user) => user.id === req.userId);

    const refreshToken = generateJWT(
      req.userId,
      REFRESH_TOKEN_SECRET,
      REFRESH_TOKEN_LIFE
    );

    const accessToken = generateJWT(
      req.userId,
      ACCESS_TOKEN_SECRET,
      ACCESS_TOKEN_LIFE
    );

    const token = {
      refreshToken,
      userId: req.userId,
      expirationTime: new Date(Date.now() + ms(REFRESH_TOKEN_LIFE)).getTime(),
    };

    tokens.push(token);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: !dev,
      signed: true,
      expires: new Date(Date.now() + ms(ACCESS_TOKEN_LIFE)),
    });

    const expiresAt = new Date(Date.now() + ms(ACCESS_TOKEN_LIFE));

    return res.status(200).json({
      user,
      token: accessToken,
      expiresAt,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  generateAuthTokens,
};
