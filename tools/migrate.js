/*
  This script is used to migrate data from one database to another. If significant
  changes are made to the ACL, then the database will need to be renamed and
  data migrated.
*/

const axios = require('axios')

// Customize these constants for your migration.
const OLD_DB = 'http://192.168.0.76:5001/p2wdb'
const NEW_DB = 'http://localhost:5001/p2wdb'

// Delay (in milliseconds) between posting each entry from the old DB to the new DB.
const DELAY = 10000

async function start () {
  try {
    // Read all the data from the old database.
    const result = await axios.get(`${OLD_DB}`)
    const data = result.data.data
    console.log('data: ', data)

    // Generate an array of keys from the key-value store.
    const keys = Object.keys(data)
    console.log('keys: ', keys)
    // console.log('data[2]: ', data[keys[2]])

    for (let i = 0; i < keys.length; i++) {
      const thisKey = keys[i]
      const thisValue = data[thisKey]

      // Submit the txid as proof-of-burn to write data to the database.
      const result = await axios.post(NEW_DB, {
        txid: thisKey,
        message: thisValue.message,
        signature: thisValue.signature,
        data: thisValue.data
      })
      console.log(
        `\n\nResponse from API: ${JSON.stringify(result.data, null, 2)}`
      )

      await sleep(DELAY)
    }

    console.log('Migration complete!')
  } catch (err) {
    console.log('Error in start(): ', err)
  }
}
start()

function sleep (ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
