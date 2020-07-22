"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class productShoppingList extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      productShoppingList.belongsTo(models.product);
      productShoppingList.belongsTo(models.shoppingList);
      // define association here
    }
  }
  productShoppingList.init(
    {
      productId: DataTypes.INTEGER,
      shoppinglistId: DataTypes.INTEGER,
      productAmount: DataTypes.INTEGER,
      purchased: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "productShoppingList",
    }
  );
  return productShoppingList;
};
