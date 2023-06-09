const express = require('express')
const router = express.Router()
const Hotel = require('../models/hotel.schema.js');
const Cart = require('../models/cartdb.js');
const moment = require('moment');
const User = require('../models/usersdb.js');

const getHotels = async (req, res) => {
    const page =req.query.p || 0;
    const actPerPage =3 ;
     
    var Hotels = [];
    Hotels = await Hotel.find();
    var Hotels1 = [];
    Hotels1 = await Hotel.find();
    var length=Math.ceil(Hotels1.length/actPerPage);
    if(req.session.authenticated){
        await User.findById(req.session.user._id)
        .then(async result =>{
            req.session.user = result;
            req.session.authenticated = true;
            console.log("session updated");
            res.render("hotels", {
                hotels: (Hotels === 'undefined' ? "" : Hotels),
                user: (!req.session.authenticated) ? "" : req.session.user, msg: "", length:length, page:0, end:actPerPage-1,
                wish:undefined,
            });
        })  
    }else{
        res.render("hotels", {
            hotels: (Hotels === 'undefined' ? "" : Hotels),
            user: (!req.session.authenticated) ? "" : req.session.user, msg: "", length:length, page:0, end:actPerPage-1,wish:undefined,
        });
    }
    
    
}

const getHotelPage = async (req, res) => {
    var Hotels = [];
    var url = req.params.id;
    const actPerPage =3;
    Hotels = await Hotel.find();
    var Hotels1 = [];
    Hotels1 = await Hotel.find();
    var length=Math.ceil(Hotels1.length/actPerPage);
    var now; 
    var display;
    var end;
    if((url-1)!=0){
        now = url-1;
        display = actPerPage*now;
        if((Hotels1.length%actPerPage)>=1){
            end = display + Hotels1.length%actPerPage+1;
        }else{
            end = display + (Hotels1.length%actPerPage)+(actPerPage-1);
        }
    }
    else{
        now = 1;
        display = 0;
        end = actPerPage-1;
    }

    if(req.session.authenticated){
        await User.findById(req.session.user._id)
        .then(async result =>{
            req.session.user = result;
            req.session.authenticated = true;
            console.log("session updated");
            res.render("hotels", {
                hotels: (Hotels === 'undefined' ? "" : Hotels),
                user: (!req.session.authenticated) ? "" : req.session.user, msg: "", length:length, page:display, end:end,wish:undefined,});
        }) 
    }
    else{
        res.render("hotels", {
            hotels: (Hotels === 'undefined' ? "" : Hotels),
            user: (!req.session.authenticated) ? "" : req.session.user, msg: "", length:length, page:display, end:end,wish:undefined,});
    }
    
}


const getHotel1 = async (req, res) => {
    var Hotels = [];
    var url = req.params.name;
    Hotels = await Hotel.find({ "Name": url });
    res.render("hotel1", { hotel1: (Hotels === 'undefined' ? "" : Hotels), user: (!req.session.authenticated) ? "" : req.session.user, msg: "" });
}

const postHotelAvail = async (req, res) => {
    var adults=req.body.adults;
    var children=req.body.children;
    var rooms=req.body.rooms;
    var roomType=req.body.roomType;
    var hotel;
    var ad,ch;
    var price;
    var days;

    var date1 = moment(req.body.checkIn);
    var date2 = moment(req.body.checkOut);
    if (date1.isValid() && date2.isValid()) {
        days = date2.diff(date1, 'days')
    }

     await Hotel.find().where("Name").equals(req.body.name)
    .then(result=>{
        if(result.length>0){

              hotel=result[0];
              var found = "false";
              var found2 = "false";
              var roomsLeft;


              console.log(roomType);
          
              for(var i=0;i<hotel.RoomTypes.length;i++){
                  if(hotel.RoomTypes[i].Name === roomType){
                     console.log("enetered");
                      roomsLeft=parseInt(hotel.RoomTypes[i].Rooms)-parseInt(hotel.RoomTypes[i].RoomsBooked);
                      console.log(roomsLeft);
          
                      if(hotel.RoomTypes[i].RoomsBooked<hotel.RoomTypes[i].Rooms  && rooms<=roomsLeft){
                          if(adults<=hotel.RoomTypes[i].Capacity.Adults && 
                              children<=hotel.RoomTypes[i].Capacity.Children){
                                hotel.RoomTypes.forEach((room) => {
                                    if (room.Name ===roomType) {
                                        price = room.Price * rooms * days;
                                    }
                                })
                              found = "true";
                          }
                          else{
                            unavail="people"
                            ad=hotel.RoomTypes[i].Capacity.Adults;
                            ch=hotel.RoomTypes[i].Capacity.Children;
                            found2="true"
                          }
                      }
                      else{
                          unavail="rooms"
                          found2="true";
                      }
                  }
              }
          
               
              if(!req.session.authenticated && found==="true"){
                 res.send({msg:"found",price:price});
              }
          
              else if (found === "true") {
                
                  console.log("found");
                  console.log(price);
                  res.send({msg:"Available",price:price});
              }
          
              else if (found2 === "true") {
                  console.log("found2");
                  if(unavail="people"){
                  res.send({msg:"Not Available",unavail:"people",adults:ad,children:ch});
                  }
                  else{
                    res.send({msg:"Not Available",unavail:"rooms"})
                  }
              }

        }

    })

   

}

