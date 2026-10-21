(()=>{'use strict';
const $=id=>document.getElementById(id);
const topics={
 stone:{hooks:['좋은 원석은 모두 투명할까요?','원석의 색은 왜 달라 보일까요?','원석의 작은 특징, 알고 계셨나요?'],middle:['원석마다 빛과 색, 내부 특징이 다릅니다.','원석의 아름다움은 한 가지 기준만으로 설명할 수 없습니다.','자연이 남긴 표정을 가까이 살펴보세요.'],end:'원석을 보는 눈, 은빛담'},
 style:{hooks:['주얼리 하나로 분위기가 달라질까요?','단정한 옷차림에 어울리는 포인트','오래 보아도 질리지 않는 주얼리'],middle:['옷의 색과 목걸이 길이를 함께 살펴보세요.','화려함보다 조화로운 균형이 중요할 때가 있습니다.','내 취향에 맞는 원석의 색을 찾아보세요.'],end:'일상에 스며드는 주얼리, 은빛담'},
 craft:{hooks:['작은 차이가 완성도를 만듭니다','원석을 고를 때 무엇을 볼까요?','주얼리는 어떻게 완성될까요?'],middle:['원석의 특징과 전체적인 조화를 함께 살핍니다.','배열과 마감의 차이를 가까이 들여다보세요.','손으로 만드는 시간에는 이유가 있습니다.'],end:'정성으로 완성한 주얼리, 은빛담'},
 gift:{hooks:['오래 간직할 선물은 무엇일까요?','마음을 전하는 특별한 방법','취향을 생각한 주얼리 선물'],middle:['받는 사람의 취향과 평소 스타일을 떠올려 보세요.','오래 착용할 수 있는 디자인을 살펴보세요.','선물에 담긴 이야기도 소중합니다.'],end:'마음을 담는 주얼리, 은빛담'}
};
let scenes=[],image=null,objectUrl=null;
const preview=$('shortPreview'),status=$('shortStatus');
function make(){
 const topic=topics[$('shortTopic').value],aud=$('shortAudience').value,keyword=$('shortKeyword').value.trim();
 const dur=Number($('shortDuration').value);
 const index=aud==='30'?1:aud==='60'?2:0;
 const hook=topic.hooks[index],mid=topic.middle[index],end=topic.end;
 scenes=[{start:0,end:Math.round(dur*.22),text:hook},{start:Math.round(dur*.22),end:Math.round(dur*.62),text:keyword?keyword+' — '+mid:mid},{start:Math.round(dur*.62),end:Math.round(dur*.85),text:'실제 원석의 색과 형태를 확인하세요.'},{start:Math.round(dur*.85),end:dur,text:end}];
 $('shortStoryboard').textContent=scenes.map(s=>String(s.start).padStart(2,'0')+'~'+String(s.end).padStart(2,'0')+'초  '+s.text).join('\n\n')+'\n\n게시글 초안: '+hook+'\n원석의 아름다움을 은빛담에서 만나보세요.\n#은빛담 #천연원석 #핸드메이드주얼리 #원석이야기';
 showPreview();
 status.textContent='콘티가 생성되었습니다. 실제 상품·원석에 대한 설명은 게시 전 사실 확인해 주세요.';
}
function showPreview(){
 preview.replaceChildren();
 if(objectUrl){const img=document.createElement('img');img.src=objectUrl;img.alt='실제 원석 사진';img.style.cssText='position:absolute;width:100%;height:100%;object-fit:contain;inset:0';preview.append(img);}
 const overlay=document.createElement('div');overlay.style.cssText='position:absolute;inset:0;background:linear-gradient(transparent 10%,rgba(0,0,0,.64) 95%);pointer-events:none';preview.append(overlay);
 const t=document.createElement('strong');t.textContent=scenes[0]?.text||'은빛담';t.style.cssText='position:relative;z-index:1;font-size:clamp(18px,2vw,27px);line-height:1.45;text-shadow:0 2px 8px #000;padding:15px';preview.append(t);
}
$('shortGenerate')?.addEventListener('click',make);
$('shortCopy')?.addEventListener('click',async()=>{if(!scenes.length)make();try{await navigator.clipboard.writeText($('shortStoryboard').textContent);status.textContent='콘티와 게시글 초안을 복사했습니다.';}catch(e){status.textContent='복사할 수 없습니다. 콘티 내용을 직접 선택해 복사해 주세요.';}});
$('shortPhoto')?.addEventListener('change',e=>{const f=e.target.files?.[0];if(objectUrl)URL.revokeObjectURL(objectUrl);objectUrl=null;image=null;if(!f){showPreview();return;}if(!f.type.startsWith('image/')){status.textContent='이미지 파일을 선택해 주세요.';return;}if(f.size>20*1024*1024){status.textContent='20MB 이하 이미지를 선택해 주세요.';return;}objectUrl=URL.createObjectURL(f);const im=new Image();im.onload=()=>{image=im;showPreview();};im.onerror=()=>{status.textContent='사진을 열 수 없습니다.';};im.src=objectUrl;});
function frame(ctx,w,h,t){
 ctx.fillStyle='#302720';ctx.fillRect(0,0,w,h);
 if(image){const s=Math.min(w/image.width,h/image.height);const iw=image.width*s,ih=image.height*s;ctx.drawImage(image,(w-iw)/2,(h-ih)/2,iw,ih);}
 const grad=ctx.createLinearGradient(0,0,0,h);grad.addColorStop(0,'rgba(0,0,0,.18)');grad.addColorStop(.55,'rgba(0,0,0,.10)');grad.addColorStop(1,'rgba(0,0,0,.80)');ctx.fillStyle=grad;ctx.fillRect(0,0,w,h);
 const scene=scenes.find(s=>t>=s.start&&t<s.end)||scenes[scenes.length-1];
 ctx.textAlign='center';ctx.fillStyle='#fff';ctx.shadowColor='#000';ctx.shadowBlur=9;ctx.font='bold 42px sans-serif';
 const words=scene.text.split(' '),lines=[];let line='';for(const word of words){const test=line?line+' '+word:word;if(ctx.measureText(test).width>w-100&&line){lines.push(line);line=word;}else line=test;}if(line)lines.push(line);
 const y=h*.75-(lines.length-1)*29;lines.forEach((v,i)=>ctx.fillText(v,w/2,y+i*58));ctx.font='27px serif';ctx.fillText('은빛담  EUNBITDAM',w/2,h-75);ctx.shadowBlur=0;
}
$('shortExport')?.addEventListener('click',async()=>{
 if(!scenes.length)make();
 if(!window.MediaRecorder||!HTMLCanvasElement.prototype.captureStream){status.textContent='이 브라우저는 영상 저장을 지원하지 않습니다. Chrome 또는 Edge에서 시도해 주세요.';return;}
 const btn=$('shortExport');btn.disabled=true;
 const canvas=document.createElement('canvas');canvas.width=540;canvas.height=960;const ctx=canvas.getContext('2d');
 const mime=['video/webm;codecs=vp9','video/webm;codecs=vp8','video/webm'].find(m=>MediaRecorder.isTypeSupported(m));
 if(!mime){status.textContent='영상 인코딩이 지원되지 않습니다.';btn.disabled=false;return;}
 const duration=Number($('shortDuration').value),stream=canvas.captureStream(24),chunks=[];let recorder;
 try{recorder=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:2500000});}catch(e){status.textContent='영상 녹화를 시작할 수 없습니다: '+e.message;btn.disabled=false;return;}
 recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};
 recorder.onerror=()=>{status.textContent='영상 저장 중 오류가 발생했습니다.';btn.disabled=false;};
 recorder.onstop=()=>{stream.getTracks().forEach(t=>t.stop());if(chunks.length){const blob=new Blob(chunks,{type:mime});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='eunbitdam-shorts-'+Date.now()+'.webm';a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);status.textContent='영상 저장을 요청했습니다. 인스타그램 업로드 전 필요하면 MP4로 변환하고, 음악을 추가해 주세요.';}else status.textContent='영상 데이터가 생성되지 않았습니다.';btn.disabled=false;};
 recorder.start();const start=performance.now();status.textContent='영상 제작 중입니다. '+duration+'초 동안 이 탭을 유지해 주세요.';
 const tick=()=>{if(recorder.state!=='recording')return;const t=(performance.now()-start)/1000;frame(ctx,540,960,Math.min(t,duration-.01));if(t<duration)requestAnimationFrame(tick);else recorder.stop();};tick();
});
})();