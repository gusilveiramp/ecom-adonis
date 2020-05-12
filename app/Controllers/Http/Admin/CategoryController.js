'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const Category = use('App/Models/Category')
const Transformer = use('App/Transformers/Admin/CategoryTransformer')

/**
 * Resourceful controller for interacting with categories
 */
class CategoryController {
  /**
   * Show a list of all categories.
   * GET categories
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {Transformer} ctx.transform
   * @param {object} ctx.pagination
   */
  async index({ request, response, transform, pagination }) {
    /**
     * Busca por titulo
     */
    const title = request.input('title')
    const query = Category.query()
    if (title) {
      // % no inicio (encontre algo que termine com o title)
      // % no final (encontre algo que comece com o title)
      // % no inicio e no final (não importa, traga tudo q tenha o title)
      query.where('title', 'ILIKE', `%${title}%`)
    }

    /**
     * pagination vem do middleware pagination, que é um middleware global aplicado
     * em todas as requisições do tipo GET
     */
    var categories = await query.paginate(pagination.page, pagination.limit)
    categories = await transform.paginate(categories, Transformer)
    return response.send(categories)
  }

  /**
   * Create/save a new category.
   * POST categories
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {Transformer} ctx.transform
   */
  async store({ request, response, transform }) {
    try {
      const { title, description, image_id } = request.all()
      var category = await Category.create({ title, description, image_id })
      category = await transform.item(category, Transformer)
      return response.status(201).send(category)
    } catch (error) {
      return response.status(400).send({ message: 'Erro ao processar a sua solicitação' })
    }
  }

  /**
   * Display a single category.
   * GET categories/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async show({ params, request, response }) {
    try {
      var category = await Category.findOrFail(params.id)
      category = await transform.item(category, Transformer)
      return response.send(category)
    } catch (error) {
      return response.status(404).send({ message: 'Categoria não encontrada' })
    }
  }

  /**
   * Update category details.
   * PUT or PATCH categories/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update({ params, request, response }) {
    try {
      var category = await Category.findOrFail(params.id)
      const { title, description, image_id } = request.all()
      // merge adiciona os novos valores ao objeto category
      category.merge({ title, description, image_id })
      await category.save()
      // transformo o objeto
      category = await transform.item(category, Transformer)
      return response.send(category)
    } catch (error) {
      return response.status(404).send({ message: 'Não foi possível atualizar a categoria' })
    }
  }

  /**
   * Delete a category with id.
   * DELETE categories/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy({ params, request, response }) {
    try {
      const category = await Category.findOrFail(params.id)
      await category.delete()
      // 204 = ok, mas sem body.
      return response.status(204).send()
    } catch (error) {
      return response.status(500).send({ message: 'Não foi possível excluir a categoria' })
    }
  }
}

module.exports = CategoryController
