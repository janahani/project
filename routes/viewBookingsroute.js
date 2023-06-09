const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
router.use(bodyParser.json());
const fileUpload = require('express-fileupload');
const {viewBookings}=require('../controllers/viewBookingsController.js');

router.use(fileUpload());

router.use((req, res, next) => {
    if (req.session.user !== undefined && req.session.user.Type === 'admin') {
      next();
    }
    else {
      res.render('err', { err: 'You are not an Admin', user: (!req.session.authenticated) ? "" : req.session.user })
    }
  });
 router.get('/',viewBookings);



module.exports = router;