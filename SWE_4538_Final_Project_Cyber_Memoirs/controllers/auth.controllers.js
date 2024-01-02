const User = require("../dataModels/User.model");
const Otp = require("../dataModels/otp.model")
const path = require("path");
const bcrypt = require("bcrypt");
const passport = require("passport");
const nodemailer = require("nodemailer");
const randomstring = require("randomstring");
const config = require("../config/config");

const sendResetPasswordMail = async(name,email,token)=>{
  try {
    const transporter = nodemailer.createTransport({
          service: 'gmail',
          port:587,
          secure:false,
          requireTLS:true,
          auth:{
            user: config.emailUser,
            pass: config.emailPassword
          }
    });

    const mailOptions = {
      from:config.emailUser,
      to:email,
      subject:"For reseting password",
      html:'<p> Hii, Please copy the link <a href="http://127.0.0.1:3000/reset-password?token='+token+'"> and reset your password.</a>'
    }
    transporter.sendMail(mailOptions,function(error,info){
      if(error){
        console.log(error);
      }
      else{
        console.log("Mail has been sent",info.response);
      }
    })
  } catch (error) {
    res.status(400).send({success:false,msg:error.message})
  }
}



const getLogin = async (req, res) => {
  const filePath = path.join(__dirname, "..", "views", "login.html");
  res.sendFile(filePath);
};

const postLogin = (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/welcome",
    failureRedirect: "/login",
    failureFlash: true,
  })(req, res, next);
};


const getRegister = async (req, res) => {
  const filePath = path.join(__dirname, "..", "views", "register.html");
  res.sendFile(filePath);
};


const postRegister = async (req, res, next) => {
  const { email, password } = req.body;
  const name = req.body.username;

  console.log(name);
  console.log(email);
  console.log(password);

  const errors = [];
  if (!name || !email || !password) {
    errors.push("All fields are required!");
    res.status(400).json({ error: errors });
  } else {
    // Check if the user already exists
    try {
      const existingUser = await User.findOne({ email: email });

      if (existingUser) {
        errors.push("User already exists with this email!");
        res.status(400).json({ error: errors });
      } else {
        // Generate salt and hash the password
        bcrypt.genSalt(10, async (err, salt) => {
          if (err) {
            errors.push(err);
            res.status(400).json({ error: errors });
          } else {
            bcrypt.hash(password, salt, async (err, hash) => {
              if (err) {
                errors.push(err);
                res.status(400).json({ error: errors });
              } else {
                // Create a new user
                const newUser = new User({
                  name,
                  email, 
                  password: hash,
                });

                try {
                  // Save the user to the database
                  await newUser.save();
                  res.status(201).json({ message: "Registration successful" });
                } catch (saveError) {
                  errors.push("Please try again");
                  res.status(400).json({ error: errors });
                }
              }
            });
          }
        });
      }
    } catch (error) {
      console.error("User lookup error:", error);
      errors.push("Please try again");
      res.status(400).json({ error: errors });
    }
  }
};

const getProfileInfos = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, currentPassword, newPassword, hobby, profession  } = req.body;
    console.log(newPassword)
    
    const userId = req.user.id
    const user = await User.findById(userId);
    console.log(user)



    // Update the password if provided
    if (newPassword) {
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

      if (!isPasswordValid) {
        return res.status(400).json({ error: 'Current password is incorrect' });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
    }

    // Update the designation if provided
    if (hobby) {
      user.hobby = hobby;
    }


    if (profession) {
      user.profession = profession
    }

    await user.save();

    res.json({ message: 'User information updated successfully' });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

const deleteProfile = async (req, res) => {
  try {
    const profileID = req.params.id;
    const profileInfo = await User.findById(profileID);

    if (!profileInfo) {
      return res.status(404).json({ error: "Profile information not found" });
    }

    await profileInfo.deleteOne({ _id: profileID });

    res.json({ message: "Profile information deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



const postProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file provided' });
    }
const photo = req.file.filename
    
    const userId = req.user.id
    const user = await User.findById(userId);
    console.log(user)


    if (photo) {
      user.profile_image = photo
    }
    await user.save();

    res.json({ message: 'Profile image updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const postMultipleImages = async (req, res) => {
  try {
    if (!req.files) {
      return res.status(400).json({ message: 'No file provided' });
    }

    const photo = req.files.map((file) => file.filename);

    const userId = req.user.id
    const user = await User.findById(userId);
   
    if (photo) {
      user.images = photo
    }
    await user.save();

    res.json({ message: 'Multiple images updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getMultipleImages = async (req, res) => {
  try {
    const userId = req.user.id
    const user = await User.findById(userId);
    const images= user.images

    res.json({ images });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const postAudioFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file provided' });
    }
const audio = req.file.filename
    
    const userId = req.user.id
    const user = await User.findById(userId);
    console.log(user)


    if (audio) {
      user.audio = audio
    }
    await user.save();

    res.json({ message: 'Audio updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



const securePassword = async(password)=>{
  try {
    const passwordHash = await bcrypt.hash(password,10);
    return passwordHash;
  } catch (error) {
    res.status(400).send(error.message);
  }
}

const forget_password = async(req,res) => {
  try {

    const email = req.body.email;
    const userData = await User.findOne({email:req.body.email});

    if(userData){
        const randomString = randomstring.generate();
        const data = await User.updateOne({email:email},{$set:{token:randomString}});
        sendResetPasswordMail(userData.name,userData.email,randomString);
        res.status(200).send({success:true,msg:"Please check mail"});
    }
    else{
      res.status(200).send({success:true,msg:"This email does not exist"});
    }
    
  } catch (error) {
    res.status(400).send({success:false,msg:error.message});
  }
}


const reset_password = async (req, res) => {
  try {
    const token = req.query.token;
    const tokenData = await User.findOne({ token: token });

    if (tokenData) {
      const password = req.body.password;
      const newPassword = await securePassword(password);

      const userData = await User.findByIdAndUpdate(
        { _id: tokenData._id },
        { $set: { password: newPassword, token: '' } },
        { new: true }
      );

      // Send a response without circular references
      const response = { success: true, msg: "Password has been reset", data: userData };
      res.status(200).json(response);
    } else {
      res.status(200).json({ success: true, msg: "Token expired" });
    }
  } catch (error) {
    // Handle errors appropriately
    console.error(error);

    // Send a response without circular references
    res.status(400).json({ success: false, msg: error.message });
  }
};


module.exports = {
  getLogin,
  getRegister,
  postLogin,
  postRegister,
  getProfileInfos,
  updateProfile,
  deleteProfile,
  postProfileImage,
  postMultipleImages,
  getMultipleImages,
  forget_password,
  reset_password,
};

