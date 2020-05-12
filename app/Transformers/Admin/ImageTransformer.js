'use strict'

const BumblebeeTransformer = use('Bumblebee/Transformer')

/**
 * ImageTransformer class
 *
 * @class ImageTransformer
 * @constructor
 */
class ImageTransformer extends BumblebeeTransformer {
  /**
   * This method is used to transform the data.
   */
  model = model.toJSON()
  transform(model) {
    return {
      id: model.id, //image.id
      url: model.url,
      size: model.size,
      original_name: model.original_name,
      extension: model.extension,
    }
  }
}

module.exports = ImageTransformer
