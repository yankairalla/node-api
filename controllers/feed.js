const fs = require('fs');
const path = require('path');

const { validationResult } = require('express-validator');

const Post = require('../models/Post');

exports.getPosts = (req, res, next) => {
	const currentPage = req.query.page || 1;
	const perPage = 2;
	let totalItems;
	Post.find()
		.countDocuments()
		.then(count => {
		totalItems = count;
		return Post.find()
		.skip((currentPage - 1) * perPage)
		.limit(perPage);
	})
	.then(posts => {
		res.status(200).json({
				message: 'Fetched post successfully',
				posts,
				totalItems 
		});
	})
	.catch(err => {
				if(!err.statusCode) {
					 err.statusCode = 500; 
				}
				next(err);
	});

};

exports.createPost = (req, res, next) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
				const error = new Error('Validation failed, data is incorrect!');
				error.statusCode = 422;
				throw error;
		}
		if(!req.file) {
				const error = new Error('No image provided');
				error.statusCode = 422;
				throw error;
		}
		const imageUrl = req.file.path;
		const title = req.body.title;
		const content = req.body.content;
		const post = new Post({
						title,
						content,
						imageUrl,
						creator: {
								name: 'Yan Kairalla'
						}  
		});
		post.save()
		.then(result => {
				console.log(result);
				res.status(201).json({
						message: 'Post created successfully!',
						post  : result 
				}); 
		})
		.catch(err => {
				if(!err.statusCode) {
					 err.statusCode = 500; 
				}
				next(err);
		});
		// Create post in db
};

exports.getPost = (req, res, next) => {
		const postId = req.params.postId;
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
				const error = new Error('Validation failed, data is incorrect!');
				error.statusCode = 422;
				throw error;
		}
		Post.findById(postId)
		.then(post => {
				if(!post) {
						const error = new Error('Could not find post.');
						error.statusCode = 404;
						throw error;
				}
				console.log(post);
				res.status(200)
				.json({
						message: 'Post fetched',
						 post
				});
		})
		.catch(err => {
				if(!err.statusCode) {
					 err.statusCode = 500; 
				}
				next(err);
		});
};

exports.updatePost = (req, res, next) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
				const error = new Error('Validation failed, data is incorrect!');
				error.statusCode = 422;
				throw error;
		}
		const postId = req.params.postId;
		const title = req.body.title;
		const content = req.body.content;
		let imageUrl = req.body.image;
		if(req.file) {
				imageUrl = req.file.path;
		}
		if(!imageUrl) {
				const error = new Error('No file picked!.');
				error.statusCode = 422;
				throw error;
		}

		Post.findById(postId)
		.then(post => {
				if(!post) {
						const error = new Error('Could not find post.');
						error.statusCode = 404;
						throw error;
				}
				if(imageUrl !== post.imageUrl) {
					clearImage(post.imageUrl);
				}	
				post.title = title;
				post.imageUrl = imageUrl;
				post.content = content;
				return post.save();			
		})
		.then(result => {
			res.status(200).json({ message: 'Post Updated!', post: result })
		})
		.catch(err => {
				if(!err.statusCode) {
					 err.statusCode = 500; 
				}
				next(err);			
		})
};

exports.deletePost = (req, res, next) => {
	const postId = req.params.postId;
	Post.findById(postId)
	.then(post => {
			if(!post) {
			const error = new Error('Could not find post.');
			error.statusCode = 404;
			throw error;
		}
		//check logged in user
		clearImage(post.imageUrl);
		return Post.findByIdAndRemove(postId);
	})
	.then(result => {
		console.log(result);
		res.status(200).json({ message: 'Deleted Post.' });
	})
	.catch(err => {
		if(!err.statusCode) {
					 err.statusCode = 500; 
				}
				next(err);		
	})
};

const clearImage = filePath => {
	filePath = path.join(__dirname, '..', filePath);
	fs.unlink(filePath, err => console.log(err));
};