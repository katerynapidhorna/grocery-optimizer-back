'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class shoppingList extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      shoppingList.belongsTo(models.user)
      shoppingList.belongsToMany(models.product,{
        through:'productShoppingList',
        foreignKey:'shoppinglistId'
      })
    }
  };
  shoppingList.init({
    title: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'shoppingList',
  });
  return shoppingList;
};