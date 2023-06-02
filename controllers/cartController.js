const Cart = require('../models/cartdb.js');
const Hotel = require('../models/hotel.schema.js');
const Activity = require('../models/activity.schema.js');

const viewCart = async function (req, res) {
  var empty=false;
  let cart;
  let hotels = [];
  let activities=[];
  var length;
  var counter = 0;
  if (req.session.authenticated) {    //user signed in
    console.log("authenticated")
    const promise1=new Promise(async (resolve,reject)=>{
      resolve(
        await Cart.find().where("User").equals(req.session.user._id)  //user has items in cart
        .then(result => {
          if(result.length>1){
          hasItems=true;
          cart = result[0];
           length = cart.Hotels.length+cart.Activities.length;
          cart.Hotels.forEach(async hotel => {
  
            await Hotel.find().where("_id").equals(hotel.id)
              .then(resu => {
                if (resu.length > 0) {
                  console.log("hotel added");
                  hotels.push(resu[0]);
                  counter++;
                }
              })
              .catch(err=>{
                console.log(err);
              })
          })
          }
        })
        // .catch(err => {    user signed in but doesn't have items in cart
        //    empty=true;
        // })    
      )
      reject(
          //user not signed in
          res.render("cart", {
            user: (!req.session.authenticated) ? "" : req.session.user,
            cart: "", hotels: "",activities:""
          })
    
      )
     
       
      
    })

    promise1.then(()=>{
      
        cart.Activities.forEach(async activity=>{
          await Activity.find().where("_id").equals(activity.id)  
          .then(resul => {
            if (resul.length > 0) {
              console.log("activity added");
              activities.push(resul[0]);
              counter++;
              if (counter === length) {
                console.log("hotels:")
                console.log(hotels);
                res.render("cart", {
                  user: (!req.session.authenticated) ? "" : req.session.user,
                  cart: cart, hotels: hotels,activities:activities
                });
              }
            }
          })
          .catch(err=>{
            console.log(err);
          })
        })
    })
  } 
  else{
    res.render("cart", {
      user: (!req.session.authenticated) ? "" : req.session.user,
      cart: "", hotels: "",activities:""
    })
  }    
}

module.exports = { viewCart };