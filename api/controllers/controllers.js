//var dbconn = require('../data/dbconnection.js');
var mongoose = require('mongoose');
var Hotel = mongoose.model('Hotelinfo');

var runGeoQuery = function(req, res){
    var lng = parseFloat(req.query.lng);
    var lat = parseFloat(req.query.lat);

    if(isNaN(lng)||isNaN(lat)){
        res
            .status(400)
            .json({
                "message" : "lat and lat should be numbers"
            });
    }

    //A geoJSON point
    var point = {
      type : "Point",
      coordinates : [lng , lat]
    };

    var geoOptions = {
      spherical : true,
      maxDistance : 2000,
      num : 5
    };


    Hotel
        .geoNear(point,geoOptions, function(err, results, stats){
            var response = {
              status : 200,
              message : results
            };

            console.log('Geo results', results);
            console.log('Geo stats', stats);

            if(err){
                response.status = 500;
                response.message = err;
            } else if(results.length<2){
                response.status = 404;
                response.message = {
                    "message" : "No near results found"
                };
            }

            res
                .status(response.status)
                .json(response.message)
        });
};




module.exports.hotelsGetAll = function(req,res){
    //get the connection to MongoDb with mongod
    // var db = dbconn.get();
    // var collection = db.collection('hotelinfo');



    var offset = 0;
    var count = 3;
    var maxCount = 20;

    if(req.query && req.query.lat && req.query.lng){
        runGeoQuery(req, res);
        return;

    }

    if(req.query && req.query.offset){
        offset = parseInt(req.query.offset, 10);
    }

    if(req.query && req.query.count) {
        count = parseInt(req.query.count, 10);
    }


    if(isNaN(offset) || isNaN(count)){
        res
            .status(400)
            .json({
                "message" : "if supplied in query string count and offset should be numbers"
            });

        return;
    }

    if(count> maxCount){
        res
            .status(400)
            .json({
                "message" : "count limit 10"
            });
        return;

    }


    //get the connection with mongoose
    Hotel
        .find()
        .skip(offset)
        .limit(count)
        .exec(function(err, hotels){
            if(err){
                console.log("Error finding hotels");
                res
                    .status(500)
                    .json(err);
            }else {
                console.log("Found hotels", hotels.length);
                res.json(hotels);
            }
        });


    // collection
    //     .find()
    //     .skip(offset)
    //     .limit(count)
    //     .toArray(function (err, docs) {
    //         console.log("Found hotels",docs);
    //         res
    //             .status(200)
    //             .json(docs);
    //     });

};

module.exports.hotelsGetOne = function(req,res){
    // var db = dbconn.get();
    // var collection = db.collection('hotelinfo');



    var hotelId = req.params.hotelId;
    //var thisHotel = hotelData[hotelId];
    console.log("Get HotelId", hotelId);

    Hotel
        .findById(hotelId)
        .exec(function(err,doc){
            var response = {
              status : 200,
              message : doc
            };

            if(err){
                console.log("Error finding the hotel");
                response.status = 500;
                response.message= err;
            }else if(!doc){
                response.status = 404;
                response.message= {
                    "message" : "Hotel Id not found"
                };

            }
            res
                .status(response.status)
                .json(response.message);

        });


};


var _splitArray = function(input) {
    var output;
    if (input && input.length > 0) {
        output = input.split(";");
    } else {
        output = [];
    }
    return output;
};

module.exports.hotelsAddOne = function(req,res){

    Hotel
        .create({
            name : req.body.name,
            description : req.body.description,
            stars : parseInt(req.body.stars,10),
            services : _splitArray(req.body.services),
            photos : _splitArray(req.body.photos),
            currency : req.body.currency,
            location : {
                address : req.body.address,
                coordinates : [
                    parseFloat(req.body.lng),
                    parseFloat(req.body.lat)
                ]
            }

        }, function (err, hotel) {
            if(err){
                console.log("Error creating hotel");
                res
                    .status(400)
                    .json(err);
            }else{
                console.log("new Hotel added");
                res
                    .status(201)
                    .json(hotel);
            }
        });


    // var db = dbconn.get();
    // var collection = db.collection('hotelinfo');
    // var newHotel;
    //
    // console.log("POST new hotel");
    //
    // if(req.body && req.body.name && req.body.stars) {
    //     newHotel = req.body;
    //     newHotel.stars= parseInt(req.body.stars,10);
    //
    //     console.log(newHotel);
    //
    //     collection.insertOne(newHotel,function(err, response){
    //         console.log(response);
    //         console.log(response.ops);
    //         res
    //             .status(201)
    //             .json(response.ops);
    //     });
    // }else{
    //     res
    //         .status(400)
    //         .json({warniing:"Required data missing from body"});
    // }
};


module.exports.hotelsUpdateOne = function(req, res) {
    var hotelId = req.params.hotelId;

    console.log('GET hotelId', hotelId);

    Hotel
        .findById(hotelId)
        .select('-reviews -rooms')
        .exec(function(err, hotel) {
            if (err) {
                console.log("Error finding hotel");
                res
                    .status(500)
                    .json(err);
                return;
            } else if(!hotel) {
                console.log("HotelId not found in database", hotelId);
                res
                    .status(404)
                    .lson({
                        "message" : "Hotel ID not found " + hotelId
                    });
                return;
            }

            hotel.name = req.body.name||hotel.name;
            hotel.description = req.body.description||hotel.description;
            hotel.stars = parseInt(req.body.stars,10)||hotel.stars;
            hotel.services = _splitArray(req.body.services)||hotel.services;
            hotel.photos = _splitArray(req.body.photos)||hotel.photos;
            hotel.currency = req.body.currency||hotel.currency;
            hotel.location = {
                address : req.body.address||hotel.location.address,
                coordinates : [parseFloat(req.body.lng)||hotel.location.coordinates[0]
                    , parseFloat(req.body.lat)||hotel.location.coordinates[1]]
            };


            hotel
                .save(function(err, hotelUpdated) {
                    if(err) {
                        res
                            .status(500)
                            .json(err);
                    } else {
                        res
                            .status(204)
                            .json();
                    }
                });


        });

};


module.exports.hotelsDeleteOne = function(req, res) {
    var hotelId = req.params.hotelId;

    Hotel
        .findByIdAndRemove(hotelId)
        .exec(function(err, location) {
            if (err) {
                res
                    .status(404)
                    .json(err);
            } else {
                console.log("Hotel deleted, id:", hotelId);
                res
                    .status(204)
                    .json();
            }
        });
};