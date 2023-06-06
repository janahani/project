const express=require('express')
const router=express.Router();
const wishlistController=require('../controllers/wishlistController.js')


router.get('/', wishlistController.viewFavs);
router.get('/:id',wishlistController.removeFromFavs)
router.get('/clearFavs',wishlistController.clearFavs)

module.exports=router;