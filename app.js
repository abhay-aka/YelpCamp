if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
 }
// require('dotenv').config();

//mongodb+srv://abhay13901:<password>@cluster0.vknjs.mongodb.net/myFirstDatabase?retryWrites=true&w=majority
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError');

const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');

const userRoutes = require('./routes/users');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');

const mongoSanitize = require('express-mongo-sanitize');
const MongoDBStore = require('connect-mongodb-session')(session);

//const dbUrl = process.env.DB_URL

const dbUrl=process.env.DB_URL||'mongodb://localhost:27017/yelp-camp';
mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,       // to handle collection.ensureIndex is deprecated
})

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("database connected");
});

const app = express();

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

app.use(express.static(path.join(__dirname, ('public'))));
app.use(mongoSanitize());


const secret = process.env.SECRET || 'thisisasecret'
const store = new MongoDBStore({
    uri: dbUrl,
    secret,
    touchAfter: 24*60*60
})

store.on("error",function(e) {
    console.log("session store error",e);
})
const sessionConfig = {
    store,
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());        //use this after we already used session line 49
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser())    //storing the data in thes session
passport.deserializeUser(User.deserializeUser()) //all the methods are static method

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

// app.get('/fakeUser', async (req, res) => {
//     const user = new User({
//         email: 'abhay@gmail.com',
//         username: 'abhay',
//     });
//     const newUser = await User.register(user, 'monkey');
//     res.send(newUser);

// })

app.use('/', userRoutes)
app.use('/campgrounds', campgroundRoutes)
app.use('/campgrounds/:id/reviews', reviewRoutes);


app.get('/', (req, res) => {
    res.render('home');
});


app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something went wrong!!';
    res.status(statusCode).render('error', { err });
})

app.listen(3000, () => {
    console.log("serving on port 3000!");
});