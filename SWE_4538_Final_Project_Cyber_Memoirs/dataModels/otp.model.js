const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  code: String,
  expireIn: Number,
});

const otp = mongoose.model("otp", otpSchema);
module.exports = otp;