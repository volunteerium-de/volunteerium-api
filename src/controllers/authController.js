const User = require("../models/userModel");
const Token = require("../models/tokenModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../../setups");
const {
  isRegisterPayloadValid,
  isLoginPayloadValid,
} = require("../validators/authValidator");

module.exports = {
  // Register
  register: async (req, res) => {
    try {
      const isValid = await isRegisterPayloadValid(req.body);

      if (!isValid) {
        return res.status(422).json({ message: "Invalid Input" });
      }

      const { fullName, email, password } = req.body;

      const userExists = await User.findOne({ email });
      if (userExists) {
        return res
          .status(422)
          .json({ code: 1002, message: "Email is already registered." });
      }

      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newUser = new User({
        fullName,
        email,
        password: hashedPassword,
      });

      await newUser.save();

      return res.status(201).json({ message: "User registered successfully!" });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Error registering user", error });
    }
  },

  // Login
  login: async (req, res) => {
    try {
      const isValid = await isLoginPayloadValid(req.body);

      if (!isValid) {
        return res.status(422).json({ message: "Invalid Input" });
      }
      const { email, password } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: "Invalid email or password." });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Invalid email or password." });
      }

      const tokenValue = jwt.sign({ fullName: user.fullName }, JWT_SECRET);

      const newToken = new Token({
        token: tokenValue,
        userId: user._id,
      });

      await newToken.save();

      return res.status(200).json({ token: tokenValue });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Error logging in", error });
    }
  },

  //Logout
  logout: async (req, res) => {
    try {
      const token = req.headers.authorization.split(" ")[1];

      await Token.findOneAndDelete({ token });

      return res.status(200).json({ message: "Logout successful!" });
    } catch (error) {
      return res.status(500).json({ message: "Error logging out", error });
    }
  },
};
