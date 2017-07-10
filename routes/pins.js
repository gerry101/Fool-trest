var Pin        = require('../models/pin'),
    middleware = require('../middleware'),
    config     = require('../config'),
    multerS3   = require("multer-s3"),
    aws        = require("aws-sdk"),
    express    = require('express'),
    multer     = require("multer"),
    router     = express.Router();

aws.config.update({
    secretAccessKey: config.aws_secret_access_key,
    accessKeyId: config.aws_access_key_id,
    region: 'us-east-2'
});

var s3 = new aws.S3();

var upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: config.s3_bucket_user,
        key: function (req, file, cb) {
            var fileExtension = file.originalname.split(".")[1];
            var path = "uploads/" + req.user.twitterId + Date.now() + "." + fileExtension;
            cb(null, path); 
        }
    })
});

router.get('/pin/new', middleware.isLoggedIn, function(req, res) {
   res.render('pin/new'); 
});

router.post('/pin', middleware.isLoggedIn, upload.array('image',1), function(req, res) {
    var filepath = undefined;

    if(req.files[0]) {
        filepath = req.files[0].key; 
    } 
    
    var pinAuthor = req.user;
    
    var pin = {
        image : filepath,
        author: pinAuthor
    }
    
    Pin.create(pin, function(err, pin) {
       if(err) {
           console.log('error');
           return res.redirect('/pin/new');
       }
        req.user.pins.unshift(pin);
        req.user.save();
        console.log(req.user);
        console.log(pin);
        res.redirect('/');
    });
});

router.delete('/pin/:id', middleware.isLoggedIn, function(req, res) {
   var pinId = req.params.id;
   Pin.findById(pinId, function(err, pin) {
      if(err) {
          console.log('error');
          return res.redirect('/');
      }
       if(pin.image !== undefined) {
           deleteFiles(pin.image);
       }
   });
   Pin.findByIdAndRemove(pinId, function(err) {
      if(err) {
          console.log('error');
          return res.redirect('/');
      }
       res.redirect('/profile');
   });
});

function deleteFiles(imagePath) {
    s3.deleteObjects({
        Bucket: config.s3_bucket_user,
        Delete: {
            Objects: [
                 { Key: imagePath },
            ]
        }
    }, function(err, data) {
    });
}

module.exports = router;