const STONES_URL='https://jkyavwcdzkityyqsazel.supabase.co';
const STONES_KEY='sb_publishable_dNe8kUYYQfh6m6umLmCgtQ_vrb1YfZK';
const stonesDb=supabase.createClient(STONES_URL,STONES_KEY);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
(async()=>{
 const dynamic=document.getElementById('dynamicStoneCards');
 const defaults=document.getElementById('defaultStoneCards');
 const {data,error}=await stonesDb.from('stones').select('*').order('id',{ascending:false});
 console.log('stones db',data,error);
 if(error){dynamic.style.display='none'; console.error(error); return;}
 if(!data?.length){dynamic.style.display='none';return;}
 defaults.style.display='none';
 dynamic.innerHTML=data.map(s=>`<article class="stoneDbCard">
 <div class="stoneDbImage"><img src="${esc(s.image_url)}" alt="${esc(s.name)}"></div>
 <small>STORIES HELD IN STONE</small><h3>${esc(s.name)}</h3>
 <h4>자연적 특징</h4><p>${esc(s.features)}</p>
 <h4>전해지는 이야기</h4><p>${esc(s.story)}</p>
 <b>전해지는 상징 · ${esc(s.symbolism)}</b>
 </article>`).join('');
})();