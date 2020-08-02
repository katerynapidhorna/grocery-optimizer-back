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
} = require("graphql");

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
    updatePurchased: {
      type: ProductShoppinglistType,
      args: {
        productId: { type: new GraphQLList(GraphQLInt) },
        purchased: { type: GraphQLBoolean },
        shoppinglistId: { type: GraphQLNonNull(GraphQLInt) },
      },
      resolve: async (p, args, context) => {
        console.log(args);
        const allProdutsIdsToChangePurchased = await ProductShoppinglists.update(
          {
            purchased: args.purchased,
          },
          {
            where: {
              shoppinglistId: args.shoppinglistId,
              productId: args.productId,
            },
          }
        );
      },
    },
  }),
});

exports.RootMutationType = RootMutationType;
