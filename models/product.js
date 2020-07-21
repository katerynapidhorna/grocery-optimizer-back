'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class product extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      product.belongsToMany(models.shoppingList,{
        through:'productShoppingList',
        foreignKey:'productId'
      })
      product.belongsToMany(models.store,{
        through:'productStore',
        foreignKey:'productId'
      })
      // define association here
    }
  };
  product.init({
    name: DataTypes.STRING,
    amount: DataTypes.INTEGER,
    unit: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'product',
  });
  return product;
};