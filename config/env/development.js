/*
  These are the environment settings for the DEVELOPMENT environment.
  This is the environment run by default with `npm start` if KOA_ENV is not
  specified.
*/

export default {
  session: 'secret-boilerplate-token',
  token: 'secret-jwt-token',
  database: 'mongodb://localhost:27017/p2wdb-service-dev',
  env: 'dev'
}
