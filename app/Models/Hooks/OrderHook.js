'use strict'

const OrderHook = (exports = module.exports = {})

/**
 * Retorna os valores do pedido com o desconto aplicado
 */
OrderHook.updateValues = async (model) => {
  /**
   * $sideLoaded armazena valores na memória temporária (virtual)
   * não pode ter um nome que seja igual a um relacionamento
   */
  model.$sideLoaded.subtotal = await model.items().getSum('subtotal')
  model.$sideLoaded.qty_items = await model.items().getSum('quantity')
  model.$sideLoaded.discount = await model.discounts().getSum('discount')

  model.total = model.$sideLoaded.subtotal - model.$sideLoaded.discount
}

/**
 * retorna os valores do pedido para uma coleção de pedidos (paginate)
 */
OrderHook.updateCollectionValues = async (models) => {
  /**
   * Para cara item da coleção ele executa o hook
   */
  for (let model of models) {
    model = await OrderHook.updateValues(model)
  }
}
