const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema({
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    commenter: {
        type: String,
        required: true,
      },
    text: {
      type: String,
      required: true,
    },
  });

const BlogSchema = new mongoose.Schema({
  user_id: {
    // type: String,
    // required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Make sure this matches the model name of your User model
    required: true,
  },
  author_name: {
    type: String,
    required: true,
  },
  title: {
    type: String, // Add this line to include the title field
    required: true,
  },
  desc: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  Blog_image: {
    type: String,
    default: "",
  },
  Blog_album: {
    type: [String],

    default: [],
  },
  likes: { type: [String], default: [] },
  comments: { type: [CommentSchema], default: [] },
  createdAt: {
      type: Date,
      default: new Date(),
  },
});

const Blog = mongoose.model("Blog", BlogSchema);
module.exports = Blog;
