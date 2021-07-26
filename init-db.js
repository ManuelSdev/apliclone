'use strict';

require('dotenv').config();

const { mongoose, connectMongoose, User } = require('./models');


main().catch(err => console.error(err));

async function main() {

  // inicializo colección de Users
  await initUsers();

  mongoose.connection.close();
}

async function initUsers() {
  const { deletedCount } = await User.deleteMany();
  console.log(`Eliminados ${deletedCount} usuarios.`);

  const result = await User.insertMany([
    {
      username: 'Juan',
      email: 'admin@example.com',
      //password: await User.hashPassword('1234')
      password: 'laki'
    },
    {
      username: 'Paco',
      email: 'jamg44@gmail.com',
      //password: await User.hashPassword('1234')
      password: 'laki'
    }
  ]);
  console.log(`Insertados ${result.length} usuario${result.length > 1 ? 's' : ''}.`)
}