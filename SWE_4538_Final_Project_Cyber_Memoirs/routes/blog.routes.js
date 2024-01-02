const express = require('express');
const router = express.Router();
const { getBlogs,createBlog,deleteBlog,getUserBlogs,likeBlog,commentBlog,getComments,updateBlog, uploadBlogImage,getBlogsByCategory } = require('../controllers/blog.controllers');
const { ensureAuthenticated } = require('../middlewares/auth.middleware');
const { uploadTaskImage } = require('../middlewares/image.middleware');

// Use the ensureAuthenticated middleware to ensure the user is logged in
router.post('/create-blog', uploadTaskImage.array('photos', 5), createBlog);

router.get('/blogs',getBlogs);
router.post('/delete-blog/:id', deleteBlog);
router.get('/user-blogs', getUserBlogs);
// Like a blog
router.post('/like-blog/:id',  likeBlog);
router.post('/update-blog/:id', uploadBlogImage, updateBlog);

// Comment on a blog
router.post('/comment-blog/:id',commentBlog);
router.get('/get-comments/:id', getComments);
router.get('/category-blogs/:category', getBlogsByCategory);
module.exports = router;
