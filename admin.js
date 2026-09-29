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
 if(error){list.innerHTML='<p class="adminHint">상품 목록을 불러오지 못했습니다: '+escapeHtml(error.message)+'</p>';return;}
 if(!data?.length){list.innerHTML='<p class="adminHint">아직 데이터베이스에 등록된 상품이 없습니다. 아래에서 첫 상품을 등록해 주세요.</p>';return;}
 list.innerHTML='<div class="adminProductList">'+data.map(p=>'<article class="adminProductItem">'+
  '<img src="'+escapeHtml(p.image_url||'')+'" alt="">'+
  '<div class="adminProductInfo"><b>'+escapeHtml(p.name||'')+'</b><small>'+escapeHtml(p.category||'')+' · '+won(p.sale_price||p.price)+'</small><span>'+escapeHtml(p.description||'')+'</span></div>'+
  '<div class="adminProductActions"><button type="button" class="editProductBtn" data-id="'+p.id+'">수정</button><button type="button" class="deleteProductBtn" data-id="'+p.id+'">삭제</button></div></article>').join('')+'</div>';
 list.querySelectorAll('.editProductBtn').forEach(b=>b.addEventListener('click',()=>editProduct(data.find(p=>String(p.id)===b.dataset.id))));
 list.querySelectorAll('.deleteProductBtn').forEach(b=>b.addEventListener('click',()=>{const p=data.find(x=>String(x.id)===b.dataset.id);deleteProduct(p.id,encodeURIComponent(p.image_url||''));}));
}
function editProduct(p){
 document.getElementById('productId').value=p.id;
 document.getElementById('existingImageUrl').value=p.image_url||'';
 document.getElementById('productName').value=p.name||'';
 document.getElementById('productCategory').value=p.category||'';
 document.getElementById('productDescription').value=p.description||'';
 document.getElementById('productPrice').value=p.price||'';
 document.getElementById('productSalePrice').value=p.sale_price||'';
 document.getElementById('productSmartstore').value=p.smartstore_url||'';
 document.getElementById('productPreview').innerHTML=p.image_url?'<img src="'+escapeHtml(p.image_url)+'" alt="현재 상품 사진">':'사진 미리보기';
 document.getElementById('productFormTitle').textContent='상품 수정';
 document.getElementById('productSave').textContent='수정 저장';
 document.getElementById('productCancelEdit').hidden=false;
 document.getElementById('productFormTitle').scrollIntoView({behavior:'smooth',block:'start'});
}
function resetProductForm(){
 const f=document.getElementById('productForm');f.reset();
 document.getElementById('productId').value='';document.getElementById('existingImageUrl').value='';
 document.getElementById('productPreview').textContent='사진 미리보기';
 document.getElementById('productFormTitle').textContent='새 상품 등록';
 document.getElementById('productSave').textContent='상품 저장';
 document.getElementById('productCancelEdit').hidden=true;
}
document.getElementById('newProductBtn')?.addEventListener('click',()=>{resetProductForm();document.getElementById('productFormTitle').scrollIntoView({behavior:'smooth'});});
document.getElementById('productCancelEdit')?.addEventListener('click',resetProductForm);
function escapeHtml(s){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}

document.getElementById('productForm')?.addEventListener('submit',async e=>{
 e.preventDefault();
 const status=document.getElementById('productStatus'),btn=document.getElementById('productSave');
 const file=document.getElementById('productImage').files?.[0];
 const id=document.getElementById('productId').value;
 let imageUrl=document.getElementById('existingImageUrl').value;
 if(!file&&!imageUrl){status.textContent='상품 사진을 선택해 주세요.';return;}
 btn.disabled=true;status.textContent=id?'상품 수정 중...':'사진 업로드 중...';
 try{
  if(file){
   const ext=(file.name.split('.').pop()||'jpg').toLowerCase();
   const path='products/'+Date.now()+'-'+crypto.randomUUID()+'.'+ext;
   const up=await sb.storage.from('product-images').upload(path,file,{cacheControl:'3600',upsert:false});
   if(up.error)throw up.error;
   const {data:pub}=sb.storage.from('product-images').getPublicUrl(path);
   imageUrl=pub.publicUrl;
  }
  const row={name:document.getElementById('productName').value.trim(),category:document.getElementById('productCategory').value.trim(),description:document.getElementById('productDescription').value.trim(),price:Number(document.getElementById('productPrice').value)||null,sale_price:Number(document.getElementById('productSalePrice').value)||null,smartstore_url:document.getElementById('productSmartstore').value.trim(),image_url:imageUrl};
  const result=id?await sb.from('products').update(row).eq('id',id):await sb.from('products').insert(row);
  if(result.error)throw result.error;
  resetProductForm();status.textContent=id?'수정되었습니다.':'저장되었습니다.';
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