var Pin        = require('../models/pin'),
    middleware = require('../middleware'),
    express    = require('express'),
    router     = express.Router();

// Configure multer and cloudinary
var multer = require('multer');
var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter})

var cloudinary = require('cloudinary');
cloudinary.config({ 
  cloud_name: process.env.CLOUD_NAME, 
  api_key: process.env.API_KEY, 
  api_secret: process.env.API_SECRET
});

// Render new pin form
router.get('/pin/new', middleware.isLoggedIn, function(req, res) {
   res.render('pin/new'); 
});

// Add new pin to database
router.post('/pin', middleware.isLoggedIn, upload.single('image'), function(req, res) {
    
    // Upload image
    cloudinary.uploader.upload(req.file.path, function(result) {
        var filepath = result.secure_url;
        var pinAuthor = req.user;
        var img_uid = result.public_id;
    
        var pin = {
            uid   : img_uid,
            image : filepath,
            author: pinAuthor
        }

        // Create pin to database
        Pin.create(pin, function(err, pin) {
           if(err) {
               return res.redirect('/pin/new');
           }
            req.user.pins.unshift(pin);
            req.user.save();
            res.redirect('/pins');
        });
    });
});

// Delete pin from database
router.delete('/pin/:id', middleware.isLoggedIn, function(req, res) {
   var pinId = req.params.id;
   Pin.findById(pinId, function(err, pin) {
      if(err) {
          return res.redirect('/');
      }
       if(pin.image !== undefined) {
           deleteFiles(pin.uid);
       }
   });
   Pin.findByIdAndRemove(pinId, function(err) {
      if(err) {
          return res.redirect('/');
      }
       res.redirect('/profile');
   });
});

// Delete image from cloudinary
function deleteFiles(image_uid) {
    cloudinary.uploader.destroy(image_uid, function(result) { 
    });
}

module.exports = router;