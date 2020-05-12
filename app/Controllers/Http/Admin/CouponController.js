'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */

const Coupon = use('App/Models/Coupon')
const Database = use('Database')
const Service = use('App/Services/Coupon/CouponService')
const Transformer = use('App/Transformers/Admin/CouponTransformer')

/**
 * Resourceful controller for interacting with coupons
 */
class CouponController {
  /**
   * Show a list of all coupons.
   * GET coupons
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {object} ctx.pagination
   * @param {Transformer} ctx.transform
   */
  async index({ request, response, pagination, transform }) {
    const code = request.input('code')
    const query = Coupon.query()

    if (code) {
      query.where('code', 'ILIKE', `%${code}%`)
    }

    var coupons = await query.paginate(pagination.page, pagination.limit)
    coupons = await transform.paginate(coupons, Transformer)
    return response.send(coupons)
  }

  /**
   * Create/save a new coupon.
   * POST coupons
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {Transformer} ctx.transform
   */
  async store({ request, response, transform }) {
    /**
     * Regras de uso do cupom:
     * 1 - produto - pode ser utilizado apenas em produtos específicos
     * 2 - clients - pode ser utilizado apenas por clientes específicos
     * 3 - clients e products - pode ser utilizado somente em produtos e clientes específicos
     * 4 - pode ser utilizado por qualquer cliente em qualquer pedido
     */

    // uso tansaction por garantia pois são muitas operações de escrita no banco
    const trx = await Database.beginTransaction()

    var can_use_for = {
      client: false,
      product: false,
    }

    try {
      const couponData = request.only([
        'code',
        'discount',
        'valid_from',
        'valid_until',
        'quantity',
        'type',
        'recursive',
      ])
      // crio o cupom
      var coupon = await Coupon.create(couponData, trx)
      // incia o service para sync entre cupons e: products, orders e users
      const service = new Service(coupon, trx)
      const { users, products } = request.only(['users', 'products'])

      // se existirem usuários, relaciona o usuário ao cupom usando o syncUser
      if (users && users.length > 0) {
        await service.syncUsers(users)
        can_use_for.client = true //esse cupom pode ser usado agora para clientes específicos
      }

      // se existirem produtos, relaciona o produto ao cupom usando o syncProduct
      if (products && products.length > 0) {
        await service.syncProducts(products)
        can_use_for.product = true //esse cupom pode ser usado agora para clientes e para produtos específicos
      }

      if (can_use_for.product && can_use_for.clent) {
        coupon.can_use_for = 'product_client'
      } else if (can_use_for.product && !can_use_for.client) {
        coupon.can_use_for = 'product'
      } else if (!can_use_for.product && can_use_for.client) {
        coupon.can_use_for = 'client'
      } else {
        coupon.can_use_for = 'all'
      }

      await coupon.save(trx)
      await trx.commit()

      //transformer
      coupon = await transform.include('users', 'products').item(coupon, Transformer)
      return response.status(201).send(coupon)
    } catch (error) {
      await trx.rollback()
      return response.status(400).send({ message: 'Não foi possível criar o cupom' })
    }
  }

  /**
   * Display a single coupon.
   * GET coupons/:id
   *
   * @param {object} ctx.params
   * @param {Response} ctx.response
   */
  async show({ params, response }) {
    const coupon = await Coupon.findOrFail(params.id)
    coupon = await transform.include('users', 'products', 'orders').item(coupon, Transformer)
    return response.send(coupon)
  }

  /**
   * Update coupon details.
   * PUT or PATCH coupons/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {Transformer} ctx.transform
   */
  async update({ params, request, response, transform }) {
    const trx = await Database.beginTransaction()
    var coupon = await Coupon.findOrFail(params.id)

    var can_use_for = {
      client: false,
      product: false,
    }

    try {
      const couponData = request.only([
        'code',
        'discount',
        'valid_from',
        'valid_until',
        'quantity',
        'type',
        'recursive',
      ])

      coupon.merge(couponData)

      const { users, products } = request.only(['users', 'products'])
      const service = new Service(coupon, trx)

      if (users && users.length > 0) {
        await service.syncUsers(users)
        can_use_for.client = true
      }

      if (products && products.length > 0) {
        await service.syncProducts(products)
        can_use_for.product = true
      }

      if (can_use_for.product && can_use_for.clent) {
        coupon.can_use_for = 'product_client'
      } else if (can_use_for.product && !can_use_for.client) {
        coupon.can_use_for = 'product'
      } else if (!can_use_for.product && can_use_for.client) {
        coupon.can_use_for = 'client'
      } else {
        coupon.can_use_for = 'all'
      }

      await coupon.save(trx)
      await trx.commit()

      //transform
      coupon = await transform.item(coupon, Transformer)
      return response.send(coupon)
    } catch (error) {
      await trx.rollback()
      return response.status(400).send({ message: 'Não foi possível atualizar o cupom' })
    }
  }

  /**
   * Delete a coupon with id.
   * DELETE coupons/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy({ params, request, response }) {
    const trx = await Database.beginTransaction()
    const coupon = await Coupon.findOrFail(params.id)

    try {
      await coupon.products().detach([], trx)
      await coupon.orders().detach([], trx)
      await coupon.users().detach([], trx)
      await coupon.delete(transaction)
      await transaction.commit()
      return response.status(204).send()
      await trx.rollback()
      return response.status(400).send({ message: 'Não foi possível excluir o cupom' })
    }
  }
}

module.exports = CouponController
