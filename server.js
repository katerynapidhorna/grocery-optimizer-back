const express = require("express");

const Products = require("./models").product;
const ShoppingLists = require("./models").shoppingList;
const Users = require("./models").user;
const Stores = require("./models").store;
const ProductStores = require("./models").productStore;
const ProductShoppinglists = require("./models").productShoppingList;

const { PORT } = require("./config/constants");
const cors = require("cors");
const { graphqlHTTP } = require("express-graphql");
const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLBoolean,
} = require("graphql");
const app = express();
app.use(cors());

const UserType = new GraphQLObjectType({
  name: "User",
  description: "This represents a user",
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    email: { type: GraphQLNonNull(GraphQLString) },
    password: { type: GraphQLNonNull(GraphQLString) },
  }),
});

const StoreType = new GraphQLObjectType({
  name: "Store",
  description: "This represents a store",
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    name: { type: GraphQLNonNull(GraphQLString) },
  }),
});

const ProductType = new GraphQLObjectType({
  name: "Product",
  description: "This represents a product",
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    name: { type: GraphQLNonNull(GraphQLString) },
    amount: { type: GraphQLInt },
    unit: { type: GraphQLString },
  }),
});

const ShoppinglistType = new GraphQLObjectType({
  name: "ShoppingList",
  description: "This represents a shopping list",
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    title: { type: GraphQLNonNull(GraphQLString) },
    userId: { type: GraphQLNonNull(GraphQLInt) },
  }),
});

const ProductStoreType = new GraphQLObjectType({
  name: "ProductStore",
  description: "This represents a Product Store relation",
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    storeId: { type: GraphQLNonNull(GraphQLInt) },
    productId: { type: GraphQLNonNull(GraphQLInt) },
    productPrice: { type: GraphQLInt },
  }),
});

const ProductShoppinglistType = new GraphQLObjectType({
  name: "ProductShoppinglists",
  description: "This represents a Product Shoppinglist relation",
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    productId: { type: GraphQLNonNull(GraphQLInt) },
    shoppinglistId: { type: GraphQLNonNull(GraphQLInt) },
    productAmount: { type: GraphQLInt },
    purchased: { type: GraphQLBoolean },
  }),
});

const RootQueryType = new GraphQLObjectType({
  name: "Query",
  description: "Root Query",
  fields: () => ({
    users: {
      type: new GraphQLList(UserType),
      description: "List of all products",
      resolve: () => Users.findAll(),
    },
    products: {
      type: new GraphQLList(ProductType),
      description: "List of all products",
      resolve: () => Products.findAll(),
    },
    stores:{
      type: new GraphQLList(StoreType),
      resolve: () => Stores.findAll()
    },
    shoppingLists: {
      type: new GraphQLList(ShoppinglistType),
      description: "List of all shopping list",
      description: "List of all stores",
      resolve: () => ShoppingLists.findAll(),
    },
    productShoppinglists: {
      type: new GraphQLList(ProductShoppinglistType),
      description: "List of product shopping list relations",
      resolve: () => {
        return ProductShoppinglists.findAll({
          attributes: { include: ["id"] },
        });
      },
    },
    productStores: {
      type: new GraphQLList(ProductStoreType),
      description: "List of all product store relations",
      resolve: () => {
        return ProductStores.findAll({
          attributes: { include: ["id"] },
        });
    }
  }
  }),
});

const schema = new GraphQLSchema({
  query: RootQueryType,
});

app.listen(PORT, () => {
  console.log(`Listening on port: ${PORT}`);
});

app.use(
  "/graphql",
  graphqlHTTP({
    schema: schema,
    graphiql: true,
  })
);

// const cors = require('cors');
// const { PORT } = require("./config/constants");

// const Products = require('./models').product

// const app = express();
// app.use(cors())

// app.get('/products',async(req,res)=>{
//   const products = await Products.findAll();
//   res.send(products)
// })

// app.listen(PORT, () => {
//   console.log(`Listening on port: ${PORT}`);
// });
