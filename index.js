const connectToMongo = require("./db");
const express = require("express");
var cors=require('cors');

connectToMongo();

const app=express()
const port=5000;

app.use(cors())     //browser cors policy
app.use(express.json())     //for using/compiling json in express project


app.use('/api/auth',require('./routes/auth'));
app.use('/api/notes',require('./routes/notes'));

app.listen(port,()=>{
    console.log(`listening at  http://localhost:${port}`);
})
