'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Order extends Model {
  static boot() {
    super.boot()

    /**
     * Executa após o método find do query builder
     */
    this.addHook('afterFind', 'OrderHook.updateValues')
    /**
     * Executa após o método paginate do query builder
     */
    this.addHook('afterPaginate', 'OrderHook.updateCollectionValues')
  }
  items() {
    return this.hasMany('App/Models/OrderItem')
  }

  coupons() {
    return this.belongsToMany('App/Models/Coupon')
  }

  discounts() {
    return this.hasMany('App/Models/Discount')
  }

  user() {
    return this.belongsTo('App/Models/User', 'user_id', 'id')
  }
}

module.exports = Order
