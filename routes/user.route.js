let express = require('express'),
  multer = require('multer'),
  jwt = require('jsonwebtoken'),
  bcrypt = require('bcrypt'),
  verifyToken = require('../model/auth1');
let router = express.Router();
let userService = require('../model/user');
var nodemailer = require('nodemailer');
var uuid = require("uuid");
var jwtDecode = require('jwt-decode');

// Sending OTP to user email

var smtpTransport = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "sokoya.webnexus@gmail.com",
    pass: "sokoya@webnexus2019",
    expires: 600
  }
});

// USING MULTER FOR INSERTING FILES IN USER TABLE
var storage = multer.diskStorage({
  destination: function (request, file, callback) {
    callback(null, 'public/images');
  },
  filename: function (request, file, callback) {
    callback(null, uuid.v4() + path.extname(file.originalname))
  }
});

var upload = multer({ storage: storage }).single('image');
// var upload = multer({ storage: storage }).fields([{ name: "user_img" }, { name: "cert_img" }]);


//- - - - - - - - - - - - - - GET - ALL - DATA - FROM - USER - MODULE - - - - - - - - - - - - - - - - -
router.get('/get-user', (req, res) => {
  var legit = verifyToken.verify(req.headers.authorization);
  if (legit) {
    userService.getUser(req.body, (err, data, fields) => {
      if (!err) {
        res.json({ status: 200, success: true, message: 'Data retrieved', data });
      }
      else {
        res.json({ status: 200, success: false, message: 'Something went wrong.', error: err });
      }
    });
  }
  else {
    res.status(401).json({ status: 200, hassuccessed: false, message: 'Unauthorized Request' });
  }
});

//- - - - - - - - - - - - - - GET - DATA - FROM - USER - MODULE - BY - BLOOD GROUP - - - - - - - - - - - - - - - - -
router.get('/blood-all-group', (req, res) => {
  var legit = verifyToken.verify(req.headers.authorization);
  if (legit) {
    userService.getAllBlood({}, (err, data) => {
      if (err) {
        res.json({ status: 200, success: false, message: 'Something went wrong.', error: err });
      }
      else {
        res.json({ status: 200, success: true, message: 'Blood Group', data });
      }
    });
  }
  else {
    res.status(401).json({ status: 200, hassuccessed: false, message: 'Unauthorized Request' });
  }
});

//- - - - - - - - - - - - - - GET - DATA - FROM - USER - MODULE - BY - ID - - - - - - - - - - - - - - - - -
router.get('/get-user-by-id/:user_id', (req, res) => {
  var legit = verifyToken.verify(req.headers.authorization);
  if (legit) {
    userService.getUserById(req.body, req.params, (err, data) => {
      if (err) {
        res.json({ status: 200, success: false, message: 'Something went wrong.', error: err });
      } else {
        res.json({ status: 200, success: true, message: 'User is get Successfully', data});
        // console.log('Random number',randm)
      }
    });
  }
  else {
    res.status(401).json({ status: 200, success: false, message: 'Unauthorized Request' });
  }
});

//- - - - - - - - - - - - - - LOGIN - USER - BY - USER'S - MAIL - & - PASSWORD - - - - - - - - - - - - - - - - -
router.post('/login-user', (req, res) => {
  userService.getUserByEmail(req.body, (err, data) => {
    email = req.body.email;
    plaintext = req.body.password;
    if (err) {
      res.send({ error: err, "failed": "error ocurred" })
    }
    else {
      if (data.length > 0) {
        let hash = data[0].password
        user_id = data[0].user_id
        pwd = bcrypt.compareSync(plaintext, hash);
        if (pwd) {
          var token = jwt.sign({ expiresIn: '4h' , User: true, email, user_id }, 'shhhhh');
          res.json({ message: "Login Successful", success: true, httpOnly: true, secure: true, token});// res.cookie("SESSIONID", token, {httpOnly:true, secure:true});
        }
        else {
          res.json({message: "Email or password doesn't match", success: false, status: 200});
        }
      }
      else {
        res.json({message: "Email doesn't exist", success: false, status: 200});
      }
    }
  });
});

