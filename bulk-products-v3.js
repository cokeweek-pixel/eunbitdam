(()=>{'use strict';
const el=id=>document.getElementById(id),status=el('bulkProductStatus');let pending=[];let cachedGrid=null;
const norm=s=>String(s||'').toLowerCase().replace(/[\s\n\r\t_()\[\]·-]/g,'');
const aliases={name:['상품명','원상품명','상품이름','name'],price:['할인가','판매가','판매가격','판매금액','할인가','즉시할인가','saleprice','price'],normal:['판매가','정상가','정상가격','상품가격','소비자가','정가'],number:['상품번호','상품번호(스마트스토어)','원상품번호','스마트스토어상품번호','채널상품번호','상품id','상품ID','originproductno','channelproductno'],url:['상품url','상품주소','상품링크','스마트스토어주소','스마트스토어url','smartstoreurl','url'],image:['대표이미지url','대표이미지주소','대표이미지','이미지url','이미지주소','대표사진url','imageurl'],desc:['상품설명','상품요약','상품간략설명','소재','description'],category:['카테고리','상품분류','category'],state:['판매상태','상품상태','전시상태']};
function col(keys,names){for(const key of keys){const i=names.findIndex(n=>n===norm(key));if(i>=0)return i;}return -1;}
function value(row,i){return i<0?'':String(row[i]??'').trim();}
function amount(s){const n=Number(String(s||'').replace(/[^0-9.-]/g,''));return Number.isFinite(n)&&n>=0?n:0;}
function storeUrl(v){const s=String(v||'').trim();if(!s)return '';try{const u=new URL(s);if(u.protocol!=='https:'||!['smartstore.naver.com','brand.naver.com'].includes(u.hostname)||!/^\/[^/]+\/products\/\d+\/?$/.test(u.pathname))return '';return u.origin+u.pathname.replace(/\/$/,'');}catch{return '';}}
function productId(s){const m=String(s||'').match(/(?:products\/)?(\d{7,})/);return m?m[1]:'';}
function toRow(row,map){const name=value(row,map.name),number=productId(value(row,map.number)),given=storeUrl(value(row,map.url));const url=given||(number?'https://smartstore.naver.com/eunbitdam/products/'+number:'');const img=value(row,map.image);let image_url='';try{const u=new URL(img);if(['https:','http:'].includes(u.protocol))image_url=u.href;}catch{}const sale=amount(value(row,map.price))||amount(value(row,map.normal));const original=amount(value(row,map.normal))||sale;const cat=value(row,map.category)||(name.includes('목걸이')?'목걸이':name.includes('팔찌')?'팔찌':name.includes('귀걸이')?'귀걸이':'주얼리');return {name,price:original,sale_price:sale,category:cat,description:value(row,map.desc),smartstore_url:url,image_url,state:value(row,map.state)};}
function html(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function show(rows){const root=el('bulkProductPreview');root.innerHTML='<table style="width:100%;border-collapse:collapse;min-width:700px"><thead><tr>'+['번호','상품명','판매가','대표사진','검증'].map(x=>'<th style="text-align:left;padding:8px;border-bottom:1px solid #ccc">'+x+'</th>').join('')+'</tr></thead><tbody>'+rows.slice(0,30).map((p,i)=>'<tr>'+[i+1,p.name,p.sale_price.toLocaleString('ko-KR')+'원',p.image_url?'URL 있음':'없음',p.issue||'정상'].map(x=>'<td style="padding:8px;border-bottom:1px solid #eee">'+html(x)+'</td>').join('')+'</tr>').join('')+'</tbody></table>'+(rows.length>30?'<p>처음 30개만 미리보기로 표시됩니다. 저장 시 검증된 전체 상품을 처리합니다.</p>':'');}
el('bulkProductFile')?.addEventListener('change',()=>{cachedGrid=null;el('bulkProductMapping')?.remove();pending=[];el('bulkImportBtn').disabled=true;el('bulkProductPreview').replaceChildren();status.textContent='엑셀 분석 · 미리보기를 눌러 주세요.';});
el('bulkPreviewBtn')?.addEventListener('click',async()=>{
 const file=el('bulkProductFile').files?.[0];if(!file){status.textContent='먼저 파일을 선택하세요.';return;}
 if(file.size>15*1024*1024){status.textContent='15MB 이하 파일을 선택하세요.';return;}
 if(!window.XLSX){status.textContent='엑셀 읽기 라이브러리를 불러오지 못했습니다. 인터넷 연결을 확인하세요.';return;}
 try{
 const buf=await file.arrayBuffer(),book=XLSX.read(buf,{type:'array',cellDates:false}),sheet=book.Sheets[book.SheetNames[0]],grid=XLSX.utils.sheet_to_json(sheet,{header:1,defval:'',raw:false,blankrows:false});cachedGrid=grid;el('bulkProductMapping')?.remove();
 let header=-1,map={};for(let i=0;i<Math.min(25,grid.length);i++){const names=(grid[i]||[]).map(norm),m=Object.fromEntries(Object.entries(aliases).map(([k,v])=>[k,col(v,names)]));if(m.name>=0&&(m.price>=0||m.normal>=0)&&(m.url>=0||m.number>=0)){header=i;map=m;break;}}
 if(header<0){showMapping(grid);return;}
 importRows(grid,header,map);
 }catch(e){pending=[];el('bulkImportBtn').disabled=true;status.textContent='파일 분석 실패: '+e.message;}
});
function importRows(grid,header,map){
 const seen=new Set(),rows=[];
 for(const row of grid.slice(header+1)){if(!row.some(v=>String(v).trim()))continue;const p=toRow(row,map);if(!p.name)continue;const id=productId(p.smartstore_url);p.issue=!p.smartstore_url?'상품번호·주소 확인 필요':!p.sale_price?'판매가 확인 필요':seen.has(id)?'파일 내 중복':'';if(id)seen.add(id);rows.push(p);}
 pending=rows.filter(p=>!p.issue).map(({state,...p})=>p);show(rows);
 status.textContent='분석 '+rows.length+'건 / 저장 가능 '+pending.length+'건 / 제외 '+(rows.length-pending.length)+'건. 미리보기를 확인하세요.';
 el('bulkImportBtn').disabled=!pending.length;
}
function showMapping(grid){
 const root=document.createElement('div');root.id='bulkProductMapping';root.style.cssText='border:1px solid #cbb9a6;padding:16px;margin:12px 0';
 const p=document.createElement('p');p.textContent='열 제목을 자동으로 찾지 못했습니다. 열 제목 행과 각 항목을 직접 지정해 주세요.';root.append(p);
 const headerSelect=document.createElement('select');for(let i=0;i<Math.min(grid.length,20);i++){const opt=document.createElement('option');opt.value=i;opt.textContent=(i+1)+'행: '+(grid[i]||[]).slice(0,5).join(' / ').slice(0,130);headerSelect.append(opt);}root.append('열 제목 행: ',headerSelect);
 const fields=[['name','상품명'],['price','판매가'],['normal','정상가(선택)'],['number','상품번호'],['url','상품주소(선택)'],['image','대표이미지 URL(선택)'],['desc','설명(선택)'],['category','카테고리(선택)']],selects={};
 const wrap=document.createElement('div');wrap.style.cssText='display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:10px;margin:15px 0';root.append(wrap);
 function refresh(){wrap.replaceChildren();const i=Number(headerSelect.value),head=grid[i]||[];fields.forEach(([key,label])=>{const holder=document.createElement('label');holder.textContent=label;const s=document.createElement('select');s.style.cssText='width:100%;padding:8px';const blank=document.createElement('option');blank.value='-1';blank.textContent='선택 안 함';s.append(blank);head.forEach((h,j)=>{const opt=document.createElement('option');opt.value=j;opt.textContent=(j+1)+'열: '+String(h||'(제목 없음)').slice(0,55);s.append(opt);});s.value=String(col(aliases[key],head.map(norm)));selects[key]=s;holder.append(s);wrap.append(holder);});}
 headerSelect.addEventListener('change',refresh);refresh();
 const button=document.createElement('button');button.type='button';button.className='adminSave';button.textContent='선택한 열로 미리보기';button.addEventListener('click',()=>{const map=Object.fromEntries(fields.map(([key])=>[key,Number(selects[key].value)]));map.state=-1;if(map.name<0||(map.price<0&&map.normal<0)||(map.number<0&&map.url<0)){status.textContent='상품명, 가격, 상품번호 또는 상품주소를 지정해 주세요.';return;}importRows(grid,Number(headerSelect.value),map);});root.append(button);el('bulkProductPreview').before(root);status.textContent='파일을 열었습니다. 아래에서 열을 직접 지정해 주세요.';
}
el('bulkImportBtn')?.addEventListener('click',async()=>{
 if(!pending.length)return;const btn=el('bulkImportBtn');if(!confirm('검증된 '+pending.length+'개 상품을 데이터베이스에 저장할까요? 기존 상품은 상품번호 기준으로 확인합니다.'))return;btn.disabled=true;
 try{
 const {data:existing,error}=await sb.from('products').select('id,smartstore_url,image_url');if(error)throw error;
 const byId=new Map((existing||[]).filter(p=>productId(p.smartstore_url)).map(p=>[productId(p.smartstore_url),p]));
 const updates=el('bulkUpdateExisting').checked;let added=0,changed=0,skipped=0,failed=[];
 for(let i=0;i<pending.length;i+=30){
 const batch=pending.slice(i,i+30);for(const p of batch){const old=byId.get(productId(p.smartstore_url));if(old&&!updates){skipped++;continue;}
 const row={...p,image_url:p.image_url||(old?.image_url||'')};const res=old?await sb.from('products').update(row).eq('id',old.id):await sb.from('products').insert(row).select('id').single();
 if(res.error){failed.push(p.name+': '+res.error.message);}else if(old)changed++;else{added++;byId.set(productId(p.smartstore_url),{id:res.data?.id,smartstore_url:p.smartstore_url,image_url:p.image_url});}}
 status.textContent='처리 중 '+Math.min(i+30,pending.length)+'/'+pending.length+'건 · 신규 '+added+' · 갱신 '+changed+' · 오류 '+failed.length;
 }
 status.textContent='완료: 신규 '+added+'건, 갱신 '+changed+'건, 건너뜀 '+skipped+'건, 실패 '+failed.length+'건.'+(failed.length?' 오류 예시: '+failed.slice(0,2).join(' / '):'')+' SHOP 화면을 새로고침해 확인하세요.';
 if(typeof loadProducts==='function')await loadProducts();
 }catch(e){status.textContent='일괄 저장 실패: '+e.message;}finally{btn.disabled=false;}
});
})();