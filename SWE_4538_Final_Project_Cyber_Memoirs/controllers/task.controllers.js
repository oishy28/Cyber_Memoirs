const Task = require("../dataModels/Task.model");
const User = require("../dataModels/User.model");

const addTask = (req, res, next) => {
  const { name, genre, status } = req.body;
  const userId = req.user.id;

  console.log(name);
  console.log(genre);
  console.log(status);
  console.log(userId);

  const errors = [];

  if (!name || !genre) {
    errors.push("Fill out all required fields!");
  }
  if (errors.length > 0) {
    res.status(400).json({ error: errors });
  } else {
    Task.findOne({ name: name }).then(
      (task) => {
        if (task) {
          errors.push(
            "Project name is already taken!"
          );
          res.status(400).json({ error: errors });
        } else {
          const newTask = new Task({
            user_id: userId,
            name: name,
            genre: genre,
            status: status,
          });
          newTask
            .save()
            .then(() => {
              res.json({
                message:
                  "Task Added Successfully",
              });
            })
            .catch(() => {
              errors.push("Please try again");
              res
                .status(400)
                .json({ error: errors });
            });
        }
      }
    );
  }
};

const getTaskInfos = async (req, res) => {
  try {
    const tasks = await Task.find().select(
      "-user_id"
    );
    res.json(tasks);
  } catch (error) {
    res
      .status(500)
      .json({ error: error.message });
  }
};

const getMyTasks = async (req, res) => {
  try {
    const userId = req?.user?.id;
    if(userId){
      const tasks = await Task.find({
        user_id:userId
      }).select(
        "-user_id"
      );
      res.json(tasks);
    }
    else{
      res.json({
        message: "No user signed in!",
      });
    }
    
  } catch (error) {
    res
      .status(500)
      .json({ error: error.message });
  }
};

const updateTask = async (req, res) => {
  try {
    const { genre, status } = req.body;

    const name = req.params.name;
    const task = await Task.findOne({
      name: name,
    });
    console.log(task);

    if (category) {
      task.genre = genre;
    }

    if (status) {
      task.status = status;
    }

    await task.save();

    res.json({
      message:
        "Task information updated successfully",
    });
  } catch (err) {
    return res
      .status(500)
      .json({ msg: err.message });
  }
};

const deleteTask = async (req, res) => {
  try {
    const taskName = req.params.name;
    const task = await Task.findOne({
      name: taskName,
    });

    if (!task) {
      return res.status(404).json({
        error: "Task information not found",
      });
    }

    await task.deleteOne({
      name: taskName,
    });

    res.json({
      message:
        "Task information deleted successfully",
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: error.message });
  }
};

const validateRequest = (task, req) => {
  const userLoggedIn = req?.user?.id || null;
  console.log(userLoggedIn);
  if (
    userLoggedIn !== null &&
    task.user_id === req.user.id
  ) {
    return true;
  }
  return false;
};

const addTaskImage = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ message: "No file provided" });
    }
    const photo = req.file.filename;

    const name = req.params.name;

    const task = await Task.findOne({
      name: name,
    });

    console.log(task);

    const validated = validateRequest(
      task,
      req
    );
    console.log(validated);
    if (validated) {
      if (photo) {
        task.task_image = photo;
      }
      await task.save();

      res.json({
        message:
          "Task image updated successfully",
      });
    } else {
      res.json({
        message: "You do not have authorization!",
      });
    }
  } catch (error) {
    res
      .status(500)
      .json({ error: error.message });
  }
};

const addTaskAlbum = async (req, res) => {
  try {
    if (!req.files) {
      return res
        .status(400)
        .json({ message: "No file provided" });
    }

    const photo = req.files.map(
      (file) => file.filename
    );

    console.log("photo: " + photo);

    const name = req.params.name;
    const task = await Task.findOne({
      name: name,
    });
    console.log(task);

    const validated = validateRequest(
      task,
      req
    );
    console.log(validated);

    if (validated) {
      if (photo) {
        console.log("photo: " + photo);
        let album = task.project_album || [];
        album.push(...photo);
        task.project_album = album;
      }
      await task.save();

      res.json({
        message:
          "Project album updated successfully",
      });
    } else {
      res.json({
        message: "You do not have authorization!",
      });
    }
  } catch (error) {
    res
      .status(500)
      .json({ error: error.message });
  }
};

const addTaskAudios = async (req, res) => {
  try {
    if (!req.files) {
      return res
        .status(400)
        .json({ message: "No file provided" });
    }
    const audio = req.files.map(
      (file) => file.filename
    );

    const name = req.params.name;
    const task = await Task.findOne({
      name: name,
    });
    console.log(task);

    const validated = validateRequest(
      task,
      req
    );
    console.log(validated);

    if (validated) {
      if (audio) {
        console.log(task.task_audios);
        let audios = task.task_audios
          ? task.task_audios
          : [];
        audios.push(...audio);
        task.task_audios = audios;

        console.log(audios);
      }
      await task.save();

      res.json({
        message: "Audios updated successfully",
      });
    } else {
      res.json({
        message: "You do not have authorization!",
      });
    }
  } catch (error) {
    res
      .status(500)
      .json({ error: error.message });
  }
};

module.exports = {
  addTask,
  getTaskInfos,
  getMyTasks,
  updateTask,
  deleteTask,
  addTaskImage,
  addTaskAlbum: addTaskAlbum,
  addTaskAudios,
};