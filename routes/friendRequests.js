const express = require('express');
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');
//load User model
const User = require('../models/User');

//Show list of pending friend requests and list of friends
router.get('/', ensureAuthenticated, (req, res) => {
	res.render('friendRequests', { currentUser: req.user });
});

//Accept friend request
router.post('/accept', ensureAuthenticated, (req, res) => {
	const userToAccept = JSON.parse(req.body.addFriendButton);

	User.updateOne(
		{ email: req.user.email },
		{
			$addToSet : { friends: [ userToAccept ] },
			$pull     : {
				'friendRequests.incoming' : { email: userToAccept.email },
				'friendRequests.outgoing' : { email: userToAccept.email }
			}
		},
		function(err, result) {
			if (err) {
				console.log(err);
			}
		}
	);

	User.updateOne(
		{ email: userToAccept.email },
		{
			$addToSet : {
				friends : [ { _id: req.user._id, email: req.user.email, name: req.user.name } ]
			},
			$pull     : {
				'friendRequests.incoming' : { email: req.user.email },
				'friendRequests.outgoing' : { email: req.user.email }
			}
		},
		function(err, result) {
			if (err) {
				console.log(err);
			}
			else {
				res.redirect('../friends');
			}
		}
	);
});

//Ignore incoming friend request
router.post('/ignore', ensureAuthenticated, (req, res) => {
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
				res.redirect('../friends');
			}
		}
	);
});

//Cancel outgoing friend request
router.post('/cancel', ensureAuthenticated, (req, res) => {
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
				res.redirect('../friends');
			}
		}
	);
});

//Remove friend
router.post('/remove_friend', ensureAuthenticated, (req, res) => {
	User.updateOne(
		{ _id: req.user._id },
		{ $pull: { friends: { email: req.body.removeFriendButton } } },
		function(err, raw) {
			if (err) {
				console.log(err);
			}
			else {
				res.redirect('../friends');
			}
		}
	);
});

module.exports = router;
