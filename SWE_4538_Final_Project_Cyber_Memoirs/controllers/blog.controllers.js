// blog.controllers.js
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { uploadTaskImage } = require('../middlewares/image.middleware');

const Blog = require('../dataModels/Blog.model');
const User = require('../dataModels/User.model');
const mongoose = require('mongoose');
const baseDirectory = path.resolve(__dirname, '..');
 
exports.createBlog = async (req, res) => {
  try {
    let userId;

    // Check if the user is authenticated via Google OAuth
    if (req.user) {
      userId = req.user.id; // Assuming Google user's ID is stored in req.user.id
    } else {
      // Fallback to local strategy
      userId = req.isAuthenticated() ? req.user.id : null;
    }

    // Ensure that user_id is provided
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Now, use the userId to create the blog
    const { title, category, description } = req.body;
    const photos = req.files.map((file) => file.filename);

        // Get user details to populate author_name
        const user = await User.findById(userId);
        const author_name = user.name;

        console.log('User Object:', user);
        console.log('Author Name:', author_name);

    // Create the blog using the userId and other information
    const newBlog = new Blog({
      user_id: userId,
      author_name,
      title,
      category,
      desc: description,
      Blog_album: photos,
    });

    // Save the blog to the database
    await newBlog.save();

    // Respond with success message
    res.json({ message: 'Blog created successfully' });
  } catch (error) {
    // Handle any errors
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};




exports.getBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find();
    res.status(200).json(blogs);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};




// exports.deleteBlog = async (req, res) => {
//   try {
//     const blogId = req.params.id;

//     // Check if the blog exists
//     const blog = await Blog.findById(blogId);
//     if (!blog) {
//       return res.status(404).json({ error: 'Blog not found' });
//     }

//     // Check if the logged-in user is the owner of the blog
//     if (blog.user_id.toString() !== req.user.id) {
//       return res.status(403).json({ error: 'You do not have permission to delete this blog' });
//     }

//     // Delete the blog
//     await Blog.findByIdAndDelete(blogId);

//     // Respond with success message
//     res.json({ message: 'Blog deleted successfully' });
//   } catch (error) {
//     // Handle any errors
//     console.error(error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// };

exports.deleteBlog = async (req, res) => {
  try {
    const blogId = req.params.id;

    // Check if the blog exists
    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    // Check if the logged-in user is the owner of the blog
    if (blog.user_id.toString() !== req.user.id) {
      return res.status(403).json({ error: 'You do not have permission to delete this blog' });
    }

    // Delete associated image files
    if (blog.Blog_album && blog.Blog_album.length > 0) {
      // Construct the file paths based on your storage structure
      const imagePaths = blog.Blog_album.map(filename =>
        path.join(baseDirectory, 'uploads', 'images', filename)
      );

      // Delete each image file
      await Promise.all(imagePaths.map(async imagePath => {
        try {
          await fs.unlink(imagePath);
        } catch (error) {
          // Handle errors or log them, but continue with other deletions
          console.error(`Error deleting image file: ${imagePath}`, error);
        }
      }));
    }

    // Delete the blog
    await Blog.findByIdAndDelete(blogId);

    // Respond with success message
    res.json({ message: 'Blog and associated images deleted successfully' });
  } catch (error) {
    // Handle any errors
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.getUserBlogs = async (req, res) => {
  try {
    // Retrieve user blogs based on user_id
    const userBlogs = await Blog.find({ user_id: req.user.id }).populate('user_id', 'name');
    res.render('user-blogs', { userBlogs });
    // const blogs = await Blog.find().populate('user_id'); // Assuming 'user_id' is the reference to the User model
    // res.render('user-blogs', { userBlogs: blogs });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.likeBlog = async (req, res) => {
  try {
    const blogId = req.params.id;

    if (!req.user) {
      return res.json({ message: 'Unauthenticated' });
    }

    if (!mongoose.Types.ObjectId.isValid(blogId)) {
      return res.status(404).send(`No blog with id: ${blogId}`);
    }

    const blog = await Blog.findById(blogId);

    const index = blog.likes.findIndex((userId) => userId === req.user.id);

    if (index === -1) {
      blog.likes.push(req.user.id);
    } else {
      blog.likes = blog.likes.filter((userId) => userId !== req.user.id);
    }

    await blog.save();

    res.status(200).json({ message: 'Blog liked successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};



// exports.commentBlog = async (req, res) => {
//   try {
//     const blogId = req.params.id;
//     const { comment } = req.body;

//     if (!req.user) {
//       return res.json({ message: 'Unauthenticated' });
//     }

//     if (!mongoose.Types.ObjectId.isValid(blogId)) {
//       return res.status(404).send(`No blog with id: ${blogId}`);
//     }

//     const blog = await Blog.findById(blogId);

//     blog.comments.push({
//       user_id: req.user.id,
//       text: comment, // Store the comment text in the database
//     });

//     const updatedBlog = await Blog.findByIdAndUpdate(blogId, blog, { new: true });

//     res.json(updatedBlog);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// };

exports.commentBlog = async (req, res) => {
  try {
    const blogId = req.params.id;
    const { comment } = req.body;

    if (!req.user) {
      return res.json({ message: 'Unauthenticated' });
    }

    if (!mongoose.Types.ObjectId.isValid(blogId)) {
      return res.status(404).send(`No blog with id: ${blogId}`);
    }

    const blog = await Blog.findById(blogId);

    blog.comments.push({
      user_id: req.user.id,
      commenter: req.user.name, // Include the name of the commenter
      text: comment, // Store the comment text in the database
    });

    const updatedBlog = await Blog.findByIdAndUpdate(blogId, blog, { new: true });

    res.json(updatedBlog);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


exports.getComments = async (req, res) => {
  try {
    const blogId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(blogId)) {
      return res.status(404).send(`No blog with id: ${blogId}`);
    }

    const blog = await Blog.findById(blogId);

    if (!blog) {
      return res.status(404).send(`No blog with id: ${blogId}`);
    }

    const comments = blog.comments;

    res.json(comments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.updateBlog = async (req, res) => {
  try {
    const blogId = req.params.id;

    // Check if the blog exists
    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    // Check if the logged-in user is the owner of the blog
    if (blog.user_id.toString() !== req.user.id) {
      return res.status(403).json({ error: 'You do not have permission to update this blog' });
    }

    // Extract updated data from the request body
    const { updatedTitle, updatedCategory, updatedDescription } = req.body;

    // Update the blog fields
    blog.title = updatedTitle || blog.title;
    blog.category = updatedCategory || blog.category;
    blog.desc = updatedDescription || blog.desc;

    // Handle file upload if an image is provided
    if (req.file) {
      // Remove the old image if it exists
      if (blog.Blog_image) {
        const imagePath = path.join('uploads/images', blog.Blog_image);
        await fs.unlink(imagePath);
      }

      // Save the new image path in the blog model
      blog.Blog_image = req.file.filename;
    }

    // Save the updated blog
    await blog.save();

    // Respond with success message
    res.json({ message: 'Blog updated successfully' });
  } catch (error) {
    // Handle any errors
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Use multer middleware for handling file upload
exports.uploadBlogImage = uploadTaskImage.single('updatedImage');

exports.getBlogsByCategory = async (req, res) => {
  try {
    const { category } = req.params;

    // Fetch blogs based on the category
    const blogs = await Blog.find({ category });

    res.json(blogs);
  } catch (error) {
    console.error('Error fetching blogs by category:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
