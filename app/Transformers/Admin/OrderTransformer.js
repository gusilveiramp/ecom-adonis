'use strict'

const BumblebeeTransformer = use('Bumblebee/Transformer')

const UserTransformer = use('App/Transformers/Admin/UserTransformer')
const OrderItemTransformer = use('App/Transformers/Admin/OrderItemTransformer')
const CouponTransformer = use('App/Transformers/Admin/CouponTransformer')
const DiscountTransformer = use('App/Transformers/Admin/DiscountTransformer')

/**
 * OrderTransformer class
 *
 * @class OrderTransformer
 * @constructor
 */
class OrderTransformer extends BumblebeeTransformer {
  // retorna apenas se eu solicitar pelo controller
  availableInclude() {
    return ['user', 'items', 'coupons', 'discounts']
  }
  /**
   * This method is used to transform the data.
   */
  transform(model) {
    // quando o model possuir computedProperties ($sideLoaded) preciso transformar em JSON antes
    model = model.toJSON()
    return {
      id: model.id,
      status: model.status,
      date: model.created_at,
      total: model.total ? parseFloat(model.total.toFixed(2)) : 0,
      //__meta__ permite acessar os dados do $sideLoaded. Após converter usando o toJSON, o sideLoaded passa a se chamar __meta__
      qty_items: model.__meta__ && model.__meta__.qty_items ? model.__meta__.qty_items : 0,
      discount: model.__meta__ && model.__meta__.discount ? model.__meta__.discount : 0,
      subtotal: model.__meta__ && model.__meta__.subtotal ? model.__meta__.subtotoal : 0,
    }
  }

  // receber order e retorna o order com o user incluso
  includeUser(order) {
    return this.item(order.getRelated('user'), UserTransformer)
  }
  includeItems(order) {
    return this.collection(order.getRelated('items'), OrderItemTransformer)
  }
  includeCoupons(order) {
    return this.collection(order.getRelated('coupons'), CouponTransformer)
  }
  includeDiscounts(order) {
    return this.collection(order.getRelated('discounts'), DiscountTransformer)
  }
}

module.exports = OrderTransformer
