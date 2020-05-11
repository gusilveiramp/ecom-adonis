'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */

const Image = use('App/Models/Image')
const { manage_single_upload, manage_multiple_uploads } = use('App/Helpers')
const fs = use('fs')

/**
 * Resourceful controller for interacting with images
 */
class ImageController {
  /**
   * Show a list of all images.
   * GET images
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {object} ctx.pagination
   */
  async index({ request, response, pagination }) {
    const images = await Image.query()
      .orderBy('id', 'DESC')
      .paginate(pagination.page, pagination.limit)
    return response.send(images)
  }

  /**
   * Create/save a new image.
   * POST images
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store({ request, response }) {
    try {
      // captura uma imagem ou mais da request
      const fileJar = request.file('images', {
        types: ['image'],
        size: '2mb',
      })

      // retorno para o usuário
      let images = []
      // caso seja um único arquivo - manage_single_upload
      if (!fileJar.files) {
        const file = await manage_single_upload(fileJar)
        if (file.moved()) {
          const image = await Image.create({
            path: file.fileName, // fileName é criada pelo Adonis no fileJar
            size: file.size,
            originalName: file.clientName,
            extension: file.subtype,
          })

          images.push(image)
          return response.status(201).send({ successes: images, errors: {} })
        }
      }
      // case sejam vários arquivos - manage_multiple_uploads
      let files = await manage_multiple_uploads(fileJar)
      await Promise.all(
        files.successes.map(async (file) => {
          const image = await Image.create({
            name: file.fileName,
            size: file.size,
          })
        })
        images.push(images)
      )

      return response.status(201).send({ successes: images, errors: files.error})
    } catch (error) {
      return response.status(400).send({message: 'Não foi possível processar a sua solicitação'})
    }
  }

  /**
   * Display a single image.
   * GET images/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async show({ params, request, response }) {
    const image = await Image.findOrFail(params.id)
    return response.send(image)
  }

  /**
   * Update image details.
   * PUT or PATCH images/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update({ params, request, response }) {
    const image = await Image.findOrFail(params.id)
    try {
      //request.only retorna o objeto com os campos q eu solicitar
      image.merge(request.only(['original_name']))
      await image.save()
      response.status(200).send(image)
    } catch (error) {
      return response.status(400).send({message: 'Não foi possível atualizar a imagem'})
    }
  }

  /**
   * Delete a image with id.
   * DELETE images/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy({ params, request, response }) {
    const image = await Image.findOrFail(params.id)
    try {
      let filepath = Helpers.publicPath(`uploads/${image.path}`)

      await fs.unlink(filepath, err => {
        if(!err){
          await image.delete()
        }
        return response.status(204).send()
      })
    } catch (error) {
      return response.status(400).send({message: 'Não possível excluir a imagem'})
    }
  }
}

module.exports = ImageController
