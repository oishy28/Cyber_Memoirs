const express = require("express");
const app = express();
const bodyParser = require("body-parser"); // parse the body of HTTP request
const cookieParser = require("cookie-parser"); //parse cookies that are sent with HTTP request
const session = require("express-session");
const flash = require('express-flash')
const passport = require("passport");
const ejs = require('ejs');
const path = require('path');


require("./config/passport")(passport);

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');


app.use(flash());
app.use(
  session({
    secret:"secret",
    resave: false,  // we can resave the session if nothing is change
    saveUninitialized: false,  //we can save empty value
  })
);

app.use(passport.initialize());
app.use(passport.session());

// To store image/files
// app.use(express.static('./uploads'))

app.use(express.static(path.join(__dirname, 'uploads')));




//Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


const cors = require("cors");   //Cross-origin resource sharing (CORS) is a browser mechanism which
                                  //  enables controlled access to resources located outside of a given domain.
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true, // Allow cookies to be sent
}));

const routes = require("./routes/auth.routes");
app.use(routes);
const taskRoutes = require("./routes/task.routes");
app.use(taskRoutes);
const blogRoutes = require("./routes/blog.routes");
app.use(blogRoutes);

const ensureAuthenticated = require("./middlewares/auth.middleware");
app.get("/welcome", ensureAuthenticated, (req, res) => {
  res.sendFile(__dirname + "/views/homePage.html");
});


app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/landingPage.html");
});

app.get("/category-blogs", (req, res) => {
  res.sendFile(__dirname + "/views/category-blogs.html");
});

// Add Google OAuth login route
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    // Successful authentication, redirect to the profile page or any other desired route
    res.redirect("/welcome");
  }
);








//Connect to DB
const mongoose = require("mongoose");
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to Database!");
  })
  .catch((error) => {
    console.log(error);
  });


module.exports = app;
