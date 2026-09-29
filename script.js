const header=document.querySelector('.header');
document.querySelector('.menuBtn')?.addEventListener('click',()=>header.classList.toggle('open'));
document.querySelectorAll('.header nav a').forEach(a=>a.addEventListener('click',()=>header.classList.remove('open')));

const notice=document.getElementById('siteNotice');
const closeNotice=()=>{
  notice?.classList.add('isHidden');
  document.body.classList.remove('noticeOpen');
};
if(notice){
  document.body.classList.add('noticeOpen');
  notice.querySelector('.noticeClose')?.addEventListener('click',closeNotice);
  notice.querySelector('.noticeEnter')?.addEventListener('click',closeNotice);
  notice.addEventListener('click',e=>{if(e.target===notice) closeNotice();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape') closeNotice();});
}

if(document.getElementById('dbShopGrid')&&window.supabase){
 const db=supabase.createClient('https://jkyavwcdzkityyqsazel.supabase.co','sb_publishable_dNe8kUYYQfh6m6umLmCgtQ_vrb1YfZK');
 const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
 db.from('products').select('*').order('id',{ascending:false}).then(({data,error})=>{
  if(error||!data?.length)return;
  const grid=document.getElementById('dbShopGrid');
  grid.innerHTML=data.map(p=>'<article class="shopCard"><div class="productPhoto"><img src="'+esc(p.image_url)+'" alt="'+esc(p.name)+'"></div><h3>'+esc(p.name)+'</h3><p>'+esc(p.description||p.category||'')+'</p><strong>'+Number(p.sale_price||p.price||0).toLocaleString('ko-KR')+'원</strong><a class="productLink" href="'+esc(p.smartstore_url)+'" target="_blank" rel="noopener">스마트스토어에서 보기 →</a></article>').join('');
 });
}