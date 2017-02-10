Mean stack tutorial from thinkster.io (https://thinkster.io/tutorials/mean-stack)

To Run: Start up a mongodb server.
		mongod &
	'mongod' is the server part of mongodb, the '&' should move mongod to the background and return the current terminal to useability (doesn't seem to work on windows?)

	Start up the application by running the below command from the application folder (or sub-folders?)
		npm start

	Browse to 'localhost:3000' to access the application.

Files & Folders:

bin/
	

config/
	passport.js


models/
	Comments.js
	
	Posts.js

	Users.js

public/
	images/

	javascripts/
		angularApp.js

	stylesheets/

routes/
	index.js
	
	users.js

views/
	error.ejs

	index.ejs