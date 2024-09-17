const User = require("../models/userModel");
const { isUpdatePayloadValid } = require("../validators/userValidator");

//Update
exports.updateUser = async (req, res) => {
  try {
    const isValid = await isUpdatePayloadValid(req.body);

    if (!isValid) {
      return res.status(422).json({ message: "Invalid Input" });
    }
    const userId = req.params.userId;
    const { fullName, email } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { fullName, email },
      { runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ code: 1001, message: "User not found." });
    }

    return res.status(200).json({ message: "User updated successfully!" });
  } catch (error) {
    return res.status(500).json({ message: "Error updating user", error });
  }
};
