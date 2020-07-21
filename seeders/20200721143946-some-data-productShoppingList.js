'use strict';
const Product = require('../models').product;
const ShoppingList = require('../models').shoppingList;
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const Product1 = await Product.findOne({where:{ name:'Milk'}});
    const Product2 = await Product.findOne({where:{name:'Bread'}});
    const Product3 = await Product.findOne({where:{name:'T-shirt'}});

    const ShoppingList1 = await ShoppingList.findOne({where:{title:'weekly food'}});
    const ShoppingList2 = await ShoppingList.findOne({where:{title:'cloths for Anna'}});
    const ShoppingList3 = await ShoppingList.findOne({where:{title:'household products'}});




    return queryInterface.bulkInsert("productShoppingLists",[
      {
        productId:Product2.id,
        shoppinglistId:ShoppingList1.id,
        productAmount:Product2.amount,
        purchased:true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },{
        productId:Product3.id,
        shoppinglistId:ShoppingList2.id,
        productAmount:Product3.amount,
        purchased:true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        productId:Product1.id,
        shoppinglistId:ShoppingList3.id,
        productAmount:Product1.amount,
        purchased:true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ])
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("productShoppingLists", null, {});
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};
