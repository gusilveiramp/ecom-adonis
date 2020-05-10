'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')
const Env = use('Env')

class Image extends Model {
  static get computed() {
    return ['url']
  }
  /**
   * Retorna a URL da imagem
   * @param {modelInstance.string} param
   */
  getUrl({ path }) {
    return `${Env.get('APP_URL')}/images/${path}`
  }
}

module.exports = Image
