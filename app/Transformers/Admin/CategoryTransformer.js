'use strict'

const BumblebeeTransformer = use('Bumblebee/Transformer')
const ImageTransformer = use('App/Transformers/Admin/ImageTransformer')

/**
 * CategoryTransformer class
 *
 * @class CategoryTransformer
 * @constructor
 */
class CategoryTransformer extends BumblebeeTransformer {
  //includes: inclui outro model como se fosse uma propriedade deste transformer
  defaultInclude() {
    return ['image']
  }

  /**
   * This method is used to transform the data.
   */
  transform(model) {
    return {
      id: model.id,
      title: model.title,
      description: model.description,
    }
  }

  includeImage(model) {
    return this.item(model.getRelated('image', ImageTransformer)) //trago o relacionamento do model Category chamado "image"
  }
}

module.exports = CategoryTransformer
