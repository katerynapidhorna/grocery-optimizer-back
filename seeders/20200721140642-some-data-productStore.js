'use strict';
const Product = require('../models').product;
const Store = require('../models').store;
console.log(Product,Store)

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const Product1 = await Product.findOne({where:{ name:'Milk'}});
    const Product2 = await Product.findOne({where:{name:'Bread'}});
    const Product3 = await Product.findOne({where:{name:'T-shirt'}});
    const Store1 = await Store.findOne({where:{ name:'Lidl'}});
    const Store2 = await Store.findOne({where:{ name:'H&M'}});
    const Store3 = await Store.findOne({where:{ name:'AH'}});

    return queryInterface.bulkInsert("productStores",[
      {
        productId:Product1.id,
        storeId: Store3.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        productId:Product2.id,
        storeId: Store1.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        productId:Product3.id,
        storeId: Store2.id,
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
    return queryInterface.bulkDelete("productStores", null, {});
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};
