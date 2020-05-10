'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class OrderItem extends Model {
  static boot() {
    super.boot()

    /**
     * Pega o subtotal do pedido antes de salvar no BD
     */
    this.addHook('beforeSave', 'OrderItemHook.updateSubtotal')
  }

  /**
   * Informo isso quando a tabela não tem timestamps (created_at e updated_at)
   */
  static get traits() {
    return ['App/Models/Traits/NoTimestamp']
  }

  product() {
    return this.belongsTo('App/Models/Product')
  }

  order() {
    return this.belongsTo('App/Models/Order')
  }
}

module.exports = OrderItem
