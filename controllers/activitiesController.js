const express = require('express')
const router = express.Router()
const Activity = require('../models/activity.schema.js');
const User = require('../models/usersdb.js');
const Cart = require('../models/cartdb.js');
const notifier = require('node-notifier');
const path = require('path');


const getActivities = async (req, res) => {
    const actPerPage = 4;
    var Activities = [];
    Activities = await Activity.find();
    var length = Math.ceil(Activities.length / actPerPage);

    if (req.session.authenticated) {
        await User.findById(req.session.user._id)
            .then(async result => {
                req.session.user = result;
                req.session.authenticated = true;
                console.log("session updated");
                res.render("activities", {
                    activities: (Activities === 'undefined' ? "" : Activities),
                    user: (!req.session.authenticated) ? "" : req.session.user, msg: "", length: length, page: 0, end: actPerPage - 1
                });
            })
    } else {
        res.render("activities", {
            activities: (Activities === 'undefined' ? "" : Activities),
            user: (!req.session.authenticated) ? "" : req.session.user, msg: "", length: length, page: 0, end: actPerPage - 1
        });
    }
    // res.render("activities", {
    //     activities: (Activities === 'undefined' ? "" : Activities),
    //     user: (!req.session.authenticated) ? "" : req.session.user, msg: "", length:length, page:0, end:actPerPage-1
    // });
}

const getActivityPage = async (req, res) => {
    var Activities = [];
    var url = req.params.id;
    const actPerPage = 4;
    Activities = await Activity.find();
    var length = Math.ceil(Activities.length / actPerPage);
    var now;
    var display;
    var end;
    if ((url - 1) != 0) {
        now = url - 1;
        display = actPerPage * now;
        if ((Activities.length % actPerPage) >= 1) {
            end = display + Activities.length % actPerPage;
        } else {
            end = display + Activities.length % actPerPage + (actPerPage - 1);
        }
    }
    else {
        now = 1;
        display = 0;
        end = actPerPage - 1;
    }

    if (req.session.authenticated) {
        await User.findById(req.session.user._id)
            .then(async result => {
                req.session.user = result;
                req.session.authenticated = true;
                console.log("session updated");
                res.render("activities", {
                    activities: (Activities === 'undefined' ? "" : Activities),
                    user: (!req.session.authenticated) ? "" : req.session.user, msg: "", length: length, page: display, end: end
                });
            })
    }
    else {
        res.render("activities", {
            activities: (Activities === 'undefined' ? "" : Activities),
            user: (!req.session.authenticated) ? "" : req.session.user, msg: "", length: length, page: display, end: end
        });
    }

}

const getActivity1 = async (req, res) => {
    var Activities = [];
    var url = req.params.name;
    Activities = await Activity.find({ "Name": url });
    res.render("activity1", {
        activity1: (Activities === 'undefined' ? "" : Activities),
        user: (!req.session.authenticated) ? "" : req.session.user, msg: "", revmsg: ""
    });
}

const postReview = async (req, res) => {
    var Activities = [];
    var query1 = req.params.name;
    const activity1 = await Activity.find().where("Name").equals(query1);
    Activities = Array.from(activity1);
    if (req.session.authenticated) {
        allrevs = Activities[0].Reviews;

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

        await Activity.findOneAndUpdate(filter, update)
            .then(async result => {
                Activities = await Activity.find().where("Name").equals(query1)
                    .then(result => {
                        res.render("activity1", {
                            activity1: (Activities === 'undefined' ? "" : Activities),
                            user: (!req.session.authenticated) ? "" : req.session.user, msg: "", revmsg: "", num: ""
                        });
                    })

            })
            .catch(err => {
                console.log("update failed\n" + err);
            })


    }
    else {
        Activities = await Activity.find().where("Name").equals(query1)
            .then(() => {
                res.render("activity1", {
                    activity1: (Activities === 'undefined' ? "" : Activities),
                    user: (!req.session.authenticated) ? "" : req.session.user, msg: "", revmsg: "You must sign in to add a review"
                    , num: ""
                });
            }).catch(err => {
                console.log(err);
            })
    }
}

