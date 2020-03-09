const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
	name           : {
		type     : String,
		required : true
	},
	email          : {
		type     : String,
		required : true
	},
	password       : {
		type     : String,
		required : true
	},
	date           : {
		type    : Date,
		default : Date.now
	},
	friends        : [],
	friendRequests : {
		incoming : [ {} ],
		outgoing : [ {} ]
	}
});

UserSchema.pre('save', function(next) {
	const user = this;

	// only hash the password if it has been modified (or is new)
	if (!user.isModified('password')) return next();

	// generate a salt
	bcrypt.genSalt(10, function(err, salt) {
		if (err) return next(err);

		// hash the password using our new salt
		bcrypt.hash(user.password, salt, function(err, hash) {
			if (err) return next(err);

			// override the cleartext password with the hashed one
			user.password = hash;
			next();
		});
	});
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
