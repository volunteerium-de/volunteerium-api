const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../../models/userModel");
const UserDetails = require("../../models/userDetailsModel");
const {
  NODE_ENV,
  VERSION,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
} = require("../../../setups");
const { uploadAvatarToS3 } = require("../../middlewares/awsS3Upload");

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: `/api/${VERSION}/auth/google/callback`,
      proxy: NODE_ENV,
    },
    async (accessToken, refreshToken, profile, done) => {
      // console.log("Google Profile: ", profile);

      try {
        let user = await User.findOne({
          $or: [{ email: profile.emails[0].value }, { googleId: profile.id }],
        });

        if (!user) {
          const avatarUrl = await uploadAvatarToS3(
            profile.photos[0].value,
            profile.id
          );

          user = new User({
            googleId: profile.id,
            fullName: `${profile.name.givenName} ${profile.name.familyName}`,
            email: profile.emails[0].value,
            isActive: true,
            isEmailVerified: profile?.emails[0]?.verified ? true : false,
          });
          const newUser = await user.save();

          // Create new user details
          const userDetails = new UserDetails({
            userId: newUser._id,
            avatar: avatarUrl, // Uploaded File in AWS-S3 Bucket
          });
          const newUserDetails = await userDetails.save();

          // Update userDetails for new user
          newUser.userDetailsId = newUserDetails._id;
          await newUser.save();
        } else {
          const updates = {};

          if (!user.isEmailVerified && profile?.emails[0]?.verified) {
            updates.isEmailVerified = true;
          }

          if (!user.googleId) {
            // update googleId of existing user
            updates.googleId = profile.id;
          }

          if (Object.keys(updates).length > 0) {
            await User.updateOne({ _id: user._id }, updates);
          }

          let userDetails = await UserDetails.findOne({
            userId: user._id,
          });

          if (!userDetails.avatar) {
            // change avatar url of existing user, it user's avatar doesnt exist
            const avatarUrl = await uploadAvatarToS3(
              profile.photos[0].value,
              profile.id
            );
            await UserDetails.updateOne(
              { userId: user._id },
              { avatar: avatarUrl }
            );
          }
        }

        user = await User.findOne({
          $or: [{ email: profile.emails[0].value }, { googleId: profile.id }],
        }).populate("userDetailsId");

        // user = await User.findOne({
        //  $or: [{ email: profile.emails[0].value }, { googleId: profile.id }],
        //}).populate([
        //   {
        //     path: "userDetailsId",
        //     populate: [
        //       {
        //         path: "interestIds",
        //         select: "name _id",
        //       },
        //       {
        //         path: "addressId",
        //         select: "-createdAt -updatedAt -__v",
        //       },
        //     ],
        //   },
        //   // { path: "documentIds", select: "-__v" },
        // ]);

        // console.log(user)
        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

module.exports = passport;
