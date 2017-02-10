// Creates a new module named 'newsClone32' with the 'ui.router' module "injected"
// (the dependency or service is passed by reference) in.
// Below the 'app' declaration are config, factory, and controller code blocks.
// These define the functionality of the application.
// If the 'app' declaration is called again (past the config/factory/controller blocks)
// , all of the previously declared code will be lost (a clean restart?).
// Called into use in the body tag of 'index.ejs' (an embedded javascript file? May want to look into done.js)
// https://docs.angularjs.org/guide/module
var app = angular.module ('newsClone32', ['ui.router']);

// If we remove the semi-colon from above, we should be able to just call '.config' instead of 'app.config' below.
app.config([
/* a 'config' block to configure the different states */
    '$stateProvider',
    '$urlRouterProvider',
    function($stateProvider, $urlRouterProvider){
        
        $stateProvider
            .state('home', {
                url: '/home',
                templateUrl: '/home.html',
                controller: 'MainCtrl',
                resolve: {
                    postPromise: ['posts', function(posts){
                        return posts.getAll();
                    }]
                }
            /* potentailly remove the ';' below and the other states may not need '$stateProvider' */
            });

        
        $stateProvider
        /* without the $stateProvider above, firefox noted a syntax error */
            .state('posts', {
                url: '/posts/{id}',
                /* id is a route parameter (dynamic variable) ???  {id}*/
                templateUrl: '/posts.html',
                controller: 'PostsCtrl',
                resolve: {
                    post: ['$stateParams', 'posts', function($stateParams, posts){
                        return posts.get($stateParams.id);
                    }]
                }
            });
            
        $stateProvider
            .state('login', {
                url: '/login',
                templateUrl: '/login.html',
                controller: 'AuthCtrl',
                onEnter: ['$state', 'auth', function($state, auth){
                    if(auth.isLoggedIn()){
                        $state.go('home');
                    }
                }]
            });

        $stateProvider
            .state('register', {
                url: '/register',
                templateUrl: '/register.html',
                controller: 'AuthCtrl',
                onEnter: ['$state', 'auth', function($state, auth){
                    if(auth.isLoggedIn()){
                        $state.go('home');
                    }
                }]
            });
            
        $urlRouterProvider.otherwise('home');
    /* the state is named 'home' located at '/home' and will be controlled by 'MainCtrl'.
    if the app receives an undefined url it will redirect to '/home.html' */
    
    
}]);

/* factory for authentication */
app.factory('auth',['$http', '$window', function($http, $window){
    var auth = {};
    
    auth.saveToken = function(token){
        $window.localStorage['newsClone32-token'] = token;
    };
    
    auth.getToken = function(){
        return $window.localStorage['newsClone32-token'];
    /* for some reason the tutorial doesn't have a ';' after the '}' closing bracket? */
    /* need to double check but semi-colons after '}' may be entirely optional */
    /* http://stackoverflow.com/questions/17036135/why-is-it-that-semicolons-are-not-used-after-if-else-statements */
    /* semi-colons following a '}' will just be ignored? */
    }
    
    auth.isLoggedIn = function(){
        var token = auth.getToken();
       
        if(token){
            /* 'atob()' decodes a base-64 encoded string back to plain text, conversly 'btoa()' converts a string to base-64 encoding */
            var payload = JSON.parse($window.atob(token.split('.')[1]));
           
            return payload.exp > Date.now() / 1000;
        
        /* having ';' after the curly closing the 'if' statement causes the 'else' to become invalida */
        /* the page becomes blank */
        } else {
            return false;
        /* may need to remove ';' */
        /* ';' here seems to be ok (i.e. with or without still works) */
        };
    };
    
    auth.currentUser = function(){
        if(auth.isLoggedIn()){
            var token = auth.getToken();
            var payload = JSON.parse($window.atob(token.split('.')[1]));
            
            return payload.username;
        }
    };
    
    auth.register = function(user){
        return $http.post('/register', user).success(function(data){
            auth.saveToken(data.token);
        });
    };
    
    auth.logIn = function(user){
        return $http.post('/login', user).success(function(data){
            auth.saveToken(data.token);
        });
    };
    
    auth.logOut = function(){
        $window.localStorage.removeItem('newsClone32-token');
    };
    
    return auth;
}]);
/* factory for authentication */


/* inject auth service to posts service */
app.factory('posts', ['$http', 'auth', function($http, auth){
    /*  */
    var o = {
        posts: []
        
    };
    
    o.getAll = function(){
      return $http.get('/posts').success(function(data){
        angular.copy(data, o.posts);
        /* important to use angular.copy, (a deep copy). ensures $scope.posts in MainCtrl is updated and any new values are reflected in our view */
      });
    };
    // getAll function to retrieve posts from the posts service
    
    o.create = function(post){
        return $http.post('/posts', post,{
            headers: {Authorization: 'Bearer '+auth.getToken()}
        }).success(function(data){
            o.posts.push(data);
        });
    };
    
    o.upvote = function(post){
        return $http.put('/posts/' + post._id+'/upvote', null, {
            headers: {Authorization: 'Bearer '+auth.getToken()}
        })
        .success(function(data){
            post.upvotes +=1;
        });
    };
    
    // uses a 'promise' instead of success method 
    o.get = function(id){
        return $http.get('/posts/' + id).then(function(res){
            return res.data;
        });
    };
    
    o.addComment = function(id, comment){
        return $http.post('/posts/' + id + '/comments', comment,{
            headers: {Authorization: 'Bearer '+auth.getToken()}
        });
    };
    
    
    o.upvoteComment = function(post, comment){
        return $http.put('/posts/' + post._id + '/comments/' + comment._id + '/upvote', null,{
            headers: {Authorization: 'Bearer '+auth.getToken()}
        }).success(function(data){
            comment.upvotes += 1;
        });
    };
    
    
    return o;
    /* A new object that has an array property named 'posts'. the 'return o' is to expose the 'o' object to any other angular module thata injects it.
    Exposing the post array directly also works (reason for placing it inside a 'o' is to apparently allow for the addition of other objects and methods later?) */
    
}]);

