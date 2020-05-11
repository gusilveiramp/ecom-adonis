'use strict'

const Database = use('Database')

class OrderService {
  constructor(model, trx = false) {
    this.model = model
    this.trx = trx
  }

  async syncItems(items) {
    if (!Array.isArray(items)) {
      return false
    }
    await this.model.items().delete(this.trx)
    await this.model.items().createMany(items, this.trx)
  }

  async updateItems(items) {
    /**
     * Pego todos os itens da base de dados, quando eles forem iguais ao
     * id que eu passei, ele deleta o item do relacionamento com o model
     */
    let currentItems = await this.model
      .items()
      .whereIn(
        'id',
        items.map((item) => item.id)
      )
      .fetch()
    // deleta os itens que o user não quer mais
    await this.model
      .items()
      .whereNotInt(
        'id',
        items.map((item) => item.id)
      )
      .delete(this.trx)

    // atualiza os valores e quantidade dos itens que ele quer
    await Promise.all(
      currentItems.rows.map(async (item) => {
        // item é um dos itens q eu srecebi da base de dados.
        // fill remove todos os valores do item e atualiza o restante para null
        // aqui estamos comparando 2 arrays e mesclando seus valores
        item.fill(items.find((n) => n.id === item.id))
        await item.save(this.trx)
      })
    )
  }

  /**
   * Verifica se pode ser aplicado o desconto
   */
  async canApplyDiscount(coupon) {
    /**
     * validação pela data
     */
    const now = new Date().getTime()
    if (
      now > coupon.valid_from.getTime() ||
      (typeof coupon.valid_until == 'object' && coupon.valid_until.getTime() < now)
    ) {
      // verifica se o cupom já entrou em validade
      // veridica se há uma data de expiração
      // se houver, verifica se o cupom expirou
      return false
    }

    // pluck traz um array com os ids de todos os products onde o coupon_id for igual ao coupon.id que estamos informando
    const couponProducts = await Database.from('coupon_products').where('coupon_id', coupon.id).pluck('product_id')
    const couponClients = await Database.from('coupon_user').where('coupon_id', coupon.id).pluck('user_id')
    // verifica se o cupom não está asscoiado a produtos e clientes especificos
    if (
      Array.isArray(couponProducts) &&
      couponProducts.length < 1 &&
      Array.isArray(couponClients) &&
      couponClients < 1
    ) {
      /**
       * Caso não esteja associado a cliente ou produto específico, é de uso livre
       */
      return true
    }

    let isAssociatedToProducts,
      isAssociatedToClients = false

    if (Array.isArray(couponProducts) && couponProducts.length > 0) {
      isAssociatedToProducts = true
    }

    if (Array.isArray(couponClients) && couponClients.length > 0) {
      isAssociatedToClients = true
    }

    // comparação quais produtos o cliente da desconto e quais produtos o cliente comprou que da direito a desconto com esse cupom
    const productsMatch = await Database.from('order_items')
      .where('order_id', this.model.id)
      .whereIn('product_id', couponProducts)
      .pluck('product_id')

    /**
     * Case de uso 1 - O cupom está associado a clientes e produtos
     */
    if (isAssociatedToClients && isAssociatedToProducts) {
      // aqui ele vai mapear essa lista de inteiros (couponClients) e trazer os clientes que baterem com o do cupom
      const clientMatch = couponClients.find((client_id) => client_id === this.model.user_id) // find é igual o filter do js
      // se existir algum cliente, retorna true
      if (clientMatch && Array.isArray(productsMatch) && productsMatch.length > 0) {
        return true
      }
    }
    /**
     * Caso de uso 2 - o cupom está associado apenas a produto
     */
    if (isAssociatedToProducts && Array.isArray(productsMatch) && productsMatch.length > 0) {
      return true
    }
    /**
     * Caso de uso 3 - o cupom está associado a um ou mais clientes (e nenhum produto)
     */
    // verificamos se o cliente que está fazendo a compra é um desses clientes que tem diretio a usar esse cupom
    if (isAssociatedToClients && Array.isArray(couponClients) && couponClients.length > 0) {
      // verifica se o cliente q ta comprando ta na lista do clientes que tem direito a usar o cupom
      const match = couponClients.find((client) => client === this.model.user_id)
      if (match) {
        return true
      }
    }
    /**
     * Caso de uso 4 - nen huma das verificações acima deram positivas
     * então o cupom está associado a clientes ou produtos ou ambos
     * porém nenhum dos produtos deste pedido está elegível ao desconto
     * e o cliente que fez a compra também não poderá utilizar este cupom
     */
    return false
  }
}

module.exports = OrderService
