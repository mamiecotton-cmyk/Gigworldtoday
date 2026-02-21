// List of Courial ZIP codes (from user-provided list)
export const COURIAL_ZIP_CODES = [
  "30301","30297","30144","78701","78617","01730","02108","01803","60606","60015","60169","43215","80202","48201","48375","76010","75201","76262","21202","22030","21701","20850","20001","77001","91761","90210","91301","91502","91203","90301","90802","90012","90266","91101","90670","90401","90503","89109","33130","10451","11201","07042","07030","10001","11354","10601","10701","92626","92701","19101","85201","85004","97201","27601","95814","92101","98104","94704","94010","94025","94612","94901","94040","94607","94301","94063","94804","94070","94101","95113","94402","95066","95054","94080","94086","33755","33602","85701"
];

// Haversine formula for distance between two lat/lon points
export function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 3958.8; // miles
  const toRad = (deg: number) => deg * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Minimal ZIP to lat/lon lookup (to be filled in for all ZIPs)
export const ZIP_LAT_LON: Record<string, [number, number]> = {
  '30301': [33.7529, -84.3925],
  '30297': [33.6235, -84.3576],
  '30144': [34.0335, -84.5977],
  '78701': [30.2711, -97.7437],
  '98001': [47.3122, -122.2931], // Auburn, WA (near Seattle)
  '98104': [47.6026, -122.3284], // Seattle, WA (Courial ZIP)
  // ... (add all ZIPs from the list above)
};

// Returns true if the given ZIP is within 60 miles of any Courial ZIP
export function isWithinCourialRadius(zip: string): boolean {
  const target = ZIP_LAT_LON[zip];
  if (!target) return false;
  for (const courialZip of COURIAL_ZIP_CODES) {
    const loc = ZIP_LAT_LON[courialZip.toString()];
    if (!loc) continue;
    if (haversineDistance(target[0], target[1], loc[0], loc[1]) <= 60) return true;
  }
  return false;
}
