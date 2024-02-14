const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const mongoose = require ('mongoose')
const session = require('express-session')
const hbs = require ('express-handlebars')
const fileUpload = require('express-fileupload')
require('dotenv').config()
const UserRouter = require('./Router/UserRouter.js')
const adminRouter =require('./Router/AdminRouter.js')

const app = express(); 

// view engine 
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');   

app.engine('hbs', hbs.engine({
  extname: 'hbs',
  defaultLayout: 'layout',
  layoutsDir: __dirname + '/views/layout/',
  partialsDir: __dirname + '/views/partials/'
}))

// middleware   
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  name : 'codeil', 
  secret : 'something',   
  resave :true,
  saveUninitialized: true,
  cookie : {
    maxAge:(1000 * 60 * 100)
  }
}));
app.use(fileUpload())
app.use('/', UserRouter);
app.use('/admi', adminRouter)

// mongdb connections
mongoose.connect(process.env.MONGO,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }
  ).then(()=>{
    console.log("DB connected");
})

app.listen(process.env.PORT,()=>{
    console.log(`Server Running On Port ${process.env.PORT}`);
}) 