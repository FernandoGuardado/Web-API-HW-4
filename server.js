// Fernando Guardado
import express, { Router } from "express";
import { json, urlencoded } from "body-parser";
import { initialize } from "passport";
import { isAuthenticated } from "./auth_jwt";
import User, { findById, find, findOne } from "./Users";
import { sign } from "jsonwebtoken";
import Movie, { find as _find, findById as _findById, findByIdAndRemove } from "./Movies";
var dotenv = require('dotenv').config();
import { connect } from "mongoose";


// creates application
var app = express();
app.use(json());
app.use(urlencoded({ extended: false }));

app.use(initialize());

// initialize router
var router = Router();

connect(process.env.DB , (err, database) => {
                 if (err) throw err;
                 console.log("Connected to the database.");
                 db = database;
                 console.log("Database connected on " + process.env.DB);
                 });

//===============================================================================================
// routes
//===============================================================================================
// /postjwt route
router.route('/postjwt')
    .post(isAuthenticated, function (req, res) {
            console.log(req.body);
            res = res.status(200);
            if (req.get('Content-Type')) {
                console.log("Content-Type: " + req.get('Content-Type'));
                res = res.type(req.get('Content-Type'));
            }
            res.send(req.body);
        }
    );
//===============================================================================================
// /users/:userID route
router.route('/users/:userId')
    .get(isAuthenticated, function (req, res) {
        var id = req.params.userId;
        findById(id, function(err, user) {
            if (err) res.send(err);

            var userJson = JSON.stringify(user);
            // return that user
            res.json(user);
        });
    });
//===============================================================================================
// /users route
router.route('/users')
    .get(isAuthenticated, function (req, res) {
        find(function (err, users) {
            if (err) res.send(err);
            // return the users
            res.json(users);
        });
    });
//===============================================================================================
// /signup route
router.post('/signup', function(req, res) {
            if (!req.body.username || !req.body.password) {
            res.json({success: false, msg: 'Please pass username and password.'});
            }
            else {
            var user = new User();
            user.name = req.body.name;
            user.username = req.body.username;
            user.password = req.body.password;
            //res.json({success: true, msg: 'got to set values'});
            // save the user
            user.save(function(err) {
                      if (err) {
                      // duplicate entry
                      if (err.code == 11000)
                      return res.json({ success: false, message: 'A user with that username already exists. '});
                      else
                      return res.send(err);
                      }
                      res.json({ message: 'User created!' });
                      });
            }
            });
//===============================================================================================
// /signin route
router.post('/signin', function(req, res) {
    var userNew = new User();
    userNew.name = req.body.name;
    userNew.username = req.body.username;
    userNew.password = req.body.password;

    findOne({ username: userNew.username }).select('name username password').exec(function(err, user) {
        if (err) res.send(err);

        user.comparePassword(userNew.password, function(isMatch){
            if (isMatch) {
                var userToken = {id: user._id, username: user.username};
                var token = sign(userToken, process.env.SECRET_KEY);
                res.json({success: true, token: 'JWT ' + token});
            }
            else {
                res.status(401).send({success: false, msg: 'Authentication failed. Wrong password.'});
            }
        });


    });
});
//===============================================================================================
// /movies route
router.route('/movies')
//get all movies
.get(isAuthenticated, function (req, res) {
    _find(function (err, movies) {
                //if error, send error
                if (err) res.send(err);
                
                //return movies
                res.json(movies);
                });
     })
//create a new movie
.post(isAuthenticated, function (req, res) {
      if (!req.body.title || !req.body.year || !req.body.genre || !req.body.actors) {
      res.json({ success: false, message: 'You have entered the movie information incorrectly. You need to include: Title, Year, Genre & Actors (Actor Name & Character Name).' });
      }
      else if (req.body.actors.length < 3) {
      res.json({ success: false, message: 'Please add at atleast three actors to the movie. Must have the actor name & character name which they played. Format: (Actor Name, Character Name).' })
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
                 return res.json({ success: false, message: 'This movie already exists! -_-' });
                 else
                 return res.send(err);
                 }
                 res.json({ message: 'Movie has been created...' });
                 });
      }
      })
//update a movie
.put(isAuthenticated, function (req, res) {
    _findById(req.body._id,function (err, movie) {
                    if (err) {
                    res.send(err);
                    }
                    else if (!req.body.title || !req.body.year || !req.body.genre || !req.body.actors) {
                    res.json({ success: false, message: 'You have entered the movie information incorrectly. You need to include: Title, Year, Genre & Actors (Actor Name & Character Name).' });
                    }
                    else if (req.body.actors.length < 3)
                    {
                    res.json({ success: false, message: 'Please add at atleast three actors to the movie. Must have the actor name & character name which they played. Format: (Actor Name, Character Name).' });
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
                               return res.json({ success: false, message: 'This movie already exists! -_-' });
                               else
                               return res.send(err);
                               }
                               res.json({ message: 'Movie has been updated...' });
                               });
                    }
                    });
     })
//delete a movie
.delete(isAuthenticated, function (req, res) {
    findByIdAndRemove(req.body._id,function (err, movie) {
                                if (err) res.send(err);
                                
                                res.json({ message: 'Movie has been deleted from the database...' });
                                });
        });
//===============================================================================================
app.use('/', router);
app.listen(process.env.PORT || 8080);
