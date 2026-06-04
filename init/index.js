const mongoose=require('mongoose');
const initData=require("./data");
const listing=require('../model/listing');
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

const initDb= async ()=>{

    await listing.insertMany(initData.data);
    console.log("Data was intiliased");
}
initDb();
