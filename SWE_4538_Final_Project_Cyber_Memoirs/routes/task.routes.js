const express = require("express");
const router = express.Router();

const { getTaskInfos, addTask, updateTask, deleteTask, addTaskAlbum, addTaskImage, addTaskAudios, getMyTasks } = require("../controllers/task.controllers");
const { uploadTaskImage, uploadAudioFile } = require("../middlewares/image.middleware");

router.post("/add-task", addTask);
router.post("/add-task-image/:name", uploadTaskImage.single('image'), addTaskImage);
router.post("/add-task-album/:name", uploadTaskImage.array('images', 5), addTaskAlbum);
router.post("/add-task-audios/:name", uploadAudioFile.array('audios', 5), addTaskAudios);
router.get("/all-tasks", getTaskInfos);
router.get("/tasks", getMyTasks);
router.patch("/update-task/:name", updateTask);
router.delete("/delete-task/:name", deleteTask);

module.exports = router;
