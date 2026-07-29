import initSqlJs from '../lib/db/node_modules/sql.js/dist/sql-wasm.js';
import fs from 'fs';

const dbFile = 'sustainpro.db';
const filebuffer = fs.readFileSync(dbFile);

initSqlJs().then(SQL => {
  const db = new SQL.Database(filebuffer);
  
  db.exec(`
    UPDATE pages SET hero_image = '/hero-bg.png' WHERE slug = 'home' OR slug = 'services';
    UPDATE pages SET hero_image = '/about-bg.png' WHERE slug = 'about' OR slug = 'industries' OR slug = 'software' OR slug = 'training' OR slug = 'contact';
    UPDATE pages SET hero_image = '/research-bg.png' WHERE slug = 'research';
  `);
  
  const data = db.export();
  fs.writeFileSync(dbFile, Buffer.from(data));
  console.log('Successfully updated page hero images directly in DB!');
});
