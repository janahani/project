const express=require('express')
const router=express.Router();

router.get('/',(req,res)=>{
    res.render("confirmPayment",{user: (!req.session.authenticated) ? "" : req.session.user})
})

module.exports=router;