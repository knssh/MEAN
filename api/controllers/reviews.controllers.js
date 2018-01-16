var mongoose = require('mongoose');
var Hotel = mongoose.model('Hotelinfo');


module.exports.reviewsGetAll =  function(req,res){


    var hotelId = req.params.hotelId;
    console.log("Get HotelId", hotelId);


    Hotel
        .findById(hotelId)
        .select('reviews')
        .exec(function(err,doc){
            //console.log("Returned doc", doc);
            if(!doc){
                res
                    .status(404)
                    .json({
                        "message":"No such hotel"
                    });
                return;
            }

            var response = {
                status : 200,
                message : doc.reviews
            };
            if(err){
                response.status = 500;
                response.message = err;
            }else if(!doc.reviews){
                response.status = 404;
                response.message = {
                    "message" : "No reviews found"
                };

            }
            res
                .status(response.status)
                .json(response.message);
        });
};

module.exports.reviewsGetOne =  function(req,res){

    var hotelId = req.params.hotelId;
    var reviewId = req.params.reviewId;
    console.log("Get HotelId"+ hotelId+"reviewsId: "+ reviewId);


    Hotel
        .findById(hotelId)
        .select('reviews')
        .exec(function(err,hotel){
            if(!hotel){
                res
                    .status(404)
                    .json({
                        "message":"No such hotel"
                    });
                return;
            }

            var review = hotel.reviews.id(reviewId);

            console.log("Returned doc", hotel);
            var response = {
                status : 200,
                message : review
            };
            if(err){
                response.status = 500;
                response.message = err;
            }else if(!review){
                response.status = 404;
                response.message = {
                    "message" : "No review found"
                };
            }


            res
                .status(response.status)
                .json(response.message);
        });

};


var _addReview = function (req, res, hotel) {

    console.log("req body is:",req.body);
    hotel.reviews.push({
        name : req.body.name,
        rating : parseInt(req.body.rating, 10),
        review : req.body.review
    });


    hotel.save(function(err, hotelUpdated) {
        console.log("addreview",hotelUpdated);
        if (err) {
            res
                .status(500)
                .json(err);
        } else {
            res
                .status(200)
                .json(hotelUpdated.reviews[hotelUpdated.reviews.length - 1]);
        }
    });

};

module.exports.reviewsAddOne = function(req, res){

    var id = req.params.hotelId;

    console.log('POST review to hotelId', id);

    Hotel
        .findById(id)
        .select('reviews')
        .exec(function(err, doc) {
            var response = {
                status : 200,
                message : doc
            };
            if (err) {
                console.log("Error finding hotel");
                response.status = 500;
                response.message = err;
            } else if(!doc) {
                console.log("HotelId not found in database", id);
                response.status = 404;
                response.message = {
                    "message" : "Hotel ID not found " + id
                };
            }

            if (doc) {
                //console.log("addreview",doc);
                _addReview(req, res, doc);
            } else {
                res
                    .status(response.status)
                    .json(response.message);
            }
        });

};

module.exports.reviewsUpdateOne = function(req, res) {
    var hotelId = req.params.hotelId;
    var reviewId = req.params.reviewId;
    console.log('PUT reviewId ' + reviewId + ' for hotelId ' + hotelId);

    Hotel
        .findById(hotelId)
        .select('reviews')
        .exec(function(err, hotel) {
            var thisReview;
            var response = {
                status : 200,
                message : {}
            };
            if (err) {
                console.log("Error finding hotel");
                response.status = 500;
                response.message = err;
            } else if(!hotel) {
                console.log("Hotel id not found in database", id);
                response.status = 404;
                response.message = {
                    "message" : "Hotel ID not found " + id
                };
            } else {
                // Get the review
                thisReview = hotel.reviews.id(reviewId);
                // If the review doesn't exist Mongoose returns null
                if (!thisReview) {
                    response.status = 404;
                    response.message = {
                        "message" : "Review ID not found " + reviewId
                    };
                }
            }
            if (response.status !== 200) {
                res
                    .status(response.status)
                    .json(response.message);
            } else {
                thisReview.name = req.body.name||thisReview.name;
                thisReview.rating = parseInt(req.body.rating, 10)||thisReview.rating;
                thisReview.review = req.body.review||thisReview.review;
                hotel.save(function(err, hotelUpdated) {
                    if (err) {
                        res
                            .status(500)
                            .json(err);
                    } else {
                        res
                            .status(204)
                            .json();
                    }
                });
            }
        });

};


module.exports.reviewsDeleteOne = function(req,res){
    var hotelId = req.params.hotelId;
    var reviewId = req.params.reviewId;
    console.log('PUT reviewId ' + reviewId + ' for hotelId ' + hotelId);

    Hotel
        .findById(hotelId)
        .select('reviews')
        .exec(function(err, hotel) {
            var thisReview;
            var response = {
                status : 200,
                message : {}
            };
            if (err) {
                console.log("Error finding hotel");
                response.status = 500;
                response.message = err;
            } else if(!hotel) {
                console.log("Hotel id not found in database", id);
                response.status = 404;
                response.message = {
                    "message" : "Hotel ID not found " + id
                };
            } else {
                // Get the review
                thisReview = hotel.reviews.id(reviewId);
                // If the review doesn't exist Mongoose returns null
                if (!thisReview) {
                    response.status = 404;
                    response.message = {
                        "message" : "Review ID not found " + reviewId
                    };
                }
            }
            if (response.status !== 200) {
                res
                    .status(response.status)
                    .json(response.message);
            } else {
                //hotel.reviews.id(reviewId).remove();
                thisReview.remove();
                hotel.save(function(err, hotelUpdated) {
                    if (err) {
                        res
                            .status(500)
                            .json(err);
                    } else {
                        res
                            .status(204)
                            .json();
                    }
                });
            }
        });
};