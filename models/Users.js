// Mongoose is a node.js module that provides an interface to MongoDB data.
// Allows for (easier) access to create/read/update/delete commands (C.R.U.D.).
// Below we load the external module called 'mongoose' which can be accessed by the bound variable
// (also called mongoose in this case).
// http://fredkschott.com/post/2014/06/require-and-the-module-system/
var mongoose = require('mongoose');

// Load node's crypto module to handle password hashing.
var crypto = require('crypto');

// Load the json web token module for???
// https://jwt.io/
var jwt = require('jsonwebtoken');

// Define a new 'Schema' object named 'UserSchema'.
// A schema basically represents the structure of a MongoDB document (can fully or partially represent one),
// at least the part of the document that we want to work with.
// I like to think of a schema as a blueprint, from which the model will be built (at the end of this file).
// http://mongoosejs.com/docs/guide.html
var UserSchema= new mongoose.Schema({
    
    // Here we have the user name (of string type, converted to lower case,
    // must be a unique index i.e. no duplicate user names), the hashed password,
    // and the salt used to create the hashed password.
    // http://mongoosejs.com/docs/schematypes.html
    username: {type: String, lowercase: true, unique: true},
    hash: String,
    salt: String
});

// Below we define methods/functions that can be applied to our 'UserSchema' data.


// Used In: index.js
// Purpose: Set the hashed password and the salt used for the 'User'.
// Input: Password (string).
// Side Effects: Set the 'salt' of the model to (the hex of a string of) the 16 pseudo-random bytes.
//               Set the 'hash' of the model to (the hex of a string of) the hashed password.
// Output: N/A
UserSchema.methods.setPassword = function(password){
    this.salt = crypto.randomBytes(16).toString('hex');
    
    this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');
};

// Used In: passport.js
// Purpose: Validate the entered password against the saved hash.
// Input: Password (string).
// Side Effects: N/A
// Output: Is the hashed password, attempting to gain entry, the same as the stored hash (boolean).
UserSchema.methods.validPassword = function(password) {
    var hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');
    
    return this.hash === hash;
};

// Used In: index.js
// Purpose: Create a Json web token used to authenticate the user
// Input: N/A
// Side Effects: ???
// Output: N/A
// Notes: https://en.wikipedia.org/wiki/JSON_Web_Token
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

// creates a model named 'User', must be called after all of UserSchema's/the schema's functions have been defined.
mongoose.model('User', UserSchema);