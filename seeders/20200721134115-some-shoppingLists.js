'use strict';
const User = require('../models').user;

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const user1 = await User.findOne({where:{email:'test@test.com'}});
    const user2 = await User.findOne({where:{email:'a@a.com'}});

    return queryInterface.bulkInsert("shoppingLists",[
      {
        title:'weekly food',
        userId:user1.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title:'cloths for Anna',
        userId:user1.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title:'household products',
        userId:user2.id,
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
    return queryInterface.bulkDelete("shoppingLists", null, {});
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};
