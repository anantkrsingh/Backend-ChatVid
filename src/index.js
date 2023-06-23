const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const env = require('dotenv');
const bodyParser = require('body-parser');
const {Server} = require('socket.io');
const app = express();




env.config();
const authRoutes = require('./Routes/Auth');
const roomRoutes = require('./Routes/Generator')
const sessionRoutes = require('./Routes/Session')
const { createMeeting } = require('./Controllers/Generator');



app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}))
// app.use(express.json())
app.use(cors());

app.use('/api',authRoutes);
app.use('/api/meeting',roomRoutes)

app.use("/api/session",sessionRoutes)



app.get("/",(req,res)=>{
  console.log(req.query.name);
    res.send(req.query.name);
})

app.listen("3000",()=>{
  console.log('Server Started port = 3000');
});

mongoose
  .connect(
    `mongodb://127.0.0.1:27017/audio-db`
  )
  .then(() => {
    console.log("DB Connected");
  }).catch((error)=>{
    console.log(error)
  });



  