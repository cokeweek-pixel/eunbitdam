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
 const imageSrc=s=>{try{const u=new URL(String(s||''));if(u.protocol==='http:'&&u.hostname.endsWith('.naver.net'))u.protocol='https:';return u.protocol==='https:'?u.href:'';}catch{return '';}};
 const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
 db.from('products').select('id,name,description,category,price,sale_price,image_url,smartstore_url').order('id',{ascending:false}).then(({data,error})=>{
  const grid=document.getElementById('dbShopGrid');
  if(error){console.error('SHOP product fetch',error);grid.textContent='상품 목록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.';return;}
  if(!data?.length){grid.textContent='등록된 상품이 없습니다.';return;}
  grid.innerHTML=data.map(p=>{
   const url='product.html?id='+encodeURIComponent(p.id),src=imageSrc(p.image_url);
   return '<article class="shopCard"><a href="'+url+'" aria-label="'+esc(p.name)+' 상세보기"><div class="productPhoto">'+(src?'<img loading="lazy" src="'+esc(src)+'" alt="'+esc(p.name)+'" onerror="this.hidden=true;this.nextElementSibling.hidden=false"><span hidden class="productImageFallback">이미지 준비 중</span>':'<span class="productImageFallback">이미지 준비 중</span>')+'</div></a><h3><a style="color:inherit;text-decoration:none" href="'+url+'">'+esc(p.name)+'</a></h3><p>'+esc(p.category||'')+'</p><strong>'+Number(p.sale_price??p.price??0).toLocaleString('ko-KR')+'원</strong><a class="productLink" href="'+url+'">상품 상세보기 →</a></article>';
  }).join('');
 });
}

// 은빛담 방문자 집계 (공개 페이지 공통)
(function(){
  const script=document.createElement('script');
  script.src=new URL('visits.js?v=20261013-1',document.currentScript?.src||location.href).href;
  script.async=true;
  document.body.appendChild(script);
})();
