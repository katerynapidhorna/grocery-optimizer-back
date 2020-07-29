'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert("stores",[
      {
        name:'Lidl',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name:'AH',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name:'Jumbo',
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
    return queryInterface.bulkDelete("stores", null, {});

    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};