//- - - - - - - - - - - - - - INSERT - DATA - IN - USER - TABLE - - - - - - - - - - - - - -
// router.post('/create-user', (req, res) => {
//   var filename = '';
//   upload(req, res, function (err) {
//     if (err instanceof multer.MulterError)
//       res.json({ msg: "Unable to upload image" })
//     else if (err)
//       res.json({ msg: 'Something went wrong', error: err, success: false });
//     else {
//       // filename = res.req.file.filename;
//       // req.body.image = filename;  //for swagger change the body to query
//       password = req.body.password;
//       req.body.password = bcrypt.hashSync(password, 10);
//       userService.createUser(req.body, (data) => {
//         if (err) {
//           res.json({ status: 200, success: false, message: 'Something went wrong.', error: err });
//           console.log("The error = ", err, "UnPassed Data =",req.body);
//         }
//         else {
//           res.json({ status: 200, success: true, message: 'Registration Successfull'});
//         }
//       });
//     }
//   });
// });

router.post('/create-user', (req,res) => {
  password = req.body.password;
  req.body.password = bcrypt.hashSync(password, 10);
  userService.createUser(req.body, (err, data) => {
    if (err) {
          res.json({ status: 200, success: false, message: 'Something went wrong.', error: err });
          console.log("The error = ", err, "UnPassed Data =",req.body);
        }
        else {
          res.json({ status: 200, success: true, message: 'Registration Successfull'});
        }
  })
})

//- - - - - - - - - - - - - - UPDATE - DATA - OF - USER - MODULE - BY -ID - - - - - - - - - - - - - -
router.put('/update-user/:id', (req, res) => {
  var legit = verifyToken.verify(req.headers.authorization);
  if (legit) {
    password = req.body.password;
    req.body.password = bcrypt.hashSync(password, 10);
    console.log(req.body.password)
    userService.updateUser(req.body, req.params, (err, data) => {
      if (!err) {
        res.json({ status: 200, success: true, message: 'User is Updated Successfully', });
      }
      else {
        res.json({ status: 200, success: false, message: 'Something went wrong.', error: err });
      }
    });
  }
  else {
    res.status(401).json({ status: 200, hassuccessed: false, message: 'Unauthorized Request' });
  }
});

//- - - - - - - - - - - - - - REQUEST FOR OTP - - - - - - - - - - - - - -

//- - - - - - - - - - - - - - VERIFY OTP - - - - - - - - - - - - - -
router.post('/verify', (req, res) => {
  userService.getContact(req.body, (err, data) => {
    var otp = req.body.otp
    if (err) {
      res.json({ status: 200, success: false, message: 'Unable To Verify OTP.', error: err });
    }
    else {
      if (data.length > 0) {
        let veri = data[0].otp
        if (veri) {
          res.json({ status: 200, success: true, message: 'Request verified', data });
        }
      }
      else {
        res.json({ status: 200, message: "OTP doesn't match" })
      }
    }
  })
})

//- - - - - - - - - - - - - - DELETE - DATA - OF - USER- ROLE - MODULE - BY -ID - - - - - - - - - - - - - -
router.delete('/delete-user/:id', (req, res) => {
  var legit = verifyToken.verify(req.headers.authorization);
  if (legit) {
    userService.deleteUser(req.body, req.params, (err, data) => {
      if (!err) {
        res.json({ status: 200, success: true, message: 'User is Deleted Successfully', });
      }
      else {
        res.json({ status: 200, success: false, message: 'Something went wrong.', error: err });
      }
    });
  }
  else {
    res.status(401).json({ status: 200, hassuccessed: false, message: 'Unauthorized Request' });
  }
});

router.put('/forget-password', (req, res) => {
  email = req.body.email;
  password = req.body.password;
  req.body.password = bcrypt.hashSync(password, 10);
  userService.forgetPassword(req.body, (err, data) => {
    console.log('Parameterrr', req.body)
    if (err) {
      res.json({ status: 200, success: false, message: 'Error Occured', error: err });
    }
    else {
      res.json({ status: 200, success: true, message: "Password Updated", data });
    }
  })
});

//- - - - - - - - - - - - - -EXPORT - THIS - MODULES' ALL - FUNCTION - TO - MAIN - JS - FILE - - - - - - - - - - - - - -


module.exports = router;
