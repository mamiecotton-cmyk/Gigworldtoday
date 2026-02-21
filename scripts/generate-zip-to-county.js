const fs = require('fs');
const path = require('path');

// Read geo-data.csv
const csv = fs.readFileSync(path.join(__dirname, '../lib/us-state-county-zip/geo-data.csv'), 'utf8');
const lines = csv.split('\n');
const header = lines[0].split(',');
const zipToCounty = {};

for (let i = 1; i < lines.length; i++) {
  const row = lines[i];
  if (!row.trim()) continue;
  const cols = row.split(',');
  const zipcode = cols[3];
  const county = cols[4];
  const state = cols[2];
  if (zipcode && county && state) {
    zipToCounty[zipcode] = { county, state };
  }
}

fs.writeFileSync(
  path.join(__dirname, '../lib/zip-to-county.json'),
  JSON.stringify(zipToCounty, null, 2)
);

console.log('zip-to-county.json generated with', Object.keys(zipToCounty).length, 'ZIP codes.');
