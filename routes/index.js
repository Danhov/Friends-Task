const express = require('express');
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');
//load User model
const User = require('../models/User');

// Welcome Page
router.get('/', forwardAuthenticated, (req, res) => res.render('login'));

//All users list
router.get('/users', ensureAuthenticated, (req, res) => {
	User.find({ name: { $ne: req.user.name } }, { password: 0 }, function(err, users) {
		res.render('users', {
			user        : req.user,
			usersOnSite : users
		});
	});

	console.log(req);
});

//Search friend request
router.post('/users', ensureAuthenticated, (req, res) => {
	User.find(
		{
			$and : [
				{ name: new RegExp('\\b' + req.body.search.trim() + '\\w+\\b', 'i') },
				{ name: { $ne: req.user.name } }
			]
		},
		(err, foundUsers) => {
			if (err) {
				console.log(err);
				res.redirect('users');
			}
			if (!foundUsers) res.redirect('users');
			res.render('users', {
				user        : req.user,
				usersOnSite : foundUsers
			});
		}
	);
});

//Add friend request
router.post('/users/add_friend', ensureAuthenticated, async (req, res) => {
	let userToAdd = JSON.parse(req.body.addFriendButton);

	User.updateOne(
		{ email: req.user.email },
		{
			$addToSet : {
				'friendRequests.outgoing' : [
					{
						email : userToAdd.email,
						name  : userToAdd.name,
						_id   : userToAdd._id
					}
				]
			}
		},
		function(err, result) {
			if (err) {
				console.log(err);
			}
		}
	);

	User.updateOne(
		{ email: userToAdd.email },
		{
			$addToSet : {
				'friendRequests.incoming' : [
					{
						email : req.user.email,
						name  : req.user.name,
						_id   : req.user._id
					}
				]
			}
		},
		function(err, result) {
			if (err) {
				console.log(err);
			}
			else {
				res.redirect('../users');
			}
		}
	);
});

//Ignore incoming friend request
router.post('/users/ignore', ensureAuthenticated, (req, res) => {
	User.updateOne(
		{ email: req.user.email },
		{
			$pull : {
				'friendRequests.incoming' : { email: req.body.ignoreFriendButton }
			}
		},
		function(err, raw) {
			if (err) {
				console.log(err);
			}
		}
	);
	User.updateOne(
		{ email: req.body.ignoreFriendButton },
		{
			$pull : {
				'friendRequests.outgoing' : { email: req.user.email }
			}
		},
		function(err, raw) {
			if (err) {
				console.log(err);
			}
			else {
				res.redirect('../users');
			}
		}
	);
});

//Cancel outgoing friend request
router.post('/users/cancel', ensureAuthenticated, (req, res) => {
	User.updateOne(
		{ email: req.user.email },
		{
			$pull : {
				'friendRequests.outgoing' : { email: req.body.cancelFriendButton }
			}
		},
		function(err, raw) {
			if (err) {
				console.log(err);
			}
		}
	);
	User.updateOne(
		{ email: req.body.cancelFriendButton },
		{
			$pull : {
				'friendRequests.incoming' : { email: req.user.email }
			}
		},
		function(err, raw) {
			if (err) {
				console.log(err);
			}
			else {
				res.redirect('../users');
			}
		}
	);
});

//Remove friend
router.post('/users/remove_friend', ensureAuthenticated, (req, res) => {
	User.update(
		{ _id: req.user._id },
		{ $pull: { friends: { email: req.body.removeFriendButton } } },
		function(err, raw) {
			if (err) {
				console.log(err);
			}
			else {
				res.redirect('../users');
			}
		}
	);
});

module.exports = router;
