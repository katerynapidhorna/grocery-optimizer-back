const Products = require("../models").product;
const ShoppingLists = require("../models").shoppingList;
const Users = require("../models").user;
const Stores = require("../models").store;
const ProductStores = require("../models").productStore;
const ProductShoppinglists = require("../models").productShoppingList;

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

exports.UserType = UserType;

const StoreType = new GraphQLObjectType({
  name: "Store",
  description: "This represents a store",
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    name: { type: GraphQLNonNull(GraphQLString) },
  }),
});

exports.StoreType = StoreType;

const ProductPrice = new GraphQLObjectType({
  name: "ProductPrice",
  fields: () => ({
    storeId: { type: GraphQLInt },
    price: { type: GraphQLFloat },
  }),
});

exports.ProductPrice = ProductPrice;

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

exports.ProductType = ProductType;

const ShoppingListUpdateItem = new GraphQLInputObjectType({
  name: "ShoppingListUpdateItem",
  description: "Data for updating/creating single shopping list item",
  fields: () => ({
    name: { type: GraphQLNonNull(GraphQLString) },
    amount: { type: GraphQLInt },
    id: { type: GraphQLInt },
  }),
});

exports.ShoppingListUpdateItem = ShoppingListUpdateItem;

const ShoppingListUpdateTitle = new GraphQLInputObjectType({
  name: "ShoppingListUpdateTitle",
  fields: () => ({
    title: { type: GraphQLString },
    id: { type: GraphQLInt },
  }),
});

exports.ShoppingListUpdateTitle = ShoppingListUpdateTitle;

// new type for updating product stor join table
const NewProductPrices = new GraphQLInputObjectType({
  name: "NewProductPrices",
  description: "fields for updating price per product id and store id",
  fields: () => ({
    productId: { type: GraphQLNonNull(GraphQLInt) },
    storeId: { type: GraphQLNonNull(GraphQLInt) },
    productPrice: { type: GraphQLInt },
  }),
});

exports.NewProductPrices = NewProductPrices;


// new type for updating certain shopping list
const UpdateShoppingList = new GraphQLObjectType({
  name: "UpdateShoppingList",
  description:
    "need to update data for certain shoppin list and related tables",
  fields: () => ({
    list: { type: GraphQLNonNull(GraphQLString) },
    products: { type: new GraphQLList(ProductType) },
  }),
});

exports.UpdateShoppingList = UpdateShoppingList;


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

exports.ShoppinglistType = ShoppinglistType;


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

exports.ProductStoreType = ProductStoreType;


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

exports.ProductShoppinglistType = ProductShoppinglistType;


const UpdatePricesResult = new GraphQLObjectType({
  name: "UpdatePricesResult",
  fields: {
    success: { type: GraphQLBoolean },
  },
});

exports.UpdatePricesResult = UpdatePricesResult;
