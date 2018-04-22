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

router.use('/reviews', (req, res, next) => {
    //First must authenticate
    var token = req.headers['x-access-token'] || req.body.token || req.query.token;
    var secretOrKey = process.env.SECRET_KEY;
    //console.log("Token:  " + token);
    if (token != null) {
        jwt.verify(token, secretOrKey, function (err, decoded) {
            if (err) {
                return res.status(403).send({
                    success: false,
                    message: 'Failed to authenticate token.'
                });
            } else {
                console.log("User authenticated.");
                req.decoded = decoded;
                next();
            }
        });
    } else {
        return res.status(403).send({
            success: false,
            message: 'No token provided.'
        });
    }
});

exports.isAuthenticated = passport.authenticate('jwt', { session : false });
exports.secret = opts.secretOrKey ;
