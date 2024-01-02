const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
    unique: true,
  },
  genre: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    default: "Pending",
  },

  task_image: {
    type: String,
    default: "",
  },
  task_album: {
    type: [String],
    default: [],
  },
  task_audios: {
    type: [String],
    default: [],
  },
});

const Task = mongoose.model(
  "Task",
  TaskSchema
);
module.exports = Task;