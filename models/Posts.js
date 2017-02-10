// Load mongoose module
var mongoose = require('mongoose');

// Creates a schema(blueprint/class definition) for a post
var PostSchema = new mongoose.Schema({
    title: String,
    link: String,
    upvotes: {type: Number, default: 0},
    // Do I really need curly brackets here?
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }]
});


// Used In: index.js, angularApp.js, app.js, Posts.js
// Purpose: Upvote a post's score
// Input: cb is ???
// Side Effects: Increase the 'upvotes' count of the post by 1.
//               Save the data to the database?
// Output: N/A
// Notes:
PostSchema.methods.upvote = function(cb){
    this.upvotes += 1;
    this.save(cb);
};

// all methods need to be declared BEFORE the schema is set.
mongoose.model('Post', PostSchema);