const express=require('express')
const router=express.Router();
const User= require('../models/usersdb.js');
const validate=require('../public/js/formsVal.js')
const mongoose=require('mongoose');
var db = mongoose.connection;
const bodyParser = require('body-parser');
const{check,validationResult}=require('express-validator');
const lodash=require('lodash');

const urlencodedParser=bodyParser.urlencoded({ extended: false });
let path=require('path');



router.get('/',function(req,res)
{
  // res.render("index",{user:((req.session.user===undefined)?"":req.session.user)});

    res.render("index",{user:('nad')});
});

module.exports=router;



router.post('/',urlencodedParser,[
  check('unam','Username must be 3+ characters long')
  .exists()
  .isLength({min:3})
  ,

  check('email','Email is not valid')
  .isEmail()
  .normalizeEmail(),
  
  check('number','Invalid phone number')
  .isMobilePhone(),

  check('psw','Invalid Password')
  .exists()
  .isLength({min:6}),

  check('confpsw','Invalid Password')
  .exists()
  .isLength({min:6})
  

] ,(request, response) =>  {
  console.log("entered");

  const errors=validationResult(request)
  if(!errors.isEmpty()){
      const alert=errors.array();
  }
  else if(request.body.psw!==request.body.confpsw)
     console.log("error");
 else{
    const userdetails = new User({
        Username: request.body.unam,
        Email: request.body.email,
        PhoneNumber: request.body.number,
        Password: request.body.psw,
        ConfPassword: request.body.confpsw,
        Type:request.body.type
      });
    
       userdetails.save()
       .then((result)=>{
         console.log('user added');
         response.redirect("/");
       });
       
 }
  });


  router.get('/AddActivity',function(req,res)
{
    res.render("AddActivity");
});


router.post('/login',urlencodedParser,[
  check('usename','Username is empty')
  .exists(),
  check('password','password is empty')
  .exists()
],(request,response)=>{
  const errors=validationResult(request)
  console.log("entered");
  var query={Username:request.body.username,Password:request.body.password};
  User.find(query)
  .then(result=>{
     request.session.user=result[0];
     response.redirect("/");
  });
 
    

});





router.post('/submit',(request, response) =>  {
  console.log("entered");
      console.log(request.body);
      console.log(request.body.file);


    const activitydetails = new Activity({
        Name:request.body.Aname,
        Type:request.body.Atype,
        Picture:request.body.file,
        BriefDes:request.body.Abrief,
        DetailedDes:request.body.Adetails,
        Plan:request.body.Aplan,
        CancelDet:request.body.Acancel,
        Duration:request.body.Atime,
        PickupDet:request.body.Apickup,
        AvailableDate:request.body.Dates
      });

      const file=request.files;
     const filepath= path.join(__dirname,'uploads',`${request.files}`);
/*
     file.mv(filepath,err => {
      if(err) return response.status(500).send(err);
      console.log("success");
     })
*/
    db.collection("activities").insertOne(activitydetails,(err,result)=>{
      if(err)
      {
       console.log(err);
      }
       console.log("saved");
       response.render("food");

    
  })
});