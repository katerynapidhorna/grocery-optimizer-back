const Products = require("../models").product;
const ShoppingLists = require("../models").shoppingList;
const Users = require("../models").user;
const Stores = require("../models").store;
const ProductStores = require("../models").productStore;
const ProductShoppinglists = require("../models").productShoppingList;

const {
  UserType,
  StoreType,
  ProductPrice,
  ProductType,
  ShoppingListUpdateItem,
  ShoppingListUpdateTitle,
  NewProductPrices,
  UpdateShoppingList,
  ShoppinglistType,
  ProductStoreType,
  ProductShoppinglistType,
  UpdatePricesResult,
} = require("./types");

const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLBoolean,
} = require("graphql");

// console.log(ShoppingLists);

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

exports.RootQueryType = RootQueryType;
