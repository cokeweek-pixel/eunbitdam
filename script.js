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