// $scope, posts and auth are injected into this controller?
// Then in the 'function' call, the parameters passed in ($scope, posts, and auth) are ?linked? to the
// injected '$scope' , 'posts' and 'auth' just before 'function'.
// Can they just be named any other variables? e.g 'function(scopeVar,postsVar,authVar)'?
//
// I don't think we can do 'app.controller('MainCtrl', function($scope, posts, auth)' because the 3 parameters don't have providers available by default?
// e.g. $http: $HttpProvider, $controller: $ControllerProvider, etc. in angular.js under $provide.provider
// https://www.youtube.com/watch?v=NnB2NBtoeAY&list=PLP6DbQBkn9ymGQh2qpk9ImLHdSH5T7yw7&index=26
app.controller('MainCtrl', [
	'$scope',
	/* $scope is a key word that the html file will look for in the js file? need confirmation. changing to %scop does not work */
    'posts',
    /* "injecting" 'posts' to the 'MainCtrl' so 'posts' will be accessible via 'MainStrl' */
    'auth',
	function($scope, posts, auth){
        /* added 'posts' here because ??? */
		$scope.test = 'Hello world!';

        /* below is the old posts object, before being replaced with a factory/service
		$scope.posts=[
			{title: 'post1', upvotes:5},
			{title: 'post2', upvotes:2},
			{title: 'post3', upvotes:15},
			{title: 'post4', upvotes:9},
			{title: 'post5', upvotes:4},
		];
        */
        
        $scope.isLoggedIn = auth.isLoggedIn;

        $scope.posts = posts.posts;
        /* two-way data binding only applies to variables within 'scope' so we bind the the 'posts' array within the 'posts' factory to the '$scope.posts' variable? 
        post data should now be stored in the factory/service instead of the local scope, accessible to any module that injects the 'posts' factory/service. */
        /* Hit a '$state.post is undefined' here, fixed by changing '%state.post' to '$state.posts'. Error does not show until you hit the 'Post Button via Form' button and nothing happens. TTF ~1hr */
		
		$scope.addPost = function(){
		/* when addPost is called it should add a new post object to the posts collection */
			if(!$scope.title || $scope.title===''){return;}
			/* trying to prevent users from submitting a post with a blank title, NOTE the THREE equals for comparison */
            
            posts.create({
                title: $scope.title,
                link: $scope.link,
            });
        
			/* testing comments
            $scope.posts.push({
				title: $scope.title,
				link: $scope.link,
				upvotes: 0,
                comments: [
                    {author: 'Guy1', body: 'comment1', upvotes:0},
                    {author: 'Guy2', body: 'comment2', upvotes:0}
                ]
			});
            */
            
			/* the new post object has it's title attribute set to $scope.title ? NeConf */
			$scope.title = '';
			$scope.link = '';
			/* sets the title and link text areas to blank */
		}
		
		$scope.incrementUpvotes = function(post){
			posts.upvote(post);
		}
	}
]);

app.controller('PostsCtrl', [
    '$scope',
    'posts',
    'post',
    'auth',
    function($scope, posts, post, auth){
        // $scope.post = posts.posts[$stateParams.id];  why?
        $scope.post = post;
        
        $scope.isLoggedIn = auth.isLoggedIn;
        
        $scope.addComment=function(){
            if($scope.body==='') {return;}
            posts.addComment(post._id, {
                body: $scope.body,
                author: 'user',
            }).success(function(comment) {
                $scope.post.comments.push(comment);
            });
            $scope.body = '';
        }
        
        
        $scope.incrementUpvotes = function(comment){
            posts.upvoteComment(post, comment);
        };
         
         
         /* Looks like I need the incrementUpvotes function here for comment voting? */
        
    }
]);

app.controller('AuthCtrl',[
    '$scope',
    '$state',
    'auth',
    function($scope, $state, auth){
        $scope.user = {};
        
        $scope.register = function(){
            auth.register($scope.user).error(function(error){
                $scope.error = error;
            }).then(function(){
                $state.go('home');
            });
        };
        
        $scope.logIn = function(){
            auth.logIn($scope.user).error(function(error){
                $scope.error = error;
            }).then(function(){
                $state.go('home');
            });
        };
    }
]);

app.controller('NavCtrl', [
    '$scope',
    'auth',
    function($scope, auth){
        $scope.isLoggedIn = auth.isLoggedIn;
        $scope.currentUser = auth.currentUser;
        $scope.logOut = auth.logOut;
}]);