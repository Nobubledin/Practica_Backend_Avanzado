'use strict'

require('dotenv').config()

const { askUser } = require('./lib/utils')
const { mongoose, connectMongoose, Anuncio, Usuario } = require('./models')

const ANUNCIOS_JSON = './anuncios.json'
const i18nConfigure = require('./lib/i18nConfigure')

main().catch(err => console.error('Error!', err))

async function main () {
  await connectMongoose;

  const answer = await askUser('Are you sure you want to empty DB and load initial data? (no) ')
  if (answer.toLowerCase() !== 'yes') {
    console.log('DB init aborted! nothing has been done')
    return process.exit(0)
  }

  const anunciosResult = await initAnuncios(ANUNCIOS_JSON)
  console.log(`\nAnuncios: Deleted ${anunciosResult.deletedCount}, loaded ${anunciosResult.loadedCount} from ${ANUNCIOS_JSON}`)

  const usuariosResult = await initUsuarios()
  console.log(`\nUsuarios: Deleted ${usuariosResult.deletedCount}, loaded ${usuariosResult.loadedCount.length}`)


  await mongoose.connection.close()
  console.log('\nDone.')
  return process.exit(0)
}

async function initAnuncios (fichero) {
  const { deletedCount } = await Anuncio.deleteMany()
  const loadedCount = await Anuncio.cargaJson(fichero)
  return { deletedCount, loadedCount }
}

async function initUsuarios () {
  const { deletedCount } = await Usuario.deleteMany()
  const loadedCount = await Usuario.insertMany([
    {name: 'user', email: 'user@example.com', password: Usuario.hashPassword('1234')},
  ])
  return { deletedCount, loadedCount }
}