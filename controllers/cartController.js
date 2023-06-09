const Cart = require('../models/cartdb.js');
const Hotel = require('../models/hotel.schema.js');
const Activity = require('../models/activity.schema.js');

const viewCart = async function (req, res) {
  var cart;
  var hotels = [];
  var activities = [];
  var length;
  var counter = 0;
  var cont = false;
  if (req.session.authenticated) {    //user signed in
    console.log("authenticated")
    const promise1 = new Promise(async (resolve, reject) => {

      await Cart.find().where("User").equals(req.session.user._id)  //user has items in cart
        .then(result => {

          if (result.length !== 0) {
            cart = result[0];
            length = cart.Hotels.length + cart.Activities.length;
            cont = true;
          }
          if (result.length > 0) {
            resolve(
              cart.Hotels.forEach(async hotel => {

                await Hotel.find().where("_id").equals(hotel.id)
                  .then(resu => {
                    if (resu.length > 0) {
                      console.log("hotel added");
                      hotels.push(resu[0]);
                      counter++;

                      if (activities != "") {
                        res.render("cart", {
                          user: (!req.session.authenticated) ? "" : req.session.user,
                          cart: cart, hotels: hotels, activities: activities
                        });  //if promise.then is executed first
                      }

                      if (cart.Activities.length === 0 && counter === length) {   //don't go to promise1.then if no activities added in cart
                        res.render("cart", {
                          user: (!req.session.authenticated) ? "" : req.session.user,
                          cart: cart, hotels: hotels, activities: activities
                        });
                      }
                    }
                  })
                  .catch(err => {
                    console.log(err);
                  })
              })

            )
          }
          else {
            resolve();   //cart.hotels is empty,complete promise1.then to see if cart.activities avail
          }
        })
        .catch(err => {
          console.log(err);
        })

    })

    promise1.then(() => {
      if (cont) {
        cart.Activities.forEach(async activity => {
          await Activity.find().where("_id").equals(activity.id)
            .then(resul => {
              if (resul.length > 0) {
                console.log("activity added");
                activities.push(resul[0]);
                counter++;
                if (counter === length) {    //every item in cart is added to its array, ready to display cart
                  res.render("cart", {
                    user: (!req.session.authenticated) ? "" : req.session.user,
                    cart: cart, hotels: hotels, activities: activities
                  });
                }
              }
            })
            .catch(err => {
              console.log(err);
            })
        })
      }
      else {
        res.render("cart", {     //user's cart is empty
          user: (!req.session.authenticated) ? "" : req.session.user,
          cart: "", hotels: "", activities: ""
        })
      }
    })
  }
  else {
    res.render("cart", {     //user not signed in
      user: (!req.session.authenticated) ? "" : req.session.user,
      cart: "", hotels: "", activities: ""
    })
  }
}

const removeFromCart = async (req, res) => {
  
  var hotels = [];
  var activities = [];
  var cart;
  var item = "";

  await Cart.find().where("User").equals(req.session.user._id)
    .then(async (result) => {
      if (result.length > 0) {
        cart = result[0];

        for (var j = 0; j < cart.Hotels.length; j++) {  //if removed booking is an hotel
          if (req.params.id - 1 != j) {
            hotels.push(cart.Hotels[j]);
          }
          else {
            item = "hotel"
            price = cart.Hotels[j].price;
          }
        }
        if (item == "hotel") {
          activities=cart.Activities;
          await Cart.findOneAndUpdate({ User: req.session.user._id }, { Hotels: hotels }, {
            new: true
          })
            .then(async () => {
             
                if (hotels.length === 0 && activities.length === 0) {
                  console.log("Entered")
                  await Cart.findByIdAndDelete(cart._id)
                    .then(() => {
                      console.log("delete hotel 0");
                      res.redirect('back')
                    });
                }
                else {
                  console.log("delete hotel");
                  res.redirect('back')
                }
              
            })
        }

        for (var k = 0; k < cart.Activities.length; k++) {
          if (req.params.id - cart.Hotels.length - 1 != k) {
            activities.push(cart.Activities[k]);
          }
          else {
            console.log("don't add");
            item = "activity";
            price = cart.Activities[k].price;
          }
        }

        if (item === "activity") {
           hotels=cart.Hotels;
          await Cart.findOneAndUpdate({ User: req.session.user._id }, { Activities: activities }, {
            new: true
          })
            .then(async () => {
        
              if (hotels.length === 0 && activities.length === 0) {
                console.log("Entered")
                await Cart.findByIdAndDelete(cart._id)
                  .then(() => {
                    console.log("delete activity 0");
                    res.redirect('back')
                  });
              }
              else {
                console.log("delete activity");
                res.redirect('back')
              }

            })
        }
      }
    })

}

const clearCart = async (req, res) => {
  console.log("entered");
  await Cart.findOneAndDelete().where("User").equals(req.session.user._id)
    .then(() => {
      res.render("cart", {
        user: (!req.session.authenticated) ? "" : req.session.user,
        cart: "", hotels: "", activities: ""
      })
    })
    .catch(err => {
      console.log(err);
    })
}

module.exports = { viewCart, removeFromCart, clearCart };