const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelper');
const Campground = require('../models/campground');


mongoose.connect('mongodb://localhost:27017/yelp-camp');

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("database connected");
});


const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 300; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        //console.log(random1000);
        const cost = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            author: '625bfc7eaa5897a4f42427c2',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            geometry: {
                type: "Point",
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude
                ]
            },
            images: [
                {
                    url: 'https://res.cloudinary.com/dqvkcphnr/image/upload/v1650399328/YelpCamp/eiv77oy9od5ppjc0imrh.jpg',
                    filename: 'YelpCamp/eiv77oy9od5ppjc0imrh',

                },
                {
                    url: 'https://res.cloudinary.com/dqvkcphnr/image/upload/v1650399335/YelpCamp/noqgglxipf50ru0vjont.jpg',
                    filename: 'YelpCamp/noqgglxipf50ru0vjont',

                },
                {
                    url: 'https://res.cloudinary.com/dqvkcphnr/image/upload/v1650399338/YelpCamp/lppuxz8rctwkjhudu21y.jpg',
                    filename: 'YelpCamp/lppuxz8rctwkjhudu21y',

                }
            ],
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Veniam animi, nisi sint pariatur distinctio deleniti, rerum provident exercitationem, accusantium deserunt non illo repellat! Vitae impedit corporis harum perferendis aspernatur libero!',
            price: cost
        })
        await camp.save();
    }
}
seedDB().then(() => {
    mongoose.connection.close();
})