const express = require("express");
const passport = require("passport");
require("../config/passport")(passport);

const router = express.Router();
const {
    getLogin,
    getRegister,
    postLogin,
    postRegister,
    updateProfile,
    getProfileInfos,
    deleteProfile,
    forget_password,
    reset_password,
    } = require("../controllers/auth.controllers");

router.get("/login", getLogin);
router.post("/login", postLogin);
router.get("/register", getRegister);
router.post("/register", postRegister);


// Google OAuth login route
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Google OAuth callback route
router.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    // Successful authentication, redirect to the profile page or any other desired route
    res.redirect("/welcome");
  }
);

router.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      res.json({ error: err });
    } else res.redirect("/");
  });
});

router.get("/profiles", getProfileInfos);
router.patch("/update-profile",  updateProfile);
router.delete("/delete-profile/:id", deleteProfile);

// router.post('/email-send',emailSend)
// router.post('/change-password',changePassword)


// upload images
// const {uploadProfileImage, uploadAudioFile} = require("../middlewares/image.middleware")
// const {
//   getMediaPage,
//   postProfileImage,postMultipleImages, getMultipleImages,
//   postAudioFile,
//   } = require("../controllers/auth.controllers");
const {uploadProfileImage, uploadAudioFile} = require("../middlewares/image.middleware")
const {
  postProfileImage,postMultipleImages, getMultipleImages,
  postAudioFile,
  } = require("../controllers/auth.controllers");
const ensureAuthenticated = require("../middlewares/auth.middleware");
  
  // router.get('/media-pages', getMediaPage)
  router.post('/upload/single_image', uploadProfileImage.single('image'), postProfileImage);
router.post('/upload/multiple_image', uploadProfileImage.array('images', 5), postMultipleImages);
router.get('/multiple_image', getMultipleImages)

// router.post('/upload/audio', uploadAudioFile.single('audio'), postAudioFile);

// router.post('/update-password',ensureAuthenticated,update_password);
router.post('/forget-password',forget_password);
router.get('/reset-password',reset_password);


module.exports = router;