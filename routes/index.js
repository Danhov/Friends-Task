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
	/* const user = await User.findById(req.user.id);
	console.log(user);
	user.friendRequests.outgoing.push({
		_id   : userToAdd._id,
		name  : userToAdd.name,
		email : userToAdd.email
	});
	await user.save();
	//make unique push
	userToAdd = await User.findById(userToAdd._id);
	userToAdd.friendRequests.incoming.push({ _id: user._id, name: user.name, email: user.email });
	await userToAdd.save();

	res.redirect('../users'); */
});

/* User.updateOne(
	{ email: req.user.email },
	{
		$addToSet : {
			friends : [
				{
					email : userToAdd.email,
					name  : userToAdd.name
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
); */

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
