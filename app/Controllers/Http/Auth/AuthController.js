'use strict'

const Database = use('Database')
const User = use('App/Models/User')
const Role = use('Role')

class AuthController {
  async register({ request, response }) {
    /**
     * As Transactions são operações seguras, que não são refletidas no banco de dados
     * até e a menos que você confirme explicitamente suas alterações.
     * Devem definitivamente ser usadas sempre que houver uma operação de ESCRITA NO BD
     */
    const trx = await Database.beginTransaction()
    // O trx precisa ficar fora do try catch
    try {
      const { name, surname, email, password } = request.all()
      // aqui eu uso a transaction para garantir que os dados sejam persistidos no BD somente se der tudo certo.
      const user = await User.create({ name, surname, email, password }, trx)
      const userRole = await Role.findBy('slug', 'client')
      await user.roles().attach([userRole.id], null, trx)
      await trx.commit()
      return response.status(201).send({ data: user })
    } catch (error) {
      await trx.rollback()
      return response.status(400).send({ message: 'Erro ao realizar cadastro' })
    }
  }

  /**
   *
   * @param {ctx.request} object
   * @param {ctx.response} object
   * @param {ctx.auth} object
   */
  async login({ request, response, auth }) {
    const { email, password } = request.all()

    let data = await auth.withRefreshToken().attempt(email, password)

    return response.send({ data })
  }

  async refresh({ request, response, auth }) {
    var refresh_token = request.input('refresh_token')

    if (!refresh_token) {
      refresh_token = request.header('refresh_token')
    }

    // gera um novo refresh token e um novo token para o refresh token
    const user = await auth
      .newRefreshToken()
      .generateForRefreshToken(refresh_token)

    return response.send({ data: user })
  }

  async logout({ request, response, auth }) {
    let refresh_token = request.input('refresh_token')

    if (!refresh_token) {
      refresh_token = request.header('refresh_token')
    }

    await auth.authenticator('jwt').revokeTokens([refresh_token], true)
    return response.status(204).send({})
  }

  async forgot({ request, response }) {
    //
  }

  async remember({ request, response }) {
    //
  }

  async reset({ resquest, response }) {
    //
  }
}

module.exports = AuthController
