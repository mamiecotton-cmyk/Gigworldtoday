const fs=require('fs');const fetch=require('node-fetch');
const platforms=JSON.parse(fs.readFileSync('src/data/platforms.json','utf8'));
const missing=platforms.filter(p=>!p.applyUrl||String(p.applyUrl).trim()==='');
const paths=['/apply','/signup','/signup/driver','/drivers','/become-a-driver','/join','/driver-signup','/join-us','/deliver/signup','/driver','/apply/driver','/drivers/apply','/join-driver','/careers','/jobs'];
const timeout=8000;
(async()=>{
  const results={};
  for(const p of missing){
    const id=p.id||p.slug||p.name;
    const base=(p.websiteUrl||p.website||(`https://${(p.id||p.slug||p.name).replace(/\s+/g,'').toLowerCase()}.com`)).replace(/\/$/,'');
    results[id]={name:p.name, base, matches:[]};
    for(const path of paths){
      const url=base+path;
      try{
        const controller=new AbortController();
        const t=setTimeout(()=>controller.abort(), timeout);
        const res=await fetch(url,{method:'GET',redirect:'follow',signal:controller.signal});
        clearTimeout(t);
        if(res.status>=200&&res.status<400){
          results[id].matches.push({url,status:res.status});
        }
      }catch(e){}
    }
  }
  fs.writeFileSync('scripts/find-results.json',JSON.stringify(results,null,2));
  console.log('done');
})();
