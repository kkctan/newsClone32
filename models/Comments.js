// Load mongoose module
var mongoose = require('mongoose');

// Creates a schema(blueprint/class definition) for a comment
var CommentSchema = new mongoose.Schema({
    body: String,
    author: String,
    upvotes: {type: Number, default: 0},
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' }
});


// Used In: index.js, angularApp.js, app.js, Posts.js
// Purpose: Upvote a comment's score
// Input: cb is ???
// Side Effects: Increase the 'upvotes' count of the comment by 1.
//               Save the data to the database?
// Output: N/A
// Notes:
CommentSchema.methods.upvote = function (cb){
    this.upvotes += 1;
    this.save(cb);
}

// creates a model named 'Comment', must be called after all of CommentSchema's/the schema's functions have been defined.
mongoose.model('Comment', CommentSchema);