'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class productStore extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      productStore.belongsTo(models.product);
      productStore.belongsTo(models.store)
      // define association here
    }
  };
  productStore.init({
    productPrice: DataTypes.INTEGER,
    productId: DataTypes.INTEGER,
    storeId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'productStore',
  });
  return productStore;
};