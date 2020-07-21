'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert("products",[
      {
        name:'Milk',
        amount:2,
        unit:'liters',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name:'Bread',
        amount:1,
        unit:'loafs',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name:'T-shirt',
        amount:2,
        unit:'items',
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
    return queryInterface.bulkDelete("products", null, {});
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};
