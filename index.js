const express = require('express')
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config()
console.log(process.env.DB_PASS);

const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fg2cz.mongodb.net/burjAlArab?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const app = express()
app.use(cors());
app.use(bodyParser.json());

const admin = require("firebase-admin");
const serviceAccount = require("./configs/burj-al-arab-ahotel-firebase-adminsdk-mcfpb-204fb8913d.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

client.connect(err => {
    const bookings = client.db("burjAlArab").collection("bookings");

    app.post('/addBooking', (req, res) => {
        const newBooking = req.body;
        bookings.insertOne(newBooking)
            .then(result => {
                res.send(result.insertedCount > 0);
            })
        console.log(newBooking);
    })

    app.get('/bookings', (req, res) => {
        const bearer = req.headers.authorization;
        if (bearer && bearer.startsWith('Bearer ')) {
            const idToken = bearer.split(' ')[1];
            console.log({ idToken });
            admin
                .auth()
                .verifyIdToken(idToken)
                .then((decodedToken) => {
                    const tokenEmail = decodedToken.email;
                    const queryEmail = req.query.email;
                    console.log(tokenEmail, queryEmail);
                    if (tokenEmail === queryEmail) {
                        bookings.find({ email: req.query.email })
                            .toArray((err, documents) => {
                                res.status(200).send(documents)
                            })
                    }
                    else{
                        res.status(401).send('un-authorized access')
                    }
                })
                .catch((error) => { 
                    // Handle error
                });
             }
             else{
                 res.status(401).send('un-authorized access')
             }

    })
});


app.listen(5000)