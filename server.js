//load packages
var express = require('express');
var bodyParser = require('body-parser');
var passport = require('passport');
var authJwtController = require('./auth_jwt');
var User = require('./Users');
var Movie = require('./Movies');
var jwt = require('jsonwebtoken');
var dotenv = require('dotenv').config();

//create server app
var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(passport.initialize());

//create router
var router = express.Router();

//route middleware that will happen on every request
router.use(function(req, res, next) {
    //log each request to the console
    console.log(req.method, req.url);

    //continue doing what we were doing and go to the route
    next();
})

//server Routes
router.route('/postjwt')
    .post(authJwtController.isAuthenticated, function (req, res) {
            console.log(req.body);
            res = res.status(200);
            if (req.get('Content-Type')) {
                console.log("Content-Type: " + req.get('Content-Type'));
                res = res.type(req.get('Content-Type'));
            }
            res.send(req.body);
        }
    );

router.route('/users/:userId')
    .get(authJwtController.isAuthenticated, function (req, res) {
        var id = req.params.userId;
        User.findById(id, function(err, user) {
            if (err) res.send(err);

            var userJson = JSON.stringify(user);

            //return that user
            res.json(user);
        });
    });

router.route('/users')
    .get(authJwtController.isAuthenticated, function (req, res) {
        User.find(function (err, users) {
            if (err) res.send(err);

            //return the users
            res.json(users);
        });
    });

router.post('/signup', function(req, res) {
    if (!req.body.username || !req.body.password) {
        res.json({ success: false, message: 'Please pass username and password.' });
    }
    else {
        var user = new User();
        user.name = req.body.name;
        user.username = req.body.username;
        user.password = req.body.password;

        // save the user
        user.save(function(err) {
            if (err) {
                // duplicate entry
                if (err.code === 11000)
                    return res.json({ success: false, message: 'A user with that username already exists.' });
                else
                    return res.send(err);
            }

            res.json({ message: 'User created!' });
        });
    }
});

router.post('/signin', function(req, res) {
    var userNew = new User();
    userNew.name = req.body.name;
    userNew.username = req.body.username;
    userNew.password = req.body.password;

    User.findOne({ username: userNew.username }).select('name username password').exec(function(err, user) {
        if (err) res.send(err);

        user.comparePassword(userNew.password, function(isMatch){
            if (isMatch) {
                var userToken = {id: user._id, username: user.username};
                var token = jwt.sign(userToken, process.env.SECRET_KEY);
                res.json({ success: true, token: 'JWT ' + token });
            }
            else {
                res.status(401).send({ success: false, msg: 'Authentication failed. Wrong password.' });
            }
        });


    });
});

router.route('/movies')
    //get all movies
    .get(authJwtController.isAuthenticated, function (req, res) {
        Movie.find(function (err, movies) {
            //if error, send error
            if (err) res.send(err);

            //return movies
            res.json(movies);
        });
    })
    //create a new movie
    .post(authJwtController.isAuthenticated, function (req, res) {
        if (!req.body.title || !req.body.year || !req.body.genre || !req.body.actors) {
            res.json({ success: false, message: 'Movie information is incorrect. Please include title, year, genre and actors.' });
        }
        else if (req.body.actors.length < 3) {
            res.json({ success: false, message: 'Please include at least three actors(actor name, character name).' })
        }
        else {
            //create new movie object
            var movie = new Movie();

            //add req object info to movie object
            movie.title = req.body.title;
            movie.year = req.body.year;
            movie.genre = req.body.genre;
            movie.actors = req.body.actors;

            //save the movie object
            movie.save(function(err) {
                if (err) {
                    //duplicate entry
                    if (err.code === 11000)
                        return res.json({ success: false, message: 'A movie with that title already exists.' });
                    else
                        return res.send(err);
                }
                res.json({ message: 'Movie created!' });
            });
        }
    })
    //update a movie
    .put(authJwtController.isAuthenticated, function (req, res) {
        Movie.findById(req.body._id,function (err, movie) {
            if (err) {
                res.send(err);
            }
            else if (!req.body.title || !req.body.year || !req.body.genre || !req.body.actors) {
                res.json({ success: false, message: 'Movie information is incorrect. Please include title, year, genre and actors.' });
            }
            else if (req.body.actors.length < 3)
            {
                res.json({ success: false, message: 'Please include at least three actors(actor name, character name).' });
            }
            else {
                movie.title = req.body.title;
                movie.year = req.body.year;
                movie.genre = req.body.genre;
                movie.actors = req.body.actors;

                movie.save(function(err) {
                    if (err) {
                        // duplicate entry
                        if (err.code === 11000)
                            return res.json({ success: false, message: 'A movie with that title already exists.' });
                        else
                            return res.send(err);
                    }
                    res.json({ message: 'Movie Updated!' });
                });
            }
        });
    })
    //delete a movie
    .delete(authJwtController.isAuthenticated, function (req, res) {
        Movie.findByIdAndRemove(req.body._id,function (err, movie) {
            if (err) res.send(err);

            res.json({ message: 'Movie Deleted!' });
        });
    });

app.use('/', router);
app.listen(process.env.PORT || 8080);