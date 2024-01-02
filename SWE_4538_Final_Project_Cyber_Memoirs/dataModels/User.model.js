const mongoose = require("mongoose");
const { stringify } = require("uuid");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: false,
  },
  profession: {
    type: String,
  },
  hobby: {
    type: String,
  },
  profile_image: {
    type: String,
    default:'',
  },
  images: {
    type: [String],
    default:[],
  },
  audio: {
    type: String,
    default:'',
  },
  token:{
    type:String,
    default:'',
  },
});

const User = mongoose.model("User", UserSchema);
module.exports = User;