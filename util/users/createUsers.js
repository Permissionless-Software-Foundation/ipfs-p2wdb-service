import mongoose from 'mongoose'
import config from '../../config/index.js'
import User from '../../src/models/users'
const EMAIL = 'test@test.com'
const PASSWORD = 'pass'
async function addUser () {
  // Connect to the Mongo Database.
  mongoose.Promise = global.Promise
  mongoose.set('useCreateIndex', true) // Stop deprecation warning.
  await mongoose.connect(config.database, { useNewUrlParser: true, useUnifiedTopology: true })
  const userData = {
    email: EMAIL,
    password: PASSWORD
  }
  const user = new User(userData)
  // Enforce default value of 'user'
  user.type = 'user'
  await user.save()
  await mongoose.connection.close()
  console.log(`User ${EMAIL} created.`)
}
addUser()
export { addUser }
export default {
  addUser
}
