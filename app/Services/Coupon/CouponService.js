'use strict'

class CouponService {
  constructor(model, trx = null) {
    this.model = model
    this.tx = trx
  }

  /**
   * Sincroniza usuários de acordo com o coupon
   */
  async syncUsers(users) {
    // precisa ser sempre array
    if (!Array.isArray(users)) {
      return false
    }
    await this.model.users().sync(users, null, this.trx)
  }

  /**
   * Sincroniza pedidos de acordo com o coupon
   */
  async syncOrders(orders) {
    if (!Array.isArray(orders)) {
      return false
    }

    await this.model.orders().sync(orders, null, this.trx)
  }

  /**
   * Sincroniza produtos de acordo com o coupon
   */
  async syncProducts(products) {
    if (!Array.isArray(products)) {
      return false
    }

    await this.model.products().sync(products, null, this.trx)
  }
}

module.exports = CouponService
