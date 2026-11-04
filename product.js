(()=>{'use strict';
const root=document.getElementById('detailRoot');
const id=new URLSearchParams(location.search).get('id');
const db=window.supabase?.createClient('https://jkyavwcdzkityyqsazel.supabase.co','sb_publishable_dNe8kUYYQfh6m6umLmCgtQ_vrb1YfZK');
const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;};
function imageUrl(s){try{const u=new URL(String(s||''));if(u.protocol==='http:'&&u.hostname.endsWith('.naver.net'))u.protocol='https:';return u.protocol==='https:'?u.href:'';}catch{return '';}}
function line(parent,cls,tag='div'){const x=el(tag,cls);parent.append(x);return x;}
if(!id||!/^(?:[0-9]+|[0-9a-f-]{36})$/i.test(id)||!db){root.textContent='상품 정보를 불러올 수 없습니다.';return;}
db.from('products').select('id,name,description,category,price,sale_price,image_url,smartstore_url').eq('id',id).maybeSingle().then(({data:p,error})=>{
if(error||!p){root.textContent='상품을 찾을 수 없습니다.';return;}
document.title=p.name+' | 은빛담';root.replaceChildren();
const grid=line(root,'detailGrid'),left=line(grid,'detailLeft'),photo=line(left,'detailPhoto');
const src=imageUrl(p.image_url);
if(src){const img=el('img');img.src=src;img.alt=p.name;img.onerror=()=>{img.remove();photo.append(el('span','', '대표이미지를 불러오지 못했습니다.'));};photo.append(img);}
else photo.append(el('span','', '대표이미지 준비 중'));
line(left,'detailThumbs');left.append(el('p','detailNote','정확한 상품 원본 사진만 표시합니다. 추가 사진은 준비 중입니다.'));
const right=line(grid,'detailInfo');
right.append(el('div','detailCategory',p.category||'은빛담 주얼리'),el('h1','',p.name));
right.append(el('div','detailPrice',Number(p.sale_price??p.price??0).toLocaleString('ko-KR')+'원'));
line(right,'detailLine');
const description=String(p.description||'').replace(/\\n/g,'\n').trim();
right.append(el('div','detailDesc',description||'상품의 소재·구성·상세설명은 확인 후 등록됩니다.'));
line(right,'detailLine');
const label=el('label','detailOptionLabel','사이즈 선택');label.htmlFor='sizeSelect';right.append(label);
const select=el('select','detailOption');select.id='sizeSelect';const type=/팔찌|발찌/.test(p.name)?'bracelet':/목걸이|체인|펜던트/.test(p.name)?'necklace':'other';
const sizes=type==='bracelet'?['14cm','15cm','16cm','17cm','18cm','19cm','20cm','21cm','22cm','맞춤 사이즈 문의']:type==='necklace'?['38cm','40cm','42cm','45cm','50cm','55cm','60cm','맞춤 사이즈 문의']:['기본 구성','사이즈 문의'];
for(const s of ['사이즈를 선택하세요',...sizes]){const o=el('option','',s);o.value=s==='사이즈를 선택하세요'?'':s;select.append(o);}right.append(select);
const summary=el('div','detailSummary','상품별 제작 가능 길이와 추가금은 주문 전 확인이 필요합니다.');right.append(summary);
select.addEventListener('change',()=>{summary.textContent=select.value?'선택: '+select.value+' · 실제 제작 가능 여부와 가격은 별도 확인이 필요합니다.':'사이즈를 선택하세요.';});
right.append(el('p','detailNote','은빛담 자체 결제는 준비 중이며 현재 주문·결제는 진행되지 않습니다.'));
const button=el('button','detailButton disabled','은빛담에서 구매 · 준비 중');button.disabled=true;right.append(button);
try{const u=new URL(p.smartstore_url);if(u.protocol==='https:'&&u.hostname==='smartstore.naver.com'){const a=el('a','detailButton secondary','네이버 스마트스토어에서 구매');a.href=u.href;a.target='_blank';a.rel='noopener noreferrer';right.append(a);}}catch{}
const back=el('a','detailButton secondary','다른 상품 보기');back.href='shop.html';right.append(back);
}).catch(()=>{root.textContent='상품 정보를 불러오지 못했습니다.';});
})();