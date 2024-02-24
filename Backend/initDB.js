'use strict';

const { askUser } = require('./lib/utils');
const { mongoose, connectMongoose, Anuncio } = require('./models');

const ANUNCIOS_JSON = './anuncios.json';

main().catch(err => console.error('Error!', err));

async function main() {

  await connectMongoose; 

  const answer = await askUser('¿Vaciar base de datos y cargar datos iniciales? (no) ');
  if (answer.toLowerCase() !== 'yes') {
    console.log('DB init cancelado, no se han realizado cambios');
    return process.exit(0);
  }

  const anunciosResult = await initAnuncios(ANUNCIOS_JSON);
  console.log(`\nAnuncios: Deleted ${anunciosResult.deletedCount}, loaded ${anunciosResult.loadedCount} from ${ANUNCIOS_JSON}`);

  await mongoose.connection.close();
  console.log('\nDone.');
}

async function initAnuncios(jsonDataPath) {
  const { deletedCount } = await Anuncio.deleteMany();
  const loadedCount = await Anuncio.cargaJson(jsonDataPath);
  return { deletedCount, loadedCount };
}