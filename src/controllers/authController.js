"use strict";

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/userModel");
const Token = require("../models/tokenModel");
const { CustomError } = require("../errors/customError");
const { sendEmail } = require("../utils/email/emailService");
const { getWelcomeEmailHtml } = require("../utils/email/welcome/welcomeEmail");
const {
  getForgotPasswordEmailHtml,
} = require("../utils/email/forgot/forgotPassword");
const {
  getResetPasswordEmailHtml,
} = require("../utils/email/reset/resetPassword");
const {
  generateAccessToken,
  generateRefreshToken,
  generateAuthTokens,
  generateResetPasswordCode,
  generateVerifyEmailToken,
} = require("../helpers/tokenGenerator");
const {
  CLIENT_URL,
  VERIFY_EMAIL_KEY,
  RESET_PASSWORD_KEY,
  REFRESH_KEY,
} = require("../../setups");
const { isTokenExpired } = require("../utils/functions");
const {
  validateRegisterPayload,
  validateLoginPayload,
} = require("../validators/authValidator");
const { redirectWithError } = require("../errors/redirectWithError");

module.exports = {
  register: async (req, res) => {
    /*
        #swagger.tags = ["Authentication"]
        #swagger.summary = "Register"
        #swagger.description = 'Register with valid firstName, lastName, email and password'
        // _swagger.deprecated = true
        // _swagger.ignore = true
        #swagger.parameters["body"] = {
            in: "body",
            required: true,
             schema: {
              "fullName": "John Doe",
              "email": "john.doe@gmail.com",
              "password": "Test@1234",
              "userType": "individual"
             }
      }
    */
    const { fullName, email, password, userType } = req.body;

    const validationError = await validateRegisterPayload(req.body);

    if (validationError) {
      throw new CustomError(validationError, 400);
    }

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      throw new CustomError("Email already exists!", 400);
    }

    // Create new user
    const hashedPassword = bcrypt.hashSync(password, 10);
    user = new User({
      fullName,
      email,
      userType,
      password: hashedPassword,
      isActive: false, // user will active his account via verification email
    });

    // Save new user to the database
    const newUser = await user.save();

    const verifyEmailToken = generateVerifyEmailToken(newUser);

    const verifyData = {
      verifyToken: verifyEmailToken,
      email,
    };

    // Send email to user
    const emailSubject = "Welcome to Volunteerium!";
    const emailHtml = getWelcomeEmailHtml(
      fullName.split(" ")[0],
      encodeURIComponent(JSON.stringify(verifyData))
    );

    await sendEmail(email, emailSubject, emailHtml);

    res.status(201).send({
      error: false,
      message: "Please verify your email to complete your registration",
    });
  },
  authSuccess: async (req, res) => {
    /*
      #swagger.tags = ["Authentication"]
      #swagger.summary = "Successful Authentication Callback"
      #swagger.description = "Handles successful authentication, generates tokens, and redirects the user to the client URL with user data encoded in the query parameters."
      #swagger.responses[302] = {
        description: 'Redirects to the client URL with user data',
        headers: {
          Location: {
            description: 'The URL to which the user is redirected after successful authentication.',
            schema: {
              type: 'string',
              example: 'https://your-client-url.com/auth/success?provider=google&user=%7B%22error%22:false,%22message%22:%22You%20are%20successfully%20logged%20in!%22,%22bearer%22:%7B%22access%22:%22access-token%22,%22refresh%22:%22refresh-token%22%7D,%22token%22:%22token-data%22,%22user%22:%7B%22id%22:%22user-id%22,%22name%22:%22John%20Doe%22%7D%7D'
            }
          }
        }
      }
      #swagger.responses[400] = {
        description: 'Bad request if the user is not authenticated',
        schema: {
          error: true,
          message: 'Authentication failed or user not found'
        }
      }
      #swagger.security = [{
        "bearerAuth": []
      }]
    */
    if (!req.user) {
      return res.redirect(`${CLIENT_URL}/auth/failure?provider=google`);
    }
    // console.log("User: ", req.user);
    // res.redirect(`${CLIENT_URL}/auth/success?provider=google`);
    // Successful authentication, send user data to frontend

    const { simpleToken, accessToken, refreshToken } = await generateAuthTokens(
      req.user
    );

    const data = {
      error: false,
      message: "You are successfully logged in!",
      bearer: {
        access: accessToken,
        refresh: refreshToken,
      },
      token: simpleToken,
      user: req.user,
    };
    res.redirect(
      `${CLIENT_URL}/auth/success?provider=google&user=${encodeURIComponent(
        JSON.stringify(data)
      )}`
    );
  },
  // POST
  verifyAccount: async (req, res) => {
    /*
      #swagger.tags = ['Authentication']
      #swagger.summary = 'Verification'
      #swagger.description = 'Verify user email with a verification token'
      #swagger.parameters['token'] = {
        in: 'path',
        description: 'Verification token received via email',
        required: true,
        type: 'string'
      }
  */
    const { email, verifyEmailToken } = req.body;

    if (email && verifyEmailToken) {
      let verifyData;

      // Decode user
      try {
        verifyData = jwt.verify(verifyEmailToken, VERIFY_EMAIL_KEY);
      } catch (error) {
        return redirectWithError(
          res,
          `${CLIENT_URL}/verify-email/failed`,
          400,
          "Invalid or expired verification link! Please request verification link again."
        );
        // return res.redirect(
        //   `${CLIENT_URL}/verify-email/failed?payload=${encodeURIComponent(
        //     JSON.stringify({
        //       statusCode: 400,
        //       message:
        //         "Invalid or expired verification link! Please request verification link again.",
        //     })
        //   )}`
        // );
      }

      // Find user
      const user = await User.findById(verifyData.userId);

      if (!user) {
        return redirectWithError(
          res,
          `${CLIENT_URL}/verify-email/failed`,
          404,
          "No account found! Please sign up."
        );
      }

      if (verifyData.email === email) {
        if (user.isActive) {
          return redirectWithError(
            res,
            `${CLIENT_URL}/verify-email/failed`,
            400,
            "Account is already verifed! Please log in."
          );
        } else {
          // Activate user status
          user.isActive = true;
          await user.save();
        }
      } else {
        return redirectWithError(
          res,
          `${CLIENT_URL}/verify-email/failed`,
          400,
          "Invalid request. Please try again!"
        );
      }

      const { simpleToken, accessToken, refreshToken } =
        await generateAuthTokens(user);

      // Success response
      res.status(200).send({
        error: false,
        message: `Hey ${data.fullName.split(" ")[0]}, you're verified! 🎉`,
        bearer: {
          access: accessToken,
          refresh: refreshToken,
        },
        token: simpleToken,
        user,
      });
    } else if (email && !verifyEmailToken) {
      // Find user
      const user = await User.findOne({ email });

      if (!user) {
        return redirectWithError(
          res,
          `${CLIENT_URL}/verify-email/failed`,
          404,
          "No account found! Please sign up."
        );
      }

      if (!user.isActive) {
        // Generate new verification token
        const verifyEmailToken = generateVerifyEmailToken(user);

        const verifyData = {
          token: verifyEmailToken,
          email,
        };

        // Send email to user
        const emailSubject = "Verify Your Email for Volunteerium!";
        const emailHtml = getWelcomeEmailHtml(
          user.fullName.split(" ")[0],
          encodeURIComponent(JSON.stringify(verifyData))
        );

        await sendEmail(email, emailSubject, emailHtml);

        // res.status(200).send({
        //   error: false,
        //   message:
        //     "Verification email has been sent again. Please check your inbox.",
        // });

        return res.redirect(`${CLIENT_URL}/verify-email`);
      } else {
        return redirectWithError(
          res,
          `${CLIENT_URL}/verify-email/failed`,
          400,
          "Account is already verified. Please log in!"
        );
      }
    } else {
      return redirectWithError(
        res,
        `${CLIENT_URL}/not-found`,
        404,
        "Invalid request. Please try again!"
      );
    }
  },
  // POST
  login: async (req, res) => {
    /*
      #swagger.tags = ["Authentication"]
      #swagger.summary = "Login"
      #swagger.description = 'Login with email and password for get simpleToken and JWT'
      _swagger.deprecated = true
      _swagger.ignore = true
      #swagger.parameters["body"] = {
          in: "body",
          required: true,
          schema: {
              "email": "testUser@gmail.com",
              "password": "Test@1234",
          }
      }
    */
    const { email, password } = req.body;
    // console.log("Login attempt:", email, password);

    const validationError = await validateLoginPayload(req.body);

    if (validationError) {
      throw new CustomError(validationError, 400);
    }

    if (email && password) {
      const user = await User.findOne({ email });
      // console.log("User found:", user);

      if (!user) {
        throw new CustomError(
          "Wrong email or password. Please try to register or login again!",
          401
        );
      }

      const isPasswordMatch = await bcrypt.compare(password, user.password);
      // console.log("Password validation result:", isPasswordMatch);
      if (isPasswordMatch) {
        //^ SIMPLE TOKEN
        let tokenData = await Token.findOne({
          userId: user._id,
        });
        // console.log("Token data found:", tokenData);

        let accessToken = "";
        let refreshToken = "";
        let simpleToken = tokenData?.token || "";

        if (!tokenData) {
          const authTokens = await generateAuthTokens(user);
          accessToken = authTokens.accessToken;
          refreshToken = authTokens.refreshToken;
          simpleToken = authTokens.simpleToken;
        } else {
          accessToken = generateAccessToken(user);
          refreshToken = generateRefreshToken(user);
        }

        console.log("Login response data:", {
          accessToken,
          refreshToken,
          simpleToken,
        }); // Debugging

        //! Response for TOKEN and JWT
        res.status(200).send({
          error: false,
          message: "You are successfully logged in!",
          bearer: {
            access: accessToken,
            refresh: refreshToken,
          },
          token: simpleToken,
          user,
        });
      } else {
        throw new CustomError(
          "Wrong email or password. Please try again!",
          401
        );
      }
    } else {
      throw new CustomError("Please provide a valid email and password", 401);
    }
  },
  // POST
  forgot: async (req, res) => {
    /*
    #swagger.tags = ['Authentication']
    #swagger.summary = 'Forgot'
    #swagger.description = 'Request a url with email to reset password'
    #swagger.parameters['body'] = {
        in: 'body',
        required: true,
        schema: {
            "email":"testUser@gmail.com",
            "resetPasswordToken": "optionalExistingToken"
        }
    }
  */
    //* As default we will receive just email in body. But if we have to resend resetCode again, we have to get both email and resetPasswordToken in body.

    const { email, resetPasswordToken } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      throw new CustomError("No account found!", 401);
    }

    let resetCode;
    let newResetPasswordToken;

    if (resetPasswordToken) {
      // Decode the token and check its validity
      try {
        const decodedToken = jwt.verify(resetPasswordToken, RESET_PASSWORD_KEY);
        if (decodedToken.email === email && !isTokenExpired(decodedToken)) {
          // Token is valid
          resetCode = decodedToken.resetCode;
          newResetPasswordToken = resetPasswordToken;
        } else if (decodedToken.email === email) {
          // Token is expired
          ({ resetCode, resetPasswordToken: newResetPasswordToken } =
            generateResetPasswordCode(user));
        } else {
          return res.status(400).send({
            error: true,
            message: "Invalid request. Please provide correct email address!",
          });
        }
      } catch (err) {
        return res.status(400).send({
          error: true,
          message: "Something went wrong. Please request code again!",
        });
      }
    } else {
      // No token provided, generate a new one
      ({ resetCode, resetPasswordToken: newResetPasswordToken } =
        generateResetPasswordCode(user));
    }

    // console.log("ResetCode and token: ", {resetCode, newResetPasswordToken});

    if ((resetCode, newResetPasswordToken)) {
      // Send forgot request email to user
      const forgotEmailSubject = "Password Reset Request!";
      const forgotEmailHtml = getForgotPasswordEmailHtml(
        user.fullName.split(" ")[0],
        newResetPasswordToken,
        resetCode
      );

      await sendEmail(email, forgotEmailSubject, forgotEmailHtml);

      res.status(200).send({
        error: false,
        resetToken: newResetPasswordToken,
        message:
          "Password reset code has been sent to your e-mail. Please check your mailbox.",
      });
    }
  },
  // POST
  verifyReset: async (req, res) => {
    const { resetToken, resetCode, email } = req.body;

    if (!email || !resetToken || !resetCode) {
      throw new CustomError(
        "Email, reset token, and reset code are required",
        400
      );
    }

    let decoded;
    try {
      decoded = jwt.verify(resetToken, RESET_PASSWORD_KEY);
    } catch (err) {
      return res.status(400).send({
        error: true,
        message: "Invalid or expired reset token",
      });
    }

    if (decoded.email !== email || decoded.code !== resetCode) {
      return res.status(400).send({
        error: true,
        message: "Invalid reset code or email",
      });
    }

    const newResetToken = jwt.sign(
      { userId: decoded.userId, email: decoded.email, isVerified: true },
      RESET_PASSWORD_KEY,
      { expiresIn: "30m" }
    );

    return res.status(200).send({
      error: false,
      resetToken: newResetToken,
      message: "Reset token verified successfully",
    });
  },
  // POST
  reset: async (req, res) => {
    /*
      #swagger.tags = ['Authentication']
      #swagger.summary = 'JWT: Reset'
      #swagger.description = 'Reset password with email, new password, and refresh token.'
      #swagger.parameters['body'] = {
          in: 'body',
          required: true,
          schema: {
            email: 'testUser@gmail.com',
            newPassword: 'newPassword@123',
          }
      }
      #swagger.parameters['token'] = {
        in: 'path',
        required: true,
        type: 'string',
        description: 'Refresh token received via email',
      }
    */
    const { email, newPassword } = req.body;
    const { resetToken } = req.params;

    if (!email || !newPassword || !resetToken) {
      throw new CustomError("Missing required fields!", 400);
    }

    let decoded;
    try {
      decoded = jwt.verify(resetToken, RESET_PASSWORD_KEY);
    } catch (err) {
      return res.status(400).send({
        error: true,
        message: "Invalid or expired reset token",
      });
    }

    if (decoded.email !== email || !decoded.isVerified) {
      return res.status(400).send({
        error: true,
        message: "Invalid reset token or email",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      throw new CustomError("No user found with this email", 404);
    }

    const validationError = await validateRegisterPayload({
      password: newPassword,
    });

    if (validationError) {
      throw new CustomError(validationError, 400);
    }

    const hashedNewPassword = bcrypt.hashSync(newPassword, 10);
    user.password = hashedNewPassword;
    await user.save();

    const resetEmailSubject = "Password Reset Confirmation!";
    const resetEmailHtml = getResetPasswordEmailHtml(
      user.fullName.split(" ")[0]
    );

    await sendEmail(email, resetEmailSubject, resetEmailHtml);

    res.status(200).send({
      error: false,
      message: "Your password has been successfully reset!",
    });
  },
  // POST
  refresh: async (req, res) => {
    /*
      #swagger.tags = ['Authentication']
      #swagger.summary = 'JWT: Refresh'
      #swagger.description = 'Refresh accessToken with refreshToken'
      #swagger.parameters['body'] = {
        in: 'body',
        required: true,
        schema: {
            bearer: {
                refresh: '...refreshToken...'
            }
        }
      }
    */
    const refreshToken = req.body?.bearer?.refresh;

    if (refreshToken) {
      // Verify the refresh token
      const refreshData = jwt.verify(refreshToken, REFRESH_KEY);

      if (refreshData) {
        const { userId } = refreshData;

        // Check if id exist in token data
        if (userId) {
          // Find the user by id in the database
          const user = await User.findOne({ userId });

          if (user) {
            // Check if the user is active
            if (user.isActive) {
              // Generate a new JWT access token
              const accessToken = generateAccessToken(user);

              // Return the new access token
              res.status(200).send({
                error: false,
                bearer: {
                  access: accessToken,
                },
              });
            } else {
              throw new CustomError(
                "Unverified Account. Please verify your email address!",
                401
              );
            }
          } else {
            throw new CustomError("Wrong user data!", 401);
          }
        } else {
          throw new CustomError("No data found in refresh token!", 404);
        }
      } else {
        throw new CustomError(
          "JWT refresh token has expired or is invalid!",
          401
        );
      }
    } else {
      throw new CustomError("No refresh token provided!", 401);
    }
  },
  // GET
  logout: async (req, res) => {
    /*
      #swagger.tags = ["Authentication"]
      #swagger.summary = "SimpleToken: Logout"
      #swagger.description = 'Delete simple token key and bypass JWT token'
    */

    const auth = req.headers?.authorization;
    const tokenKey = auth ? auth.split(" ") : null;
    let deleted = null;

    if (tokenKey) {
      if (tokenKey[0] == "Token") {
        // Simple Token Logout
        deleted = await Token.deleteOne({ token: tokenKey[1] });
      } else if (tokenKey[0] == "Bearer") {
        // JWT Token Logout - No action needed, just confirm logout
        deleted = true;
      }
    } else {
      throw new CustomError("No Authorization Header provided!", 401);
    }

    res.status(deleted !== null ? 200 : 400).send({
      error: !deleted !== null,
      message:
        deleted !== null
          ? "You are successfully logged out!"
          : "Logout failed. Please try again!",
    });
  },
};
