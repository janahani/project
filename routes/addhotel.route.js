const express = require('express')
const router = express.Router()
const Hotel = require('../models/hotel.schema.js');
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');
router.use(bodyParser.json());
const {getAddHotel,addHotel,validateHotel} = require('../controllers/addhotel.controller.js')

router.use((req, res, next) => {
  if (req.session.user !== undefined && req.session.user.Type === 'admin') {
    next();
  }
  else {
    res.render('err', { err: 'You are not an Admin', user: (!req.session.authenticated) ? "" : req.session.user })
  }
});

router.use(fileUpload());


router.get('/', getAddHotel);

router.post('/',validateHotel(),addHotel);
module.exports = router;