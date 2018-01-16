var express = require('express');
var router = express.Router();
var ctrlHotels = require('../controllers/controllers.js');
var  ctrlReviews = require('../controllers/reviews.controllers.js');
var ctrUsers = require('../controllers/users.controllers.js');

var path = require('path');


//hotels
router
    .route('/hotels')
    .get(ctrlHotels.hotelsGetAll)
    .post(ctrlHotels.hotelsAddOne);

router
    .route('/hotels/:hotelId')
    .get(ctrlHotels.hotelsGetOne)
    .put(ctrlHotels.hotelsUpdateOne)
    .delete(ctrlHotels.hotelsDeleteOne);



//reviews

router
    .route('/hotels/:hotelId/reviews/:reviewId')
    .get(ctrlReviews.reviewsGetOne)
    .put(ctrlReviews.reviewsUpdateOne)
    .delete(ctrlReviews.reviewsDeleteOne);

router
    .route('/hotels/:hotelId/reviews')
    .get(ctrlReviews.reviewsGetAll)
    .post(ctrlReviews.reviewsAddOne);


//Authentication
router
    .route('/users/register')
    .post(ctrUsers.register);

router
    .route('/users/login')
    .post(ctrUsers.login);

module.exports = router;