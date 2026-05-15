const express=require("express");
const app=express();
const mongoose=require('mongoose');

const MONGO_URL="mongodb://127.0.0.1:27017/Roomlo";

main().
then(()=>{
    console.log("created a db");
})
.catch((err)=>{
    console.log("Not connected db");
})
async function main(){
    await mongoose.connect(MONGO_URL);
}



let port=8080;
app.get("/",(req,res)=>{
    res.send("Data is accepting!");
})

app.listen(port,()=>{
    console.log("Server has been started");
})