"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert(
      "users",
      [
        {
          email: "test@test.com",
          password:
            "$2b$10$VdU0QDXxRGnXl9PvchlH8OHYXMiBhYv2oRXpLDOkX1yyc.Gf1Z5jC",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          email: "a@a.com",
          password:
            "$2b$10$YP2n0j8R1v4ORLftSSC9tOpErRr9knjwR0sxFQa6Mxy4klIes1sWa",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
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
    return queryInterface.bulkDelete("users", null, {});
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  },
};
