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
  GraphQLFloat,
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

const ProductPrice = new GraphQLObjectType({
  name: "ProductPrice",
  fields: () => ({
    storeId: { type: GraphQLInt },
    price: { type: GraphQLFloat },
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
    prices: {
      type: new GraphQLList(ProductPrice),
      resolve: async (product) => {
        const productId = product.id;
        const productInfoByStore = await ProductStores.findAll({
          where: {
            productId: productId,
          },
          order: [["createdAt", "DESC"]],
        });
        return productInfoByStore.map((p) => {
          return {
            storeId: p.storeId,
            price: p.productPrice,
          };
        });
      },
    },
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

const ShoppingListUpdateTitle = new GraphQLInputObjectType({
  name: "ShoppingListUpdateTitle",
  fields: () => ({
    title: { type: GraphQLString },
    id: { type: GraphQLInt },
  }),
});

// new type for updating product stor join table____START
const NewProductPrices = new GraphQLInputObjectType({
  name: "NewProductPrices",
  description: "fields for updating price per product id and store id",
  fields: () => ({
    productId: { type: GraphQLNonNull(GraphQLInt) },
    storeId: { type: GraphQLNonNull(GraphQLInt) },
    productPrice: { type: GraphQLInt },
  }),
});

// new type for updating product stor join table____END

// new type for updating certain shopping list____START
const UpdateShoppingList = new GraphQLObjectType({
  name: "UpdateShoppingList",
  description:
    "need to update data for certain shoppin list and related tables",
  fields: () => ({
    list: { type: GraphQLNonNull(GraphQLString) },
    products: { type: new GraphQLList(ProductType) },
  }),
});
// new type for updating certain shopping list____END

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
        // console.log(context.user.dataValues.id);
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

const UpdatePricesResult = new GraphQLObjectType({
  name: "UpdatePricesResult",
  fields: {
    success: { type: GraphQLBoolean },
  },
});

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
              shoppinglistId: 25, // TODO: figure out
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
      description: "List of all shopping lists",
      resolve: (p, a, context) => {
        return ShoppingLists.findAll({
          where: { userId: context.user.dataValues.id },
        });
      },
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
    shoppingList: {
      type: ShoppinglistType,
      description: "Single shopping list",
      args: {
        id: {
          type: GraphQLInt,
        },
      },
      resolve: (p, args, context) => {
        return ShoppingLists.findByPk(args.id);
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
      },
      resolve: async (parent, args, context) => {
        const newList = { title: args.title, userId: context.user.id };
        const result = await ShoppingLists.create(newList);
        return result;
      },
    },
    updateShoppingList: {
      type: UpdateShoppingList,
      args: {
        list: { type: GraphQLNonNull(ShoppingListUpdateTitle) },
        id: { type: GraphQLInt },
        products: { type: new GraphQLList(ShoppingListUpdateItem) },
      },
      resolve: async (parent, args, context) => {
        // !!! enshure that currently authenticated user is an owner of the shopping list
        if (args.list.id) {
          const ownersList = await ShoppingLists.findOne({
            where: {
              id: args.list.id,
              userId: context.user.id,
            },
          });
          await ownersList.update({ title: args.list.title });
          const productsWithId = await args.products.filter((product) => {
            if (product.id !== null) {
              return product.id;
            }
          });

          const productsWithIdArrayOfIds = productsWithId.map((p) => {
            return p.id;
          });

          const existingProducts = await ProductShoppinglists.findAll({
            where: {
              productId: productsWithIdArrayOfIds,
              shoppinglistId: args.list.id,
            },
          });
          await ProductShoppinglists.destroy({
            where: {
              shoppinglistId: args.list.id,
            },
          });
          const productsCreation = existingProducts.map(async (product) => {
            const newProductData = productsWithId.find((p) => {
              return p.id === product.productId;
            });
            return ProductShoppinglists.create({
              id: product.id,
              productId: newProductData.id,
              shoppinglistId: args.list.id,
              productAmount: newProductData.amount,
              purchased: product.purchased,
            });
          });
          await Promise.all(productsCreation);
          const productsWithoutId = args.products.filter((p) => {
            if (p.id === null) {
              return p;
            }
          });
          const productsWithoutIdCreated = productsWithoutId.map(async (p) => {
            const createdProduct = await Products.create({
              name: p.name,
              amount: 0,
              unit: "unit",
            });
            return ProductShoppinglists.create({
              productId: createdProduct.id,
              shoppinglistId: args.list.id,
              purchased: false,
              productAmount: p.amount,
            });
          });
          await Promise.all(productsWithoutIdCreated);
        }

        return [];
      },
    },
    updatePrices: {
      type: UpdatePricesResult,
      args: {
        prices: {
          type: new GraphQLList(NewProductPrices),
        },
      },
      resolve: async (p, args, c) => {
        const newPrices = args.prices.filter((p) => {
          return p.productPrice !== null;
        });
        // check existing price, if different, insert new row
        let pendingOperations = newPrices.map(
          async ({ productId, storeId, productPrice }) => {
            const latestProductPrice = await ProductStores.findOne({
              where: {
                productId: productId,
                storeId: storeId,
              },
              order: [["createdAt", "DESC"]],
            });
            1; // If no price entry or latest price entry has different value
            if (
              !latestProductPrice ||
              latestProductPrice.productPrice !== productPrice
            ) {
              await ProductStores.create({
                productId: productId,
                storeId: storeId,
                productPrice: productPrice,
              });
            }
          }
        );
        // https://gomakethings.com/waiting-for-multiple-all-api-responses-to-complete-with-the-vanilla-js-promise.all-method/
        await Promise.all(pendingOperations);
        return {
          success: true,
        };
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

app.listen(PORT, () => {
  console.log("Server started:", PORT);
});
