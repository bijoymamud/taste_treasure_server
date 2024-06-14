const express = require('express');
const app = express();
const cors = require('cors');
var jwt = require('jsonwebtoken');
require('dotenv').config()
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());
const SECRET_KEY = process.env.JWT_ACCESS_TOKEN;

//mongodb Connection

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vrgzzke.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {

    await client.connect();


    const menuCollection = client.db("tasteTreasureDB").collection("menu");
    const usersCollection = client.db("tasteTreasureDB").collection(" users");
    const reviewsCollection = client.db("tasteTreasureDB").collection("reviews");
    const cartCollection = client.db("tasteTreasureDB").collection("cart");



    //token 
    app.post('/jwt', (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.JWT_ACCESS_TOKEN, {
        expiresIn: '10h'
      })

      res.send({ token })
    })

    // app.post('/jwt', (req, res) => {
    //   const { email } = req.body;

    //   if (!email) {
    //     return res.status(400).send('Email is required');
    //   }

    //   try {
    //     // Create a token
    //     const token = jwt.sign({ email }, SECRET_KEY, { expiresIn: '10h' });
    //     res.json({ token });
    //   } catch (error) {
    //     console.error('Error generating JWT:', error);
    //     res.status(500).send('Internal Server Error');
    //   }
    // });

    //users api

    app.get("/users", async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result)
    })



    app.post("/users", async (req, res) => {
      const user = req.body;
      const query = { email: user.email }
      const existingUser = await usersCollection.findOne(query);
      console.log('existing user', existingUser);
      if (existingUser) {
        return res.send({ message: 'User Already Exist' })
      }
      const result = await usersCollection.insertOne(user);
      res.send(result);
    })

    //delete users
    app.delete("/users/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await usersCollection.deleteOne(query)
      res.send(result)
    })

    //update users

    app.patch("/users/admin/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) }
      const updateDoc = {
        $set: {
          role: 'admin'
        }
      };
      const result = await usersCollection.updateOne(filter, updateDoc)
      res.send(result)
    })

    //geting menu items
    app.get('/menu', async (req, res) => {
      const result = await menuCollection.find().toArray();
      res.send(result);
    })


    //geting reviews
    app.get("/reviews", async (req, res) => {
      const result = await reviewsCollection.find().toArray();
      res.send(result);
    })


    //sending items as cart collection
    app.post('/carts', async (req, res) => {
      const item = req.body;
      console.log(item);
      const result = await cartCollection.insertOne(item);
      res.send(result);
    })

    //getting carts
    app.get('/carts', async (req, res) => {
      const email = req.query.email;
      if (!email) {
        res.send([]);
      }

      const query = { email: email };
      const result = await cartCollection.find(query).toArray();
      res.send(result);
    })


    //delete card
    // app.delete('/carts/:id', async (req, res) => {
    //   const id = req.params.id;
    //   const query = { _id: new ObjectId(id) }
    //   const result = await cartCollection.deleteOne(query);
    //   res.send(result)
    // })



    app.delete('/carts/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await cartCollection.deleteOne(query);
      res.send(result);
    })








    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {

    // await client.close();
  }
}
run().catch(console.dir);




app.get('/', (req, res) => {
  res.send("Taste Treasure on Production")
})

app.listen(port, () => {
  console.log(`Taste Treasure in running on port   ${port}`);
})