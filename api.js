const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const imagemin = require('imagemin');
const imageminWebp = require('imagemin-webp');
const multer = require("multer");
const fs = require("fs");
require('hbs');



 
imagemin(['input/*.{jpg,png,jpeg}'], 'build/images', {
    use: [
        imageminWebp({quality: 100})
    ]
}).then((data) => {
    console.log(data[0].data.toString('utf8'));
    console.log('Images optimized');
});


const app = express();

// basic setup 
app.set('view engine', "hbs");
app.use(cors());
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());

//port 
const port = process.env.PORT || 3000;


function genToken(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
 }


let storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, './uploads')
    },
    filename: (req, file, cb) => {
      cb(null, req.cookies.token + ".jpeg")
    }
});

let upload = multer({storage: storage});



app.get("/", (request, response) => {
    let token = genToken(12);
    response.cookie("token", token)
    response.render("index.hbs")
})


app.post('/upload', upload.single('image'), (req, res, next) => {
    imagemin([`./uploads/${req.cookies.token}.{jpg,png,jpeg}`], 'build/images', {
        use: [
            imageminWebp({quality: 100})
        ]
    }).then((data) => {
        res.download(`./build/images/${req.cookies.token}.webp`, () => {
            fs.unlinkSync(`./build/images/${req.cookies.token}.webp`)
            fs.unlinkSync(`./uploads/${req.cookies.token}.jpeg`)
        })

    }).catch( err => {
        res.send("It's an error!!")
    });
    
});
 


// script to run the server
app.listen(port, () => {
    console.log(`Server is up at ${port}`);
} )
