const STONES_URL='https://jkyavwcdzkityyqsazel.supabase.co';
const STONES_KEY='sb_publishable_dNe8kUYYQfh6m6umLmCgtQ_vrb1YfZK';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

(async()=>{
 const dynamic=document.getElementById('dynamicStoneCards');
 const defaults=document.getElementById('defaultStoneCards');
 try{
  const res=await fetch(STONES_URL+'/rest/v1/stones?select=*&order=id.desc',{
   headers:{apikey:STONES_KEY,Authorization:'Bearer '+STONES_KEY}
  });
  if(!res.ok) throw new Error('stones HTTP '+res.status+' '+await res.text());
  const data=await res.json();
  if(!Array.isArray(data)||!data.length){dynamic.style.display='none';return;}
  defaults.style.display='none';
  dynamic.innerHTML=data.map(s=>`<article class="stoneDbCard">
   <div class="stoneDbImage"><img src="${esc(s.image_url)}" alt="${esc(s.name)}" loading="lazy"></div>
   <small>STORIES HELD IN STONE</small><h3>${esc(s.name)}</h3>
   <h4>자연적 특징</h4><p>${esc(s.features)}</p>
   <h4>전해지는 이야기</h4><p>${esc(s.story)}</p>
   <b>전해지는 상징 · ${esc(s.symbolism)}</b>
  </article>`).join('');
 }catch(error){
  console.error('stones load failed',error);
  dynamic.style.display='none';
 }
})();