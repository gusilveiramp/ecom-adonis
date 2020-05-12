'use strict'

/*
|--------------------------------------------------------------------------
| AdminSeeder
|--------------------------------------------------------------------------
|
| Make use of the Factory instance to seed database with dummy data or
| make use of Lucid models directly.
|
*/

/** @type {import('@adonisjs/lucid/src/Factory')} */
const Factory = use('Factory')
const Role = use('Role')
const User = use('App/Models/User')

class AdminSeeder {
  async run() {
    const user = await User.create({
      name: 'Admin',
      surname: 'Admin',
      email: 'admin@admin.com',
      password: 'secret',
    })

    const adminRole = await Role.findBy('slug', 'admin')
    await user.roles().attach([adminRole.id])
  }
}

module.exports = AdminSeeder
