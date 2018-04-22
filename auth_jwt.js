// Fernando Guardado
// file to authorize users & authenticate SECRET_KEY

var passport = require('passport');
var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;
var User = require('./Users');
var Reviews = require('./Reviews');
var dotenv = require('dotenv').config();

var opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme("jwt");
opts.secretOrKey = process.env.SECRET_KEY;

passport.use(new JwtStrategy(opts, function(jwt_payload, done) {
    User.findById(jwt_payload.id, function (err, user) {
        if (user) {
            done(null, user);
        } else {
            done(null, false);
        }
    });
}));

passport.use(new JwtStrategy(opts, function(jwt_payload, done){
    Reviews.findById(jwt_payload.id, function (err, user){
        if (user) {
            done(null, user);
        } else {
            done(null, false);
        }
    });
}));

exports.isAuthenticated = passport.authenticate('jwt', { session : false });
exports.secret = opts.secretOrKey ;
