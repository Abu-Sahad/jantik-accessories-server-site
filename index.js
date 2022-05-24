const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.e8fnh.mongodb.net/?retryWrites=true&w=majority`;
//console.log(uri);

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const itemsCollection = client.db('jantik_accessories').collection('items')
        //console.log('database connected')
        const itemOrderCollection = client.db('jantik_accessories').collection('orders')
        const reviewCollection = client.db('jantik_accessories').collection('reviews')
        const userCollection = client.db('jantik_accessories').collection('users');
        const profileUpdate = client.db('jantik_accessories').collection('profile')


        // all item 
        app.get('/item', async (req, res) => {
            const query = {};
            const cursor = itemsCollection.find(query);
            const items = await cursor.toArray();
            res.send(items);
        })

        // single item
        app.get('/item/:_id', async (req, res) => {
            const id = req.params._id
            const query = { _id: ObjectId(id) }
            const result = await itemsCollection.findOne(query)
            res.send(result)
        })
         
        //order create
        app.post('/order', async (req, res) => {
            const order = req.body
            const result = await itemOrderCollection.insertOne(order)
            res.send({ success: true, result })
        })
         //single order 
        app.get('/order', async (req, res) => {
            const email = req.query.email
            const query = { userEmail: email }
            const cursor = itemOrderCollection.find(query)
            const order = await cursor.toArray()
            res.send(order)
            console.log(email, order)
        })
        //add product
        app.post("/item", async (req, res) => {
            const items = req.body;
            const result = await itemsCollection.insertOne(items);
            res.send(result);
        });



        //review area api
        app.get('/review', async (req, res) => {
            const query = {}
            const cursor = reviewCollection.find(query)
            const reviews = await cursor.toArray()
            res.send(reviews)
        })


        

    }
    finally {

    }
}
run().catch(console.dir)

app.get('/', (req, res) => {
    res.send('Hello jantik app!')
})

app.listen(port, () => {
    console.log(`jantik app listening on port ${port}`)
})