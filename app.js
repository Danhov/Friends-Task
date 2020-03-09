const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const passport = require('passport');
const flash = require('connect-flash');
const session = require('express-session');
const path = require('path');

const app = express();
require('./config/passport')(passport);

// Establishing connection to MongoDB database and inserting default documents if empty
mongoose.connect('mongodb://localhost:27017/users', { useNewUrlParser: true });
const User = require('./models/User');

//Insert default users if db is empty
User.findOne({}, function(err, user) {
	const defaultUsers = [
		{
			name           : 'John Doe',
			email          : 'john@mail.com',
			password       : 'johnpass',
			friendRequests : {
				outgoing : [],
				incoming : [
					{
						name  : 'Jack Sparrow',
						email : 'jack@mail.com'
					}
				]
			}
		},
		{
			name     : 'Jane Smith',
			email    : 'jane@mail.com',
			password : 'janepass'
		},
		{
			name           : 'Jack Sparrow',
			email          : 'jack@mail.com',
			password       : 'balckpearl',
			friendRequests : {
				outgoing : [
					{
						name  : 'John Doe',
						email : 'john@mail.com'
					}
				],
				incoming : []
			}
		},
		{
			name     : 'Robert Eriksson',
			email    : 'robert@mail.com',
			password : 'robertpass'
		},
		{
			name     : 'Helen Jones',
			email    : 'helen@mail.com',
			password : 'helenpass'
		}
	];

	if (!user) {
		User.insertMany(defaultUsers);
	}
});

app.use(express.urlencoded({ extended: true }));

app.use(expressLayouts);
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

app.use(
	session({
		secret            : 'secret',
		resave            : true,
		saveUninitialized : true
	})
);

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

// Defining global variables for login/logout messages
app.use(function(req, res, next) {
	res.locals.success_msg = req.flash('success_msg');
	res.locals.error_msg = req.flash('error_msg');
	res.locals.error = req.flash('error');
	next();
});

// Defining routes
app.use('/', require('./routes/index.js'));
app.use('/users', require('./routes/users.js'));
app.use('/friends', require('./routes/friendRequests.js'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server is up and running on port ${PORT}`));
