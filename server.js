const express = require("express");
const bcrypt = require("bcrypt");
const { SALT_ROUNDS } = require("./config/constants");
// auth_____________________START
const { toJWT } = require("./auth/jwt");
const authMiddleware = require("./auth/middleware");
const authRouter = require("./routers/auth");
// auth_____________________END
// require models_________________________________START
const Products = require("./models").product;
const ShoppingLists = require("./models").shoppingList;
const Users = require("./models").user;
const Stores = require("./models").store;
const ProductStores = require("./models").productStore;
const ProductShoppinglists = require("./models").productShoppingList;
// require models_________________________________END

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
  GraphQLInputObjectType,
  GraphQLScalarType,
} = require("graphql");
const app = express();
app.use(cors());
const bodyParserMiddleWare = express.json();
app.use(bodyParserMiddleWare);

const UserType = new GraphQLObjectType({
  name: "User",
  description: "This represents a user",
  fields: () => ({
    id: {
      type: GraphQLNonNull(GraphQLInt),
    },
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
    purchased: { type: GraphQLBoolean },
  }),
});

const ShoppingListUpdateItem = new GraphQLInputObjectType({
  name: "ShoppingListUpdateItem",
  description: "Data for updating/creating single shopping list item",
  fields: () => ({
    name: { type: GraphQLNonNull(GraphQLString) },
    amount: { type: GraphQLInt },
    id: { type: GraphQLInt },
  }),
});

const ShoppinglistType = new GraphQLObjectType({
  name: "ShoppingList",
  description: "This represents a shopping list",
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    title: { type: GraphQLNonNull(GraphQLString) },
    userId: { type: GraphQLNonNull(GraphQLInt) },
    products: {
      type: new GraphQLList(ProductType),
      resolve(parentDataSource, args, context) {
        console.log(context.user.dataValues.id);
        return ShoppingLists.findByPk(parentDataSource.dataValues.id, {
          include: [
            {
              model: Products,
            },
          ],
        }).then((shoppingsList) => {
          return shoppingsList.dataValues.products.map((product) => {
            const productFields = product.dataValues;
            const shoppingList = product.dataValues.productShoppingList;
            return {
              id: productFields.id,
              name: productFields.name,
              amount: shoppingList.dataValues.productAmount,
              unit: productFields.unit,
              purchased: shoppingList.dataValues.purchased,
            };
          });
        });
      },
    },
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

const userID = 17;
const RootQueryType = new GraphQLObjectType({
  name: "Query",
  description: "Root Query",
  fields: () => ({
    user: {
      type: UserType,
      resolve: (p, args, context) => {
        return Users.findByPk(context.user.dataValues.id);
      },
      args: {
        id: {
          type: GraphQLInt,
        },
      },
      shoppingLists: {
        type: new GraphQLList(ShoppinglistType),
        description: "List of all shopping list",
        resolve: (parent, args, context) =>
          ShoppingLists.findAll({
            where: { userId: context.user.dataValues.id }, 
          }),
      },
      productShoppingList: {
        type: ShoppinglistType,
        description: "List of all products in current list",
        products: {
          type: new GraphQLList(ProductType),
          resolve: (p, args, k) => {
            return Products.findAll();
          },
        },
        resolve: (p, args) => {
          return ProductShoppinglists.findAll({
            where: {
              shoppinglistId: 25,
            },
          });
        },
      },
    },
    products: {
      type: new GraphQLList(ProductType),
      description: "List of all products",
      resolve: () => Products.findAll(),
    },
    stores: {
      type: new GraphQLList(StoreType),
      resolve: () => Stores.findAll(),
    },
    shoppingLists: {
      type: new GraphQLList(ShoppinglistType),
      description: "List of all shopping list",
      description: "List of all stores",
      resolve: (p, a, context) =>
        ShoppingLists.findAll({
          where: { userId: context.user.dataValues.id },
        }),
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
      },
    },
  }),
});

// mutations____________________________________________START

const RootMutationType = new GraphQLObjectType({
  name: "mutation",
  fields: () => ({
    addShoppinList: {
      type: ShoppinglistType,
      args: {
        title: { type: GraphQLNonNull(GraphQLString) },
        userId: { type: GraphQLNonNull(GraphQLInt) },
      },
      resolve: (parent, args) => {
        const newList = { title: args.title, userId: args.userId };
        ShoppingLists.create(newList);
      },
    },
    // sign up_______________________________START
    createNewUser: {
      type: UserType,
      args: {
        email: { type: GraphQLNonNull(GraphQLString) },
        password: { type: GraphQLNonNull(GraphQLString) },
      },
      resolve: (parent, args) => {
        const newUser = {
          email: args.email,
          password: bcrypt.hashSync(args.password, SALT_ROUNDS),
        };
        Users.create(newUser);
      },
    },

    // sign up_______________________________END
    updateShoppingList: {
      type: new GraphQLList(ProductType),
      args: {
        title: { type: GraphQLString },
        id: { type: GraphQLInt },
        items: { type: new GraphQLList(ShoppingListUpdateItem) },
      },
      resolve: async (parent, args) => {
        // !!! enshure that currently authenticated user is an owner of the shopping list
        console.log("args", args);
        // const newProduct = [
        // { name: args.name, amount: args.amount, unit: args.unit },
        // ];
        // console.log(newProduct);
        // Products.create(newProduct)
        return [];
      },
    },
  }),
});

// mutations____________________________________________END

const schema = new GraphQLSchema({
  query: RootQueryType,
  mutation: RootMutationType,
});

app.use("/", authRouter);

app.use(
  "/graphql",
  // (req, res, next) => {
  //   // To make graphiql work without auth header as tool does not support it
  //   if (process.env.APP_MODE === "development") {
  //     req.user = {
  //       id: 17,
  //     };
  //     next();
  //   } else {
  //     return authMiddleware(req, res, next);
  //   }
  // },
  authMiddleware,
  graphqlHTTP({
    schema: schema,
    graphiql: true,
  })
);

app.listen(PORT, () => {});
