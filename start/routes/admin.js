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
  Route.resource('categories', 'CategoryController').apiOnly()
  /**
   * Product
   */
  Route.resource('products', 'ProductController').apiOnly()
  /**
   * Users
   */
  Route.resource('users', 'UserController').apiOnly()
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
  Route.resource('orders', 'OrderController').apiOnly()
})
  .prefix('v1/admin')
  .namespace('Admin')
  .middleware(['auth', 'is:( admin || manager )'])
