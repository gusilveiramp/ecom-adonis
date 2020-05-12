'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */

const Database = use('Database')
const Service = use('App/Services/Order/OrderService')
const Transformer = use('App/Transformers/Admin/OrderTransformer')

const Order = use('App/Models/Order')
const Coupon = use('App/Models/Coupon')
const Discount = use('App/Models/Discount')

/**
 * Resourceful controller for interacting with orders
 */
class OrderController {
  /**
   * Show a list of all orders.
   * GET orders
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {object} ctx.pagination
   * @param {Transformer} ctx.transform
   */
  async index({ request, response, pagination, transform }) {
    const { status, id } = request.only(['status', 'id'])
    const query = Order.query()

    if (status && id) {
      query.where('status', status).orWhere('id', 'ILIKE', `%${id}}%`)
    } else if (status) {
      query.where('status', status)
    } else if (id) {
      query.orWhere('id', 'ILIKE', `%${id}}%`)
    }

    var orders = await query.paginate(pagination.page, pagination.limit)
    orders = await transform.paginate(orders, Transformer)
    return response.send(orders)
  }

  /**
   * Create/save a new order.
   * POST orders
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {Transformer} ctx.transform
   */
  async store({ request, response, transform }) {
    const trx = await Database.beginTransaction()
    try {
      const { user_id, items, status } = request.all() // aqui tb poderia usar o only()

      var order = await Order.create({ user_id, status }, trx)
      const service = new Service(order, trx)

      if (items && items.length > 0) {
        await service.syncItems(items)
      }

      await trx.commit()
      order = await transform.item(order, Transformer)
      return response.status(201).send(order)
    } catch (error) {
      await trx.rollback()
      return response.status(400).send({ message: 'Não foi possível criar o pedido' })
    }
  }

  /**
   * Display a single order.
   * GET orders/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
    * @param {Transformer} ctx.transform
   */
  async show({ params, request, response, transform }) {
    var order = await Order.findOrFail(params.id)
    order = await transform.item(order Transformer)
    return response.send(order)
  }

  /**
   * Update order details.
   * PUT or PATCH orders/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {Transformer} ctx.transform
   */
  async update({ params, request, response, transform }) {
    var order = await Order.findOrFail(params.id)
    const trx = await Database.beginTransaction()
    try {
      const { user_id, items, status } = request.all()
      order.merge({ user_id, status })

      const service = new Service(order, trx)
      await service.updateItems(items)
      await order.save(trx)
      await trx.commit()

      order = await transform.item(order, Transformer)
      return response.send(order)
    } catch (error) {
      trx.rollback()
      return response.status(400).send({ message: 'Não foi possível atualizar o pedido' })
    }
  }

  /**
   * Delete a order with id.
   * DELETE orders/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy({ params, request, response }) {
    const order = await Order.findOrFail(params.id)
    const trx = await Database.beginTransaction()

    try {
      await order.items().delete(trx)
      await order.coupons().delete(trx)
      await order.delete(trx)
      await trx.commit()
      await response.status(204).send()
    } catch (error) {
      await trx.rollback()
      return response.status(400).send({ message: 'Não foi possível excluir o pedido' })
    }
  }

  async applyDiscount({ params, request, response }) {
    const { code } = request.all()
    const coupon = await Coupon.findByOrFail('code', code.toUpperCase()) //busco em uppercase pq estamos salvando os cupons assim no BD
    const order = await Order.findOrFail(params.id)

    var discount,
      info = {}

    try {
      const service = new Service(order)
      const canAddDiscount = await service.canApplyDiscount(coupon)
      const orderDiscount = await order.coupons().getCount() // getCount() é um método do adonis que conta quantos relacionamentos existem aqui e traz isso pra mim

      // verifica se não tem nenhum cupom aplicado a esse pedido
      // ou se tem algum cupom, verifica se esse cupom é recursivo (ou seja, se pode ser utilizado em conjunto com outros pedidos/produtos)
      const canApplyToOrder = orderDiscount < 1 || (orderDiscount >= 1 && coupon.recursive)
      if (canAddDiscount && canApplyToOrder) {
        // to criando um desconto, mas não to passando nenhum valor
        // o valor está sendo pego diretamente do nosso Hook
        discount = await Discount.findOrCreate({
          order_id: order.id,
          coupon_id: coupon.id,
        })
        info.message = 'Cupom aplicado com sucesso'
        info.success = true
      } else {
        info.message = 'Não foi possível aplicar este cupom'
        info.success = false
      }

      return response.send({ order, info })
    } catch (error) {
      return response.status(400).send({ message: 'Erro ao aplicar o cupom' })
    }
  }

  async removeDiscount({ request, response }) {
    const { discount_id } = request.all()
    const discount = await Discount.findOrFail(discount_id)
    await discount.delete()
    return response.status(204).send()
  }
}

module.exports = OrderController
