let express = require('express'),
    multer = require('multer'),
    jwt = require('jsonwebtoken'),
    bcrypt = require('bcrypt'),
    verifyToken = require('../model/auth1');
let router = express.Router();
let requestService = require('../model/request');
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

router.post('/create-request', (req, res) => {
    var legit = verifyToken.verify(req.headers.authorization);
    if (legit) {
        requestService.createRequest(req.body, legit.user_id,(err, data) => {
            if (err) {
                res.json({message: 'Unable to make request', error: err, success: false, status: 200});
                console.log(err);
            }
            else {

                config.getDB().query(`INSERT INTO bank(request_id, user_id ) VALUES ('${data.insertId}','${legit.user_id}')`);
                res.json({message: "We will get back to you when your request is met check your mail for further instruction", success: true, status: 200});
                email = legit.email;
                blood = req.body.blood;

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
                    subject: "Blood Request", // Subject line
                    text: "You have made a request for blood type " + blood + " needed on "+ emailDate + " we will get back to you always check your email. Thanks & Regards",
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
        })
    }
    else {
        res.status(401).json({message: 'Unauthorized Request'})
    }
});

router.get('/get-request-by-id/:request_id', (req, res) => {
    var legit = verifyToken.verify(req.headers.authorization)
    if(legit){
    	requestService.getRequestById(req.body, req.params,(err, data) => {
    		if(err){
    			res.json({message: 'Unable to get request try again after sometime', status: 200, success: false})
    		}
    		else {
    			res.json({message: 'Request Retrieved', status: 200, success: true, data})
    		}
    	})
    }
    else {
    	res.status(401).json({message: 'Unauthorized Request', status: 200, success: false})
    }
});

router.put('/update-request-by-id/:request_id', (req, res) => {
    var legit = verifyToken.verify(req.headers.authorization)
    if(legit){
    	requestService.updateRequest(req.body, req.params,(err, data) => {
    		if(err){
    			res.json({message: 'Unable to update request try again after sometime', status: 200, success: false})
    		}
    		else {
    			res.json({message: 'Request Updated', status: 200, success: true})
    		}
    	})
    }
    else {
    	res.status(401).json({message: 'Unauthorized Request', status: 200, success: false})
    }
})

module.exports = router;
