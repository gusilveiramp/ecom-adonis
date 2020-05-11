'use strict'

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')

/**
 * Admin Routes
 */
Route.group(() => {
  /**
   * Category
   */
  Route.resource('categories', 'CategoryController')
    .apiOnly()
    .validator(
      // passando Validator para rotas resource
      // nome da rota | caminho do validator
      new Map([
        [['categories.store'], ['Admin/StoreCategory']],
        [['categories.update'], ['Admin/StoreCategory']],
      ])
    )
  /**
   * Product
   */
  Route.resource('products', 'ProductController').apiOnly()
  /**
   * Users
   */
  Route.resource('users', 'UserController')
    .apiOnly()
    .validator(
      new Map([
        [['users.store'], ['Admin/StoreUser']],
        [['users.update'], ['Admin/StoreUser']],
      ])
    )
  /**
   * Images
   */
  Route.resource('images', 'ImageController').apiOnly()
  /**
   * Cupons
   */
  Route.resource('coupons', 'CouponController').apiOnly()
  /**
   * Orders
   */
  Route.post('orders/:id/discount', 'OrderController.applyDiscount')
  Route.delete('orders/:id/discount', 'OrderController.removeDiscount')
  Route.resource('orders', 'OrderController')
    .apiOnly()
    .validator(new Map([[['orders.store'], ['Admin/StoreOrder']]]))
})
  .prefix('v1/admin')
  .namespace('Admin')
  .middleware(['auth', 'is:( admin || manager )'])
