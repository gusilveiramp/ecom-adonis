'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Product extends Model {
  /**
   * Relacionamento entre Produto e a imagem de destaque
   */
  image() {
    return this.belongsTo('App/Models/Image')
  }

  /**
   * Relacionamento entre Produto e imagens da galeria
   */
  images() {
    return this.belongsToMany('App/Models/Image')
  }

  /**
   * Relacionamento entre Produto e categorias
   */
  categories() {
    return this.belongsToMany('App/Models/Category')
  }

  /**
   * Relacionamento entre Produto e cupons de desconto
   */
  coupons() {
    return this.belongsToMany('App/Models/Coupon')
  }
}

module.exports = Product