const addToWishlist = async (req,res)=>{
    await User.findById(req.session.user._id)
        .then(async result => {
            await Hotel.find({ "Name": req.body.Name })
                .then(async resu => {
                    var rating;
                    var sum=0;
                    resu[0].Reviews.forEach(rev=>{
                        sum += parseInt(rev.Rating);
                    })
                    rating = Math.floor((sum/resu[0].Reviews.length));
                    var hotelWish = {
                        HotelID: resu[0]._id,
                        Name: resu[0].Name,
                        Picture: resu[0].Picture[0],
                        Location: resu[0].Location,
                        Caption: resu[0].About.substring(0,100),
                        Rating: rating,
                    }
                    var hotels = result.Wishlist.Hotels;
                    var acts = result.Wishlist.Activities;
                    hotels.push(hotelWish);
                    await User.findByIdAndUpdate(req.session.user._id, {
                        Wishlist: {
                            Hotels: hotels,
                            Activities: acts,
                        }

                    })
                        .then(async r => {
                            await Hotel.find({"Name": req.body.HotelName})
                            .then(async re=>{
                                await User.findById(req.session.user._id)
                                .then((rr)=>{
                                    console.log("hotel added to wishlist");
                                    res.send('okay');
                                })
                                
                            })
                            
                        })
                })
        })
}


const addToCart = async (req, res) => {
    console.log('Entered')
    let days;
    let price;
    var date1 = moment(req.body.checkIn);
    var date2 = moment(req.body.checkOut);
    if (date1.isValid() && date2.isValid()) {
        days = date2.diff(date1, 'days')
    }

    var hotel = await Hotel.find().where("_id").equals(req.params.id)
        .then(result => {
            hotel = result[0];
            console.log(hotel);
            hotel.RoomTypes.forEach((room) => {
                if (room.Name === req.body.roomType) {
                    price = room.Price * req.body.rooms * days;
                }
            })
        })


    var hotels = [];

    var Hotell = {
        id: req.params.id,
        checkIn: req.body.checkIn,
        checkOut: req.body.checkOut,
        days: days,
        children: req.body.children,
        adults: req.body.adults,
        rooms: req.body.rooms,
        roomType: req.body.roomType,
        price: price,
        days: days,
    }
    if (req.session.authenticated) {
        var query = { User: req.session.user._id };
        Cart.find(query)
            .then(async result => {
                var crt = result[0];
                if (crt) {
                    hotels = result[0].Hotels;
                    hotels.push(Hotell);

                    await Cart.findByIdAndUpdate(result[0]._id, {
                        Hotels: hotels
                    })
                        .then(result => {
                            res.redirect('back');
                        })

                }
                else {
                    hotels[0] = Hotell;
                    if (req.session.user) {
                        const cart = new Cart({
                            User: req.session.user._id,
                            Hotels: hotels,
                        });
                        cart.save()
                            .then(result => {
                                console.log("Hotel added");
                                res.redirect('back')
                            })
                    }
                }
            })

    }



}

const postReview = async (req, res) => {
    var Hotels = [];
    var query1 = req.body.hotel;
    const hotel1 = await Hotel.find().where("Name").equals(query1);
    Hotels = Array.from(hotel1);
    if (req.session.authenticated) {
        allrevs = Hotels[0].Reviews;

        const nowdate = new Date().toLocaleString('en-GB', {
            hour12: false,
        });
        var newrev = {
            Username: req.session.user.Username,
            Rating: req.body.rating,
            Comment: req.body.comment,
            Date: nowdate,
        }

        allrevs.push(newrev);

        const filter = { Name: query1 };
        const update = { Reviews: allrevs };

        await Hotel.findOneAndUpdate(filter, update)
            .then(async result => {
                Hotels = await Hotel.find().where("Name").equals(query1)
                    .then(result => {
                        res.render("hotel1", {
                            hotel1: (Hotels === 'undefined' ? "" : Hotels),
                            user: (!req.session.authenticated) ? "" : req.session.user, msg: ""
                        });
                    })

            })
            .catch(err => {
                console.log("update failed\n" + err);
            })


    }
    else {
        Hotels = await Hotel.find().where("Name").equals(query1)
            .then(() => {
                res.render("hotel1", {
                    hotel1: (Hotels === 'undefined' ? "" : Hotels),
                    user: (!req.session.authenticated) ? "" : req.session.user, msg: "You must sign in to add a review"
                });
            }).catch(err => {
                console.log(err);
            })
    }
}

module.exports = { getHotels,getHotelPage, getHotel1, addToCart, postReview , postHotelAvail,addToWishlist};