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

        // app.get('/order', async (req, res) => {
        //     const query = {};
        //     const cursor = itemOrderCollection.find(query);
        //     const items = await cursor.toArray();
        //     res.send(items);
        // })



        //single order 
        app.get('/order', async (req, res) => {
            const email = req.query.email
            const query = { userEmail: email }
            const cursor = itemOrderCollection.find(query)
            const order = await cursor.toArray()
            res.send(order)
        })


        app.get('/order/:id',async(req,res)=>{
            const id=req.params.id;
            const query={_id:ObjectId(id)};
            const order=await itemOrderCollection.findOne(query);
            res.send(order)
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


        app.post('/review', async (req, res) => {
            const review = req.body
            const result = await reviewCollection.insertOne(review)
            res.send({ success: true, result })
        })

        app.get('/user', async (req, res) => {
            const users = await userCollection.find().toArray();
            res.send(users);
        });

        app.put('/user/admin/:email', async (req, res) => {
            const email = req.params.email;
            const filter = { email: email };
            const updateDoc = {
                $set: { role: 'admin' },
            };
            const result = await userCollection.updateOne(filter, updateDoc);
            res.send(result);
        })

        app.delete("/user/:email", async (req, res) => {
            const email = req.params.email;
            const filter = { email: email };
            const result = await userCollection.deleteOne(filter);
            res.send(result);
        });

        //getting api for admin

        app.get('/admin/:email', async (req, res) => {
            const email = req.params.email;
            const user = await userCollection.findOne({ email: email });
            const isAdmin = user.role === 'admin';
            res.send({ admin: isAdmin })
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



        app.post('/profile', async (req, res) => {
            const profile = req.body
            const result = await profileUpdate.insertOne(profile)
            res.send({ success: true, result })
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