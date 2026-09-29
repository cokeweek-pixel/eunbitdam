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
  dynamic.innerHTML=data.map(s=>`<article class="stoneDbCard" style="min-width:0;background:#fffdfa;border:1px solid #dfd2c3;padding:0 0 30px;overflow:hidden">
   <div class="stoneDbImage" style="width:100%;aspect-ratio:16/10;overflow:hidden;background:#eee6dc;margin:0 0 22px"><img src="${esc(s.image_url)}" alt="${esc(s.name)}" loading="lazy" style="width:100%;height:100%;display:block;object-fit:cover"></div>
   <small style="display:block;font-family:Georgia,serif;font-size:14px;letter-spacing:.2em;margin:0 24px 8px;color:#93684d">STORIES HELD IN STONE</small><h3 style="font-family:Georgia,Noto Serif KR,serif;font-size:34px;font-weight:400;line-height:1.35;margin:0 24px 22px;color:#35281f">${esc(s.name)}</h3>
   <h4 style="font-size:19px;margin:24px 24px 7px;color:#4b382b">자연적 특징</h4><p style="font-family:Noto Serif KR,serif;font-size:18px;line-height:2;margin:0 24px;color:#65584d">${esc(s.features)}</p>
   <h4 style="font-size:19px;margin:24px 24px 7px;color:#4b382b">전해지는 이야기</h4><p style="font-family:Noto Serif KR,serif;font-size:18px;line-height:2;margin:0 24px;color:#65584d">${esc(s.story)}</p>
   <b style="display:block;font-family:Noto Serif KR,serif;font-size:17px;line-height:1.9;margin:20px 24px 0;color:#76553f;font-weight:500">전해지는 상징 · ${esc(s.symbolism)}</b>
  </article>`).join('');
 }catch(error){
  console.error('stones load failed',error);
  dynamic.style.display='none';
 }
})();