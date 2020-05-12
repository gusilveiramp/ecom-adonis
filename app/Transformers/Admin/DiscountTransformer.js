'use strict'

const BumblebeeTransformer = use('Bumblebee/Transformer')
const CouponTransformer = use('App/Transformers/Admin/CouponTransformer')

/**
 * DiscountTransformer class
 *
 * @class DiscountTransformer
 * @constructor
 */
class DiscountTransformer extends BumblebeeTransformer {
  // retorna o cupon comod efault até pq o desconto só existe quando existir um cupom
  defaultInclude() {
    return ['coupon']
  }
  /**
   * This method is used to transform the data.
   */
  transform(model) {
    return {
      id: model.id,
      amount: model.discount,
    }
  }

  includeCoupon(discount) {
    return this.item(discount.getRelated('coupon'), CouponTransformer)
  }
}

module.exports = DiscountTransformer
