'use strict'

class StoreUser {
  get rules() {
    let userId = this.ctx.params.id
    let rule = ''

    if (userId) {
      // está atualizando o usuário
      rule = `unique:users,email,id,${userId}`
    } else {
      // está criando o usuário
      rule = 'unique:users,email|required'
    }

    return {
      email: rule,
      image_id: 'exists:images,id', // tem que existir na tabela imagem, verificando pelo id
    }
  }
}

module.exports = StoreUser
