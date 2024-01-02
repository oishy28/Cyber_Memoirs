const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')
const User = require("./../dataModels/User.model");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const mongoose = require('mongoose');
// const User = require('../dataModels/User.model');

function initialize(passport, getUserByEmail, getUserById) {
  const authenticateUser = async (email, password, done) => {
    // const user = getUserByEmail(email)
    // if (user == null) {
    // return done(null, false, { message: 'No user with that email' })
    // }

    // try {
    //   if (await bcrypt.compare(password, user.password)) {
    //     return done(null, user)
    //   } else {
    //     console.log("email")
    //     return done(null, false, { message: 'Password incorrect' })
    //   }
    // } catch (e) {
    //   return done(e)
    // }

       //Match User
       User.findOne({ email: email })
       .then((user) => {
         if (!user) {
           return done(null, false, {
             message: "This email is not registered!",
           });
         } else {
           //Match Password
           bcrypt.compare(password, user.password, (err, isMatch) => {
             if (err) throw err;
             if (isMatch) {
               return done(null, user);
             } else {
               return done(null, false, { message: "Password Incorrect!" });
             }
           });
         }
       })
       .catch((err) => {
         console.log(err);
       });
  }

  // passport.use(
  //   new GoogleStrategy(
  //     {
  //       clientID: process.env.CLIENT_ID,
  //       clientSecret: process.env.CLIENT_SECRET,
  //       callbackURL: "/auth/google/callback",
  //     },
  //     async (accessToken, refreshToken, profile, done) => {
  //       try {
  //         // Check if the user already exists in the database
  //         let user = await User.findOne({ email: profile.emails[0].value });
  
  //         if (!user) {
  //           // If the user doesn't exist, create a new one
  //           user = new User({ email: profile.emails[0].value });
  //           await user.save();
  //         }
  
  //         return done(null, user);
  //       } catch (error) {
  //         return done(error, null);
  //       }
  //     }
  //   )
  // );


  
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        callbackURL: "/auth/google/callback",
        userProfileURL: 'https://www.googleapis.com/oauth2/v3/userinfo',
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Log the entire profile object to understand its structure
          console.log('Google Profile:', profile);
  
          // Check if the user already exists in the database
          let user = await User.findOne({ email: profile.emails[0].value });
  
          if (!user) {
            // If the user doesn't exist, create a new one with email and name
            user = new User({
              email: profile.emails[0].value,
              name: profile.displayName || getFullName(profile),
            });
  
            await user.save();
          } else if (!user.name) {
            // If the user exists but doesn't have a name, update the name
            user.name = profile.displayName || getFullName(profile);
            await user.save();
          }
  
          return done(null, user);
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );
  
  // Helper function to get the full name from the Google profile
  function getFullName(profile) {
    const givenName = profile.name?.givenName || '';
    const familyName = profile.name?.familyName || '';
    return `${givenName} ${familyName}`.trim();
  }
  
  


  passport.use(new LocalStrategy({ usernameField: 'email' }, authenticateUser)) 
  passport.serializeUser((user, done) =>{
    done(null, user.id)}); //specify what user data should be stored in the session after a user logs in
  // passport.deserializeUser((id, done) => {  // This function retrieves the user data based on the stored user identifier (e.g., user ID).
  //   return done(null, id)
  // })
  // passport.deserializeUser(async (id, done) => {
  //   try {
  //     const user = await User.findById(id);
  //   console.log(user)
  //     done(null, user);
  //   } catch (err) {
  //     done(err, null);
  //   }
  // });
  // passport.deserializeUser(async (user, done) => {
  //   try {
  //     const userId = mongoose.Types.ObjectId(id);
  //     const user = await User.findById(userId);
  //     console.log(user);
  //     done(null, user);
  //   } catch (err) {
  //     done(err, null);
  //   }
  //   //done(null,user)
  // });
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });
  
  
}

module.exports = initialize