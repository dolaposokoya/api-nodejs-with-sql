let express = require('express');
let verifyToken = require('../model/auth1');
let router = express.Router();
let donateService = require('../model/donate');
var nodemailer = require('nodemailer');
config = require('../DB');

 // Email Transport //
var smtpTransport = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "sokoya.webnexus@gmail.com",
        pass: "sokoya@webnexus2019",
        // expires: 600
    },
    tls: {
        rejectUnauthorized: false
    }     //To remove the TLS error from occuring
});

var mailOptions, host, link;

router.post('/donating-blood', (req, res) => {
    var legit = verifyToken.verify(req.headers.authorization);
    if(legit) {
        donateService.insertDonate(req.body, legit.user_id,(err, data) => {
            console.log('Request.body',req.body);
            if(err) {
                res.json({status: 200, success: false, message: "Something went Wrong", error: err});
                console.log("The error = ", err);
            }
            else {
                config.getDB().query(`update donation set user_id = '${legit.user_id}' where '${data.insertId}' = donate_id`);
                res.json({ status: 200, success: true, message: "A reservation has been made", data});
                email = legit.email;

                //Formating Date to DD:MM:YYYY
                date = req.body.date;
                var dat = new Date(date);
                var options = { weekday:"long", year: "numeric", month: "short",
                day: "numeric" };
                emailDate = dat.toLocaleDateString("en-US", options);
                host = req.get('host');
                link = "http://" + req.get('host') + "/verify";
                mailOptions = {
                    from: "Bloodbank Administrator",
                    to: email,
                    // expires: 600,
                    subject: "Blood Donation", // Subject line
                    text: "You have made reservation to donate blood on " + emailDate + " make sure you eat before coming, also there will be a reward. Thanks & Regards",
                }

                smtpTransport.sendMail(mailOptions, function (error, info) {
                    if (error) {
                        console.log('err :', error);
                    }
                    else {
                        console.log('Email sent: ' + info.response);
                    }
                });
            }
        });
    }
    else {
        res.status(401).json({message: "Unauthorized Access, Access Denied", status: 200, success: false});
    }
});


module.exports = router;
