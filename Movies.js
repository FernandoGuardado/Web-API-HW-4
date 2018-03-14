// Fernando Guardado
// Movie Schema Jason File for Mongoose 

var mongoose = require('mongoose');
var schema = mongoose.Schema;

mongoose.connect(process.env.DB);

// movie schema
var MovieSchema = new schema({
/* Title */                  title: { type: String, required: true, index: { unique: true }},
/* Year */                   year: { type: String, required: true },
/* Genre */                  genre: { type: String, required: true, enum:['Action','Adventure','Comedy','Drama','Fantasy','Horror','Mystery','Thriller','Western']},
/* Actors */                 actors : { type : Array , "default" : [] }
                             });


// return movie
module.exports = mongoose.model('Movie:', MovieSchema);

