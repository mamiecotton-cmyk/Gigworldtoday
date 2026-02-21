const zipcodes = require('zipcodes');
const fs = require('fs');

// Courial's service ZIPs
const courialZips = [
  '30301', '30297', '30144', '78701', '78617', '01730', '02108', '01803',
  '60606', '60015', '60169', '43215', '80202', '48201', '48375', '76010',
  '75201', '76262', '21202', '22030', '21701', '20850', '20001', '77001',
  '91761', '90210', '91301', '91502', '91203', '90301', '90802', '90012',
  '90266', '91101', '90670', '90401', '90503', '89109', '33130', '10451',
  '11201', '07042', '07030', '10001', '11354', '10601', '10701', '92626',
  '92701', '19101', '85201', '85004', '97201', '27601', '95814', '92101',
  '98104', '94704', '94010', '94025', '94612', '94901', '94040', '94607',
  '94301', '94063', '94804', '94070', '94101', '95113', '94402', '95066',
  '95054', '94080', '94086', '33755', '33602', '85701'
];

const RADIUS_MILES = 60;

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Get all US ZIP codes and filter to those within 60 miles
const allZips = zipcodes.codes;
const coverageSet = new Set();

console.log('Calculating coverage area...');

courialZips.forEach((serviceZip, index) => {
  const serviceInfo = zipcodes.lookup(serviceZip);
  if (!serviceInfo) {
    console.log(`Warning: ${serviceZip} not found`);
    return;
  }
  
  const serviceLat = parseFloat(serviceInfo.latitude);
  const serviceLon = parseFloat(serviceInfo.longitude);
  
  // Check every US ZIP code
  Object.keys(allZips).forEach(testZip => {
    const testInfo = zipcodes.lookup(testZip);
    if (!testInfo) return;
    
    const testLat = parseFloat(testInfo.latitude);
    const testLon = parseFloat(testInfo.longitude);
    
    const distance = calculateDistance(serviceLat, serviceLon, testLat, testLon);
    
    if (distance <= RADIUS_MILES) {
      coverageSet.add(testZip);
    }
  });
  
  console.log(`Processed ${index + 1}/${courialZips.length}: ${serviceZip}`);
});

// Convert to array and save
const coverageArray = Array.from(coverageSet).sort();

const output = {
  platform: 'courial',
  radiusMiles: RADIUS_MILES,
  serviceZips: courialZips,
  coveredZips: coverageArray,
  totalCoverage: coverageArray.length,
  generatedAt: new Date().toISOString()
};

fs.writeFileSync(
  'lib/platform-coverage/courial.json',
  JSON.stringify(output, null, 2)
);

console.log(`\nDone! Courial covers ${coverageArray.length} ZIP codes.`);
console.log(`Saved to lib/platform-coverage/courial.json`);
