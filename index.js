const express = require('express')
const bodyParser = require('body-parser');
const cors = require('cors');
const password = "Hasib42742";

const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://burjalarab:Hasib42742@cluster0.fg2cz.mongodb.net/burjAlArab?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const app = express()

app.use(cors());
app.use(bodyParser.json());

client.connect(err => {
    const bookings = client.db("burjAlArab").collection("bookings");
        
    app.post('/addBooking', (req, res)=>{
        const newBooking = req.body;
        bookings.insertOne(newBooking)
        .then(result =>{
            res.send(result.insertedCount > 0);
        })
        console.log(newBooking);
    })

    app.get('/bookings', (req, res)=>{
        console.log(req.headers.authorization);
        bookings.find({email: req.query.email})
        .toArray((err, documents)=>{
            res.send(documents)
        })
    })
  });

app.get('/', (req, res) => {
    res.send('Hello World!')
  })
  
  app.listen(5000)