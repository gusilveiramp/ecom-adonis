'use strict'

const Coupon = use('App/Models/Coupon')
const Order = use('App/Models/Order')
const Database = use('Database')

const DiscountHook = (exports = module.exports = {})

DiscountHook.calculateValues = async (model) => {
  var couponProducts,
    discountItems = []

  model.discount = 0

  const coupon = await Coupon.find(model.coupon_id)
  const order = await Order.find(model.order_id)

  switch (coupon.can_use_for) {
    case 'product_client' || 'product':
      // pego meu couponProduct
      couponProducts = await Database.from('coupon_product').where('coupon_id', model.coupon_id).pluck('product_id')
      // pego os itens que estão na lista de produtos que o cliente comprou
      discountItems = await Database.from('order_items')
        .where('order_id', model.order_id)
        .whereIn('product_id', couponProducts)

      if (coupon.type == 'percent') {
        // desconto em porcentagem
        for (let orderItem of discountItems) {
          model.discount += (orderItem.subtotal / 100) * coupon.discount // incrementa a % em valor de moeda
        }
      } else if (coupon.type == 'currency') {
        // desconto em dinheiro
        for (let orderItem of discountItems) {
          model.discount += coupon.discount * orderItem.quantity
        }
      } else {
        // desconto total
        for (let orderItem of discountItems) {
          model.discount += orderItem.subtotal
        }
      }
      break

    default:
      /**
       * client || all
       * caso o cupom possa ser usado por um cliente em específico ou por todo mundo
       * O cupom vale para todo o pedido (todos os produtos do pedido)
       */
      if (coupon.type == 'percent') {
        model.discount = (order.subtotal / 100) * coupon.discount
      } else if (coupon.type == 'currency') {
        model.discount = coupon.discount
      } else {
        // desconto total para o pedido todo
        model.discount = order.subtotal
      }
      break
  }
}

/**
 * Decrementa a quantidade de cupons disponívels para uso
 */
DiscountHook.decrementCoupons = async (model) => {
  const query = Database.from('coupons')
  // verifica se existe uma transaction
  if (model.$transaction) {
    // aplico a transaction a minha query e ele não trava na hora de salvar
    query.transacting(model.$transaction)
  }
  await query.where('id', model.coupon_id).decrement('quantity', 1)
}

// incrementa a quantidade de cupons disponíveis (quando um desconto é retirado)
DiscountHook.incrementCoupons = async (model) => {
  const query = Database.from('coupons')
  if (model.$transaction) {
    query.transacting(model.$transaction)
  }
  await query.where('id', model.coupon_id).increment('quantity', 1)
}
