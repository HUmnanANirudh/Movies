require("dotenv").config({path:"./backend/.env"});
const MONGO_URI =  process.env.MONGO_URI;
console.log(MONGO_URI)
module.exports = MONGO_URI
