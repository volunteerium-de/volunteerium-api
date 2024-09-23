"use strict";

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/userModel");
const UserDetails = require("../models/userDetailsModel");
const Token = require("../models/tokenModel");
const { CustomError } = require("../errors/customError");
const { sendEmail } = require("../utils/email/emailService");
const { getWelcomeEmailHtml } = require("../utils/email/welcome/welcome.js");
const {
  getForgotPasswordEmailHtml,
} = require("../utils/email/forgot/forgot.js");
const { getResetPasswordEmailHtml } = require("../utils/email/reset/reset.js");
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
        #swagger.description = 'Register with valid fullName, email, and password'
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
        #swagger.responses[201] = {
            description: 'User registered successfully',
            schema: {
                error: false,
                message: "Please verify your email to complete your registration"
            }
        }
        #swagger.responses[400] = {
            description: 'Bad request, validation error',
            schema: {
                error: true,
                message: 'Validation error message'
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
      [userType === "organization" ? "organizationName" : "fullName"]: fullName,
      email,
      userType,
      password: hashedPassword,
      isActive: true,
      isProfileSetup: false,
      isEmailVerified: false, // user will active his account via verification email
    });

    // Save new user to the database
    const newUser = await user.save();

    // Create new user details
    const userDetails = new UserDetails({
      userId: newUser._id,
    });
    const newUserDetails = await userDetails.save();

    // Update userDetails for new user
    newUser.userDetailsId = newUserDetails._id;
    await newUser.save();

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
  verifyEmail: async (req, res) => {
    /*
      #swagger.tags = ['Authentication']
      #swagger.summary = 'Verify Email'
      #swagger.description = 'Verify user email with a verification token'
      #swagger.parameters['token'] = {
        in: 'path',
        description: 'Verification token received via email',
        required: true,
        type: 'string'
      }
      #swagger.responses[200] = {
        description: 'Email verified successfully',
        schema: {
          error: false,
          message: 'Successfully verified!',
          bearer: {
            access: 'access-token',
            refresh: 'refresh-token',
          },
          token: 'simple-token',
          user: {
            _id: 'user-id',
            fullName: 'John Doe',
            ...
          }
        }
      }
      #swagger.responses[400] = {
        description: 'Invalid or expired verification link',
        schema: {
          error: true,
          message: 'Invalid or expired verification link! Please request verification link again.'
        }
      }
      #swagger.responses[404] = {
        description: 'No account found',
        schema: {
          error: true,
          message: 'No account found! Please sign up.'
        }
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
          301,
          "Invalid or expired verification link! Please request verification link again."
        );
        // return res.redirect(
        //   `${CLIENT_URL}/verify-email/failed?payload=${encodeURIComponent(
        //     JSON.stringify({
        //       statusCode: 301,
        //       message:
        //         "Invalid or expired verification link! Please request verification link again.",
        //     })
        //   )}`
        // );
      }

      // Find user
      const user = await User.findById(verifyData.userId).populate(
        "userDetailsId"
      );

      if (!user) {
        return redirectWithError(
          res,
          `${CLIENT_URL}/verify-email/failed`,
          301,
          "No account found! Please sign up."
        );
      }

      if (verifyData.email === email) {
        if (user.isEmailVerified) {
          return redirectWithError(
            res,
            `${CLIENT_URL}/verify-email/failed`,
            301,
            "Account is already verifed! Please log in."
          );
        } else {
          // Verify user email
          user.isEmailVerified = true;
          await user.save();
        }
      } else {
        return redirectWithError(
          res,
          `${CLIENT_URL}/verify-email/failed`,
          301,
          "Invalid request. Please try again!"
        );
      }

      const { simpleToken, accessToken, refreshToken } =
        await generateAuthTokens(user);

      // Success response
      res.status(200).send({
        error: false,
        message: "Successfully verified!",
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
          301,
          "No account found! Please sign up."
        );
      }

      if (!user.isEmailVerified) {
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
          301,
          "Account is already verified. Please log in!"
        );
      }
    } else {
      return redirectWithError(
        res,
        `${CLIENT_URL}/not-found`,
        301,
        "Invalid request. Please try again!"
      );
    }
  },
  // POST
  login: async (req, res) => {
    /*
      #swagger.tags = ["Authentication"]
      #swagger.summary = "Login"
      #swagger.description = 'Login with email and password to get simpleToken and JWT'
      #swagger.parameters["body"] = {
          in: "body",
          required: true,
          schema: {
              "email": "testUser@gmail.com",
              "password": "Test@1234",
          }
      }
      #swagger.responses[200] = {
        description: 'Login successful',
        schema: {
          error: false,
          message: 'You are successfully logged in!',
          bearer: {
            access: 'access-token',
            refresh: 'refresh-token',
          },
          token: 'simple-token',
          user: {
            _id: 'user-id',
            fullName: 'John Doe',
            ...
          }
        }
      }
      #swagger.responses[400] = {
        description: 'Validation error or missing fields',
        schema: {
          error: true,
          message: 'Validation error message or missing fields message'
        }
      }
      #swagger.responses[401] = {
        description: 'Wrong email or password',
        schema: {
          error: true,
          message: 'Wrong email or password. Please try again!'
        }
      }
    */

    const validationError = await validateLoginPayload(req.body);

    if (validationError) {
      throw new CustomError(validationError, 400);
    }

    const { email, password } = req.body;
    // console.log("Login attempt:", email, password);

    if (email && password) {
      const user = await User.findOne({ email }).populate("userDetailsId");
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
    #swagger.summary = 'Forgot Password'
    #swagger.description = 'Request a URL with email to reset password'
    #swagger.parameters['body'] = {
        in: 'body',
        required: true,
        schema: {
            "email": "testUser@gmail.com",
            "resetPasswordToken": "optionalExistingToken"
        }
    }
    #swagger.responses[200] = {
      description: 'Password reset code sent successfully',
      schema: {
        error: false,
        resetToken: 'reset-password-token',
        message: 'Password reset code has been sent to your e-mail. Please check your mailbox.'
      }
    }
    #swagger.responses[400] = {
      description: 'Invalid request',
      schema: {
        error: true,
        message: 'Invalid request. Please provide correct email address!'
      }
    }
    #swagger.responses[401] = {
      description: 'No account found',
      schema: {
        error: true,
        message: 'No account found!'
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
    /*
    #swagger.tags = ['Authentication']
    #swagger.summary = 'Verify Reset Code'
    #swagger.description = 'Verify reset code and token for password reset'
    #swagger.parameters['body'] = {
      in: 'body',
      required: true,
      schema: {
        "resetToken": "reset-password-token",
        "resetCode": "reset-code",
        "email": "user@example.com"
      }
    }
    #swagger.responses[200] = {
      description: 'Reset token and code verified successfully',
      schema: {
        error: false,
        resetToken: 'new-reset-token',
        message: 'Reset token verified successfully'
      }
    }
    #swagger.responses[400] = {
      description: 'Invalid or expired reset code',
      schema: {
        error: true,
        message: 'Invalid or expired reset code. Please request reset code again!'
      }
    }
  */

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
      #swagger.summary = 'Reset Password'
      #swagger.description = 'Reset password with email, new password, and reset token.'
      #swagger.parameters['body'] = {
        in: 'body',
        required: true,
        schema: {
          email: 'testUser@gmail.com',
          password: 'newPassword@123',
        },
      }
      #swagger.parameters['resetToken'] = {
        in: 'path',
        required: true,
        type: 'string',
        description: 'Reset token received via email',
      }
      #swagger.responses[200] = {
        description: 'Password reset successfully',
        schema: {
          error: false,
          message: 'Your password has been successfully reset!',
        }
      }
      #swagger.responses[400] = {
        description: 'Invalid or expired reset token',
        schema: {
          error: true,
          message: 'Invalid or expired reset token',
        }
      }
      #swagger.responses[404] = {
        description: 'No user found with this email',
        schema: {
          error: true,
          message: 'No user found with this email',
        }
      }
    */
    const { email, password } = req.body;
    const { resetToken } = req.params;

    const validationError = await validateUserUpdatePayload(req.body);

    if (validationError) {
      throw new CustomError(validationError, 400);
    }

    if (!email || !password || !resetToken) {
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

    const hashedNewPassword = bcrypt.hashSync(password, 10);
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
    #swagger.responses[200] = {
      description: 'New access token generated successfully',
      schema: {
        error: false,
        bearer: {
          access: 'new-access-token'
        }
      }
    }
    #swagger.responses[401] = {
      description: 'Unauthorized or invalid token',
      schema: {
        error: true,
        message: 'JWT refresh token has expired or is invalid!'
      }
    }
    #swagger.responses[404] = {
      description: 'Data not found',
      schema: {
        error: true,
        message: 'No data found in refresh token!'
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
            // Check if the user is verification status
            if (user.isEmailVerified) {
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
    #swagger.responses[200] = {
      description: 'Logout successful',
      schema: {
        error: false,
        message: 'You are successfully logged out!'
      }
    }
    #swagger.responses[401] = {
      description: 'Unauthorized',
      schema: {
        error: true,
        message: 'No Authorization Header provided!'
      }
    }
    #swagger.responses[400] = {
      description: 'Logout failed',
      schema: {
        error: true,
        message: 'Logout failed. Please try again!'
      }
    }
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
