const SUPABASE_URL='https://jkyavwcdzkityyqsazel.supabase.co';
const SUPABASE_KEY='sb_publishable_dNe8kUYYQfh6m6umLmCgtQ_vrb1YfZK';
const sb=supabase.createClient(SUPABASE_URL,SUPABASE_KEY);
let currentSession=null;

(async()=>{
 const {data,error}=await sb.auth.getSession();
 if(error||!data.session){location.replace('login.html');return;}
 currentSession=data.session;
 document.getElementById('adminAuthLoading')?.remove();
 document.getElementById('adminShell').hidden=false;
 loadProducts();
})();

document.getElementById('adminLogout')?.addEventListener('click',async()=>{await sb.auth.signOut();location.replace('login.html');});
document.querySelectorAll('.adminSide button[data-tab]').forEach(btn=>btn.addEventListener('click',()=>{
 document.querySelectorAll('.adminSide button').forEach(b=>b.classList.remove('active'));
 document.querySelectorAll('.adminPanel').forEach(p=>p.classList.remove('active'));
 btn.classList.add('active');document.getElementById(btn.dataset.tab)?.classList.add('active');
}));
function preview(inputId,previewId){const input=document.getElementById(inputId),box=document.getElementById(previewId);input?.addEventListener('change',()=>{const f=input.files?.[0];if(!f)return;box.innerHTML='<img src="'+URL.createObjectURL(f)+'" alt="미리보기">';});}
preview('productImage','productPreview');preview('heroImage','heroPreview');preview('stoneImage','stonePreview');

const won=n=>Number(n||0).toLocaleString('ko-KR')+'원';
async function loadProducts(){
 const list=document.getElementById('productList'); if(!list)return;
 const {data,error}=await sb.from('products').select('*').order('id',{ascending:false});
 if(error){list.innerHTML='<p class="adminHint">상품 목록을 불러오지 못했습니다: '+error.message+'</p>';return;}
 if(!data?.length){list.innerHTML='<p class="adminHint">아직 데이터베이스에 등록된 상품이 없습니다.</p>';return;}
 list.innerHTML='<h2 style="margin-top:40px">등록 상품</h2>'+data.map(p=>'<div style="display:grid;grid-template-columns:80px 1fr auto;gap:16px;align-items:center;padding:12px 0;border-bottom:1px solid #ddd"><img src="'+(p.image_url||'')+'" style="width:80px;height:80px;object-fit:cover"><div><b>'+escapeHtml(p.name||'')+'</b><br><small>'+escapeHtml(p.category||'')+' · '+won(p.sale_price||p.price)+'</small></div><button type="button" onclick="deleteProduct('+p.id+',\''+encodeURIComponent(p.image_url||'')+'\')">삭제</button></div>').join('');
}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}

document.getElementById('productForm')?.addEventListener('submit',async e=>{
 e.preventDefault();
 const status=document.getElementById('productStatus'),btn=document.getElementById('productSave'),file=document.getElementById('productImage').files?.[0];
 if(!file){status.textContent='상품 사진을 선택해 주세요.';return;}
 btn.disabled=true;status.textContent='사진 업로드 중...';
 try{
  const ext=(file.name.split('.').pop()||'jpg').toLowerCase();
  const path='products/'+Date.now()+'-'+crypto.randomUUID()+'.'+ext;
  const up=await sb.storage.from('product-images').upload(path,file,{cacheControl:'3600',upsert:false});
  if(up.error)throw up.error;
  const {data:pub}=sb.storage.from('product-images').getPublicUrl(path);
  status.textContent='상품정보 저장 중...';
  const row={
   name:document.getElementById('productName').value.trim(),
   category:document.getElementById('productCategory').value.trim(),
   description:document.getElementById('productDescription').value.trim(),
   price:Number(document.getElementById('productPrice').value)||null,
   sale_price:Number(document.getElementById('productSalePrice').value)||null,
   smartstore_url:document.getElementById('productSmartstore').value.trim(),
   image_url:pub.publicUrl
  };
  const ins=await sb.from('products').insert(row);
  if(ins.error){await sb.storage.from('product-images').remove([path]);throw ins.error;}
  e.target.reset();document.getElementById('productPreview').textContent='사진 미리보기';
  status.textContent='저장되었습니다. SHOP 페이지에 자동 반영됩니다.';
  await loadProducts();
 }catch(err){status.textContent='저장 실패: '+(err.message||err);}
 finally{btn.disabled=false;}
});
window.deleteProduct=async(id,imageUrlEncoded)=>{
 if(!confirm('이 상품을 삭제할까요?'))return;
 const imageUrl=decodeURIComponent(imageUrlEncoded||'');
 const del=await sb.from('products').delete().eq('id',id);
 if(del.error){alert('삭제 실패: '+del.error.message);return;}
 const marker='/storage/v1/object/public/product-images/';
 if(imageUrl.includes(marker)){const path=imageUrl.split(marker)[1];if(path)await sb.storage.from('product-images').remove([decodeURIComponent(path)]);}
 loadProducts();
};