var app = angular.module ('newsClone32', ['ui.router']);

app.config([
/* a 'config' block to configure the home state */
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
            
        $urlRouterProvider.otherwise('home');
    /* the state is named 'home' located at '/home' and will be controlled by 'MainCtrl'.
    if the app receives an undefined url it will redirect to '/home.html' */
    
    
}]);

app.factory('posts', ['$http', function($http){
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
        return $http.post('/posts', post).success(function(data){
            o.posts.push(data);
        });
    };
    
    o.upvote = function(post){
        return $http.put('/posts/' + post._id+'/upvote')
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
        return $http.post('/posts/' + id + '/comments', comment);
    };
    
    
    o.upvoteComment = function(post, comment){
        return $http.put('/posts/' + post._id + '/comments/' + comment._id + '/upvote').success(function(data){
            comment.upvotes += 1;
        });
    };
    
    
    return o;
    /* A new object that has an array property named 'posts'. the 'return obj' is to expose the 'obj' object to any other angular module thata injects it.
    Exposing the post array directly also works (reason for placing it inside a obj is to apparently allow for the addition of other objects and methods later?) */
    
}]);

app.controller('MainCtrl', [
	'$scope',
	/* $scope is a key word that the html file will look for in the js file? need confirmation. changing to %scop does not work */
    'posts',
    /* "injecting" 'posts' to the 'MainCtrl' so 'posts' will be accessible via 'MainStrl' */
	function($scope, posts){
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
function($scope, posts, post){
    // $scope.post = posts.posts[$stateParams.id];  why?
    $scope.post = post;
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
    
}]);