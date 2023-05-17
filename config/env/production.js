/*
  These are the environment settings for the PRODUCTION environment.
  This is the environment run with `npm start` if KOA_ENV=production.
  This is the environment run inside the Docker container.

  It is assumed the MonogDB Docker container is accessed by port 5555
  so as not to conflict with the default host port of 27017 for MongoDB.
*/
const mongoPort = process.env.MONGO_PORT ? process.env.MONGO_PORT : 5666
export const session = 'secret-boilerplate-token'
export const token = 'secret-jwt-token'
export const database = process.env.DBURL
  ? process.env.DBURL
  : `mongodb://172.17.0.1:${mongoPort}/ipfs-service-prod`
export const env = 'prod'
export default {
  session,
  token,
  database,
  env
}
