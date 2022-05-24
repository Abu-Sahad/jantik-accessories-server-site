const express = require('express');
const cors = require('cors');

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
        
        
        const userCollection = client.db('de_walt').collection('users');


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








        app.post('/order', async (req, res) => {
            const order = req.body
            //  const query = {userEmail:order.userEmail,userName:order.userName,phone:order.phone,address:order.address}
            //  const exist = await orderCollection.findOne(query)
            //  if(exist){
            //   return res.send({ success: false, order: exist })
            //  }
            const result = await itemOrderCollection.insertOne(order)
            res.send({ success: true, result })
        })

        app.get('/order', async (req, res) => {
            const email = req.query.email
            const query = { userEmail: email }
            const cursor = itemOrderCollection.find(query)
            const order = await cursor.toArray()
            res.send(order)
            console.log(email, order)
        })




        //review area api
        app.get('/review', async (req, res) => {
            const query = {}
            const cursor = reviewCollection.find(query)
            const reviews = await cursor.toArray()
            res.send(reviews)
        })


        app.post('/review', async (req, res) => {
            const review = req.body
            const result = await reviewCollection.insertOne(review)
            res.send({ success: true, result })
        })


        app.put('/user/:email', async (req, res) => {
            const email = req.params.email;
            const user = req.body;
            const filter = { email: email };
            const options = { upsert: true };
            const updateDoc = {
                $set: user,
            };
            const result = await userCollection.updateOne(filter, updateDoc, options);
            const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '24h' })
            res.send({ result, token });
        });

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