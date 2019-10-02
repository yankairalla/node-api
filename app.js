const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');

const feedRoutes = require('./routes/feed');
const authRoutes = require('./routes/auth');

const app = express();

//The local folder to store and renaming the files 
const fileStorage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, 'images');
	},
	filename: (req, file, cb) => {
		cb(null, new Date().toISOString().replace(/:/g, '-') + file.originalname);
	}
});

//the types accepted to upload or download the images (png, jpg, jpeg)
const fileFilter = (req, file, cb) => {
	if(
		file.mimetype === 'image/png' ||
		file.mimetype === 'image/jpg' ||
		file.mimetype === 'image/jpeg'
	) {
		cb(null, true);
	} else {
		cb(null, false);
	}
};

// app.use(bodyParser.urlencoded()); // x-www-form-urlencoded <form>
app.use(bodyParser.json()); // aplication/json

app.use(multer({ storage: fileStorage, fileFilter }).single('image'));
// SETTINGS HEADER 
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); // accepts access from all ips(url) or writing the url within commas (if necessary)
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE'); // the methods allowed;
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization'); 
    next();
});

app.use('/images', express.static(path.join(__dirname, 'images')));

app.use('/feed', feedRoutes);
app.use('/auth', authRoutes);

app.use((error, req, res, next) => {
	console.log(error);
	const status = error.statusCode || 500;
	const message = error.message;
	const data = error.data;
	res.status(status).json({ message, data });
})

mongoose.connect(
	'mongodb+srv://bansaidol:12345@cluster0-9ozdd.mongodb.net/messages'
	)
.then(() => {
	const server = app.listen(8080);
	const io = require('./socket').init(server);
	io.on('connection', socket => {
		console.log('Client connected!');
	});
})
.catch(console.log)
