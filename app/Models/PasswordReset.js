'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class PasswordReset extends Model {
  static boot() {
    super.boot()

    this.addHook('beforeCreate', async (model) => {
      model.token = await str_random(25) // gera string randomica
      const expires_at = new Date()
      expires_at.setMinutes(expires_at.getMinutes() + 30)
      model.expires_at = expires_at
    })
  }

  /**
   * Lucid vai executar os metodos GET (Getters) automaticamente ao instaciar o model
   */

  /**
   * Formata os valores para o padrão ISO (aceito pelo Postgres, MySQL)
   * 2020-03-17T08:40:252Z
   */
  static get dates() {
    return ['created_at', 'updated_at', 'expires_at']
  }
}

module.exports = PasswordReset
