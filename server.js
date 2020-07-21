const express = require("express");
const cors = require('cors');
const { PORT } = require("./config/constants");

const Products = require('./models').product

const app = express();
app.use(cors())







app.get('/products',async(req,res)=>{
  const products = await Products.findAll();
  res.send(products)
})





app.listen(PORT, () => {
  console.log(`Listening on port: ${PORT}`);
});