const postActivityAvail = async (req, res) => {
    console.log("aentered");
    console.log(req.body.name2);
    console.log(req.body.num);
    console.log(req.body.days);
    var url = req.params.name;
    Activities = await Activity.find({ "Name": url });

    var name = req.body.name2;
    var num = req.body.num;
    var date = req.body.days;
    var X = [];
    const x = await Activity.find().where("Name").equals(name);

    X = Array.from(x);
    console.log(X);

    var found = "false";
    var found2 = "false";

    for (var s = 0; s < x[0].DatesDetails.length; s++) {
        var k = x[0].DatesDetails[s].date;
        console.log(k);

        if (date === k) {
            if (parseInt(num) + parseInt(x[0].DatesDetails[s].max) <= x[0].MaxParticipants) {
                var newnum = parseInt(x[0].DatesDetails[s].max) + parseInt(num);
                if (newnum <= x[0].MaxParticipants) {
                    found = "true";
                    number = s;
                }
            }
            else {
                found2 = "true";
            }
        }
    }

    if (found === "true" && (!req.session.authenticated)) {
        res.send("found")
    }
    else if (found === "true" && (req.session.authenticated)) {
        res.send("Available");
    }

    else if (found2 === "true") {
        res.send("Not Available");
    }

}

const addToWishlist = async (req, res) => {
    await User.findById(req.session.user._id)
        .then(async result => {
            await Activity.find({ "Name": req.body.Name })
                .then(async resu => {
                    var rating;
                    var sum=0;
                    resu[0].Reviews.forEach(rev=>{
                        sum += parseInt(rev.Rating);
                    })
                    rating = Math.floor((sum/resu[0].Reviews.length));
                    var actWish = {
                        ActID: resu[0]._id,
                        Name: resu[0].Name,
                        Type: resu[0].Type,
                        Picture: resu[0].Picture[0],
                        Header: resu[0].Header,
                        Rating: rating,
                    }
                    var activities = result.Wishlist.Activities;
                    var hotels = result.Wishlist.Hotels;
                    activities.push(actWish);
                    await User.findByIdAndUpdate(req.session.user._id, {
                        Wishlist: {
                            Hotels: hotels,
                            Activities: activities,
                        }

                    })
                        .then(async r => {
                            await Activity.find({ "Name": req.body.Name })
                                .then(async re => {
                                    await User.findById(req.session.user._id)
                                        .then((rr) => {
                                            console.log("activity added to wishlist");
                                            res.send('okay');
                                        })

                                })

                        })
                })
        })
}

const addToCart = async (req, res) => {
    console.log("add to activities cart");
    if (req.session.authenticated) {
        var activities = [];
        var p = (req.body.price * 1);
        var activ = {
            id: req.params.id,
            participants: req.body.participants,
            date: req.body.date,
            price: p
        }
        if (req.session.authenticated) {
            var query = { User: req.session.user._id };
            Cart.find(query)
                .then(async result => {
                    var crt = result[0];
                    if (crt) {
                        activities = result[0].Activities;
                        activities.push(activ);

                        await Cart.findByIdAndUpdate(result[0]._id, {
                            Activities: activities
                        })
                            .then(async result => {
                                let Act = [];
                                Act = await Activity.find();
                                res.render("activity1", {
                                    activity1: (Act === 'undefined' ? "" : Act),
                                    user: (!req.session.authenticated) ? "" : req.session.user, msg: "", revmsg: ""
                                });
                            })

                    }
                    else {
                        activities[0] = activ;
                        if (req.session.user) {
                            const cart = new Cart({
                                User: req.session.user._id,
                                Activities: activities,
                            });
                            cart.save()
                                .then(async result => {
                                    console.log("Activity added");
                                    let Act = [];
                                    Act = await Activity.find();
                                    res.render("activity1", {
                                        activity1: (Act === 'undefined' ? "" : Act),
                                        user: (!req.session.authenticated) ? "" : req.session.user, msg: "", revmsg: ""
                                    });
                                })
                        }
                    }
                })
        }
    }
    else {
        Act = await Activity.find();

        res.render("activity1", {
            activity1: (Act === 'undefined' ? "" : Act),
            user: (!req.session.authenticated) ? "" : req.session.user, msg: "", revmsg: ""
        });
        notifier.notify({
            title: 'Egy Tours',
            message: 'You must sign in to add your booking to cart',
            icon: path.join(__dirname, '/../public/images/homepage/logo.png'),
        });
    }
}

module.exports = { getActivities, getActivity1, postReview, postActivityAvail, addToCart, getActivityPage, addToWishlist };