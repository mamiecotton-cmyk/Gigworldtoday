const fs = require('fs');
const fetch = global.fetch || require('node-fetch');
const platforms = JSON.parse(fs.readFileSync('src/data/platforms.json','utf8'));
const missing = platforms.filter(x=>!x.applyUrl||String(x.applyUrl).trim()==='');

const candidates = [
  '/signup', '/signup/driver', '/signup/driver/', '/signup/deliver', '/signup/deliver/',
  '/apply', '/apply/', '/apply/driver', '/apply/driver/', '/join', '/join/', '/join-us', '/join-us/',
  '/become-a-driver', '/become-a-driver/', '/drivers', '/drivers/apply', '/drivers/apply/', '/driver', '/driver/apply',
  '/couriers', '/couriers/apply', '/deliver/signup', '/driver-signup', '/join-driver', '/careers', '/jobs'
];

const timeoutMs = 10000;

function domainFrom(urlOrId){
  if(!urlOrId) return null;
  try{
    const u = new URL(urlOrId);
    return u.origin;
  }catch(e){
    // try to build from id
    if(String(urlOrId).includes('.')){
      return 'https://' + urlOrId.replace(/^https?:\/\//,'');
    }
    return null;
  }
}

(async ()=>{
  const results = {};
  for(const p of missing){
    const id = p.id || p.slug || p.name;
    const base = domainFrom(p.websiteUrl) || domainFrom(p.website) || `https://${p.id || p.slug}.com`;
    results[id] = { name: p.name, candidates: [], base };
    for(const path of candidates){
      const url = base.replace(/\/$/,'') + path;
      const controller = new AbortController();
      const t = setTimeout(()=>controller.abort(), timeoutMs);
      try{
        const res = await fetch(url, { method: 'GET', redirect: 'follow', signal: controller.signal });
        clearTimeout(t);
        const status = res.status;
        if(status>=200 && status<400){
          let text = '';
          try{ text = await res.text(); } catch(e){}
          const lowered = (text||'').toLowerCase();
          const hint = (path + ' ' + (lowered.includes('driver')? 'driver':'') + (lowered.includes('courier')? 'courier':'' ) + (lowered.includes('deliver')? 'deliver':'' ) + (lowered.includes('apply')? 'apply':'' )).trim();
          results[id].candidates.push({ url, status, hint });
          // stop if strong match in path or content
          if(/driver|courier|apply|signup|join|deliver/i.test(path) || /driver|courier|deliver|apply|join|sign up|signup/i.test(lowered)){
            // keep searching to collect multiple matches
          }
        }
      }catch(err){
        clearTimeout(t);
        // ignore errors
      }
    }
  }
  console.log(JSON.stringify(results,null,2));
})();
