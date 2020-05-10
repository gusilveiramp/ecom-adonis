'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Discount extends Model {
  /**
   * Especifico a tabela porque não temos uma table com o nome Discounts
   */
  static get table() {
    return 'coupon_order'
  }

  /**
   * Relacionamento entre Disconto e Pedido
   * order_id é o campo na minha tabela que contém o valor da chave primária na tabela Order
   * Ele vai comparar order_id com id no model Order
   */
  order() {
    return this.belongsTo('App/Models/Order', 'order_id', 'id')
  }

  coupon() {
    return this.belongsTo('App/Models/Coupon', 'coupon_id', 'id')
  }
}

module.exports = Discount
