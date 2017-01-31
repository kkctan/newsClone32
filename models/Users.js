var mongoose = require('mongoose');
// load node's crypto module to handle password hashing
var crypto = require('crypto');
// load the json web token module for???
var jwt = require('jsonwebtoken');

var UserSchema= new mongoose.Schema({
    username: {type: String, lowercase: true, unique: true},
    hash: String,
    salt: String
});

UserSchema.methods.setPassword = function(password){
    this.salt = crypto.randomBytes(16).toString('hex');
    
    this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');
};

UserSchema.methods.validPassword = function(password) {
    var hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');
    
    return this.hash === hash;
};

UserSchema.methods.generateJWT = function(){
    
    // set expiration to 60 days
    // why do we need to set today first then exp?
    var today = new Date();
    var exp = new Date(today);
    exp.setDate(today.getDate() + 60);
    
    return jwt.sign({
        // why an underscore before 'id' ???
        _id: this._id,
        username: this.username,
        exp: parseInt(exp.getTime() / 1000),
    // SECRET is hard coded here but it is recommended to use an 'environment variable for referencing the secret'
    }, 'SECRET');
};

mongoose.model('User', UserSchema);