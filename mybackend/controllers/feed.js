const fs = require("fs");
const path = require("path");

const { validationResult } = require("express-validator");

const Post = require("../models/post");
const User = require("../models/user");


const io = require('../socket');

module.exports.get = async (req, res, next) => {
  try {
    const page = req.query.page || 1;
    skip = (page - 1) * page;
    limit = 10;

    const totalItems = await Post.find().countDocuments();
    const posts = await Post.find().sort({createdAt: -1}).populate("creator").skip(skip).limit(limit);

    res.status(200).json({ message: "Fetched posts successfully", posts, totalItems });
  } catch (e) {
    const error = new Error("Could not find post.");
    error.statusCode = 404;

    throw error;
  }
}

module.exports.getOne = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    res.status(200).json({ message: "Post fetched", post });
  } catch (e) {
    const error = new Error("Could not find post.");
    error.statusCode = 404;

    throw error;
  }
}

module.exports.post = async (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!(req.file && errors.isEmpty())) {
      const error = new Error(!req.file ? "No image provided." : "Validation failed, entered data is incorrect.");

      error.statusCode = 422;

      throw error;
    }

    const image = req.file.path.replace("\\", "/");
    const { title, content, createdAt } = { ...req.body };
    const post = new Post({
      title,
      content,
      image,
      creator: req.userId,
      createdAt
    })

    await post.save();
    const user = await User.findById(req.userId);

    user.posts.push(post);

    await user.save();

    io.getIo().emit('posts',{// broadcast() will send message to all user except the user who requested
      action: 'create',
      post: { ...post._doc , creator : {_id : req.userId , name : user.name}}
    })

    res.status(201).json({
      message: "Post created successfully!",
      post,
      creator: { _id: user._id, name: user.name }
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
}

module.exports.put = async (req, res, next) => {
  try {
    const errors = validationResult(req);

    const id = req.params.id;
    const { title, content } = req.body;

    let image = req.body.image;

    if (req.file) image = req.file.path.replace("\\", "/");;

    if (!(image && errors.isEmpty())) {
      const error = new Error(!req.file ? "No image provided." : "Validation failed, entered data is incorrect.");
      error.statusCode = 422;
      throw error;
    }

    const post = await Post.findById(id).populate('creator');

    if (post.creator._id.toString() !== req.userId) {
      const error = new Error("Not Authorized!");
      error.statusCode = 403;
      throw error;
    }

    if (image !== post.image) clearImage(post.image);

    post.title = title;
    post.content = content;
    post.image = image;

    const result = await post.save();

    io.getIo().emit('posts', { action : 'update' , post : result})

    res.status(200).json({
      message: "Post updated successfully!",
      post: result
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
}


module.exports.delete = async (req, res, next) => {
  const postId = req.params.id;
  try {
    const post = await Post.findById(postId)

  if (!post) {
    console.log('Could not find post.')
    const error = new Error('Could not find post.');
    error.statusCode = 404;
    throw error;
  }
  if (post.creator.toString() !== req.userId) {
    console.log('not authorize!!!!');
    const error = new Error('Not authorized!');
    error.statusCode = 403;
    throw error;
  }
  // Check logged in user
  clearImage(post.image);
  await Post.findByIdAndDelete(postId);
    
  const user = await User.findById(req.userId);
  user.posts.pull(postId);
  await user.save();

  io.getIo().emit('posts', { action : 'delete' , post : postId });  
  res.status(200).json({ message: 'Deleted post.' });
  }
    
  catch(err){
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

const clearImage = filePath => {
  filePath = path.join(__dirname, '..', filePath);
  fs.unlink(filePath, err => console.log(err));
};