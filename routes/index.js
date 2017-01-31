// moved mongoose and etc up here


var express = require('express');
var router = express.Router();

// moved post/comment below express
var mongoose = require('mongoose');
var Post = mongoose.model('Post');
var Comment = mongoose.model('Comment');
var User = mongoose.model('User');
var jwt = require('express-jwt');
// hard coded 'secret' var should be replaced with environmental var later
var auth = jwt({secret: 'SECRET' , userProperty: 'payload'});

var passport = require('passport');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index' , { title: 'Express' });
});


// first route
router.get('/posts', function(req, res, next) {
  Post.find(function(err, posts){
    if(err){ return next(err); }

    res.json(posts);
  });
});
// first route

// create a POST route
// require authentication for posting
router.post('/posts', auth,  function(req, res, next) {
    var post = new Post(req.body);
    // set author field when creating posts
    post.author = req.payload.username;
  
  post.save(function(err, post){
    if(err){ return next(err); }

    res.json(post);
  });
});
// create a POST route


// route for preloading post objects
router.param('post', function(req, res, next, id) {
    var query = Post.findById(id);

    query.exec(function (err, post){
        if (err) { return next(err); }
        if (!post) { return next(new Error('can\'t find post')); }

    req.post = post;
    return next();
    });
});
// route for preloading post objects

// route for returning single post
router.get('/posts/:post', function(req, res, next) {
    req.post.populate('comments', function(err, post) {
        if (err) { return next(err); }

        res.json(post);
    });
});
// route for returning single post

// route for preloading comments
router.param('comment', function(req, res, next, id){
    var query = Comment.findById(id);
    
    query.exec(function (err, comment){
        if (err) { return next(err); }
        if (!comment) { return next(new Error('can\'t find comment')); }

    req.comment = comment;
    return next();
    });
});
//route for reloading commenats




// first route
//var mongoose = require('mongoose');
//var Post = mongoose.model('Post');
//var Comment = mongoose.model('Comment');
// first route




router.put('/posts/:post/upvote', auth, function(req, res, next){
    req.post.upvote(function(err, post){
        if (err) {return next(err);}
        
        res.json(post);
    });
});

// comments route for a particular post
router.post('/posts/:post/comments/', auth, function(req, res, next){
    var comment = new Comment(req.body);
    comment.post = req.post;
    // set author field when creating comments
    comment.author = req.payload.username;
    
    comment.save(function(err, comment){
        if(err){ return next(err); }
        
        req.post.comments.push(comment);
        req.post.save(function(err, post){
            if(err){ return next(err);}
            
            res.json(comment);
        });
    });
});
// comments route fora particular post

// route for comment upvotes
router.put('/posts/:post/comments/:comment/upvote', auth, function(req, res, next){
    req.comment.upvote(function(err, comment){
        if (err) {return next(err);}
        
        res.json(comment);
    });
});
// route for comment upvotes

// route for account creation
router.post('/register', function(req, res, next){
    if(!req.body.username || !req.body.password){
        return res.status(400).json({message: 'Please fill out all fields'});
    }
    
    var user = new User();
    user.username = req.body.username;
    // don't need a ';' after the setPassword?
    user.setPassword(req.body.password)
    user.save(function(err){
        if (err) {return next(err);}
        return res.json({token: user.generateJWT()})
    });
});
// route for account creation

// route for login, authenticates the user and returns a token to the client
router.post('/login', function(req, res, next){
    if(!req.body.username || !req.body.password){
        return res.status(400).json({message: 'Please fill out all fields'});
    }
    
    passport.authenticate('local', function(err, user, info){
        if(err){ return next(err);}
        
        if(user){
            return res.json({token: user.generateJWT()});
        }
        else {
            return res.status(401).json(info);
        }
    }) (req, res, next);
});
// route for login, authenticates the user and returns a token to the client



module.exports = router;