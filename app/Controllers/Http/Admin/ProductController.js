'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const Product = use('App/Models/Product')
const Transformer = use('App/Models/Admin/ProductTransformer')

/**
 * Resourceful controller for interacting with products
 */
class ProductController {
  /**
   * Show a list of all products.
   * GET products
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {object} ctx.pagination
   * @param {Transformer} ctx.transform
   */
  async index({ request, response, pagination, transform }) {
    const name = request.input('name')
    const query = Product.query()

    /**
     * Busca produto pelo nome
     */
    if (name) {
      query.where('name', 'ILIKE', `%${name}%`)
    }

    var products = await query.paginate(pagination.page, pagination.limit)
    products = await transform.paginate(products, Transformer)
    return response.send(products)
  }

  /**
   * Create/save a new product.
   * POST products
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {Transformer} ctx.transform
   */
  async store({ request, response, transform }) {
    try {
      const { name, description, price, image_id } = request.all()
      var product = await Product.create({
        name,
        description,
        price,
        image_id,
      })
      product = await transform.item(product, Transformer)
      return response.status(201).send(product)
    } catch (error) {
      return response.status(400).send({ message: 'Não foi possível criar o produto' })
    }
  }

  /**
   * Display a single product.
   * GET products/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async show({ params, request, response }) {
    const product = await Product.findOrFail(params.id)
    return response.send(product)
  }

  /**
   * Update product details.
   * PUT or PATCH products/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {Transformer} ctx.transform
   */
  async update({ params, request, response, transform }) {
    try {
      var product = await Product.findOrFail(params.id)
      const { name, description, price, image_id } = request.all()
      product.merge({ name, description, price, image_id })
      await product.save()
      //transoformer
      product = await transform.item(product, Transformer)
      return response.send(product)
    } catch (error) {
      return response.status(400).send({ message: 'Não foi possível atualizar o produto' })
    }
  }

  /**
   * Delete a product with id.
   * DELETE products/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy({ params, request, response }) {
    try {
      const product = await Product.findOrFail(params.id)
      await product.delete()
      return response.status(204).send()
    } catch (error) {
      return response.status(500).send({ message: 'Não foi possível excluir o produto' })
    }
  }
}

module.exports = ProductController
