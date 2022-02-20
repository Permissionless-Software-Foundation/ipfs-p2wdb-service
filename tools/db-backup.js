/*
 Backup tool for P2WDB
*/
const axios = require('axios')
const fs = require('fs')
// Customize these constants for your migration.

// Entry endpoint
const SERVER = 'http://localhost:5001/'

const path = 'backup/' // backup folder path

const maxEntreis = 100 // max entries per file
// retrieves every record in the database
// and writes them to .json files in the backup/ folder.
async function start () {
  try {
    console.log('Start!')
    // Creates the backup directory if it doesn't exist
    createBackupDir(path)

    let fileData = [] // Entries array that will be writen in the json
    let page = 0 // number of pages to search
    let i = 0 // first index of the json file
    let j = 0 // last index of the json file
    let data
    do {
      // fetch entry by pages (each page retrieves 20 datas)
      console.log('Fetch page', page)
      const result = await axios.get(`${SERVER}entry/all/${page}`)
      data = result.data.data

      // concatenates the entries
      fileData = [...fileData, ...data]

      // Write the json file when we have 100 entries
      // or when there are no more entries left
      if (fileData.length >= maxEntreis || !data.length) {
        j = i + (fileData.length - 1)
        const backupPath = `${path}${i}-${j}.json`
        await writeJSON(fileData, backupPath)
        fileData = []
        i = j + 1
      }
      page++
    } while (data.length)
    // console.log('data: ', data)

    console.log('Success!')
  } catch (err) {
    console.log('Error in start(): ', err.message)
  }
}
// Create the backup directory if it doesn't exists
function createBackupDir (path) {
  try {
    const exist = fs.existsSync(path)
    if (!exist) {
      fs.mkdirSync(path)
      // const created = fs.mkdirSync(path)
    }
    return true
  } catch (error) {
    console.log('Error in createBackupDir()', error)
    throw error
  }
}

// Writes out a JSON file of any object passed to the function.
function writeJSON (obj, fileName) {
  return new Promise(function (resolve, reject) {
    try {
      if (!obj) {
        throw new Error('obj property is required')
      }
      if (!fileName || typeof fileName !== 'string') {
        throw new Error('fileName property must be a string')
      }
      const fileStr = JSON.stringify(obj, null, 2)

      fs.writeFile(fileName, fileStr, function (err) {
        if (err) {
          console.error('Error while trying to write file: ')
          throw err
        } else {
          // console.log(`${fileName} written successfully!`)
          return resolve()
        }
      })
    } catch (err) {
      console.error('Error trying to write out object in util.js/_writeJSON().')
      return reject(err)
    }
  })
}

start()
