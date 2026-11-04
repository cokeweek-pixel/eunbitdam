const SUPABASE_URL='https://jkyavwcdzkityyqsazel.supabase.co';
const SUPABASE_KEY='sb_publishable_dNe8kUYYQfh6m6umLmCgtQ_vrb1YfZK';
const sb=supabase.createClient(SUPABASE_URL,SUPABASE_KEY);
const msg=document.getElementById('loginMessage');
const panel=document.getElementById('resetPanel');
const loginForm=document.getElementById('loginForm');
const forgot=document.getElementById('forgotPassword');
let recovery=false;
const params=new URLSearchParams(location.search);
const hash=new URLSearchParams(location.hash.replace(/^#/,''));
const recoveryLink=params.has('code')||params.get('type')==='recovery'||hash.get('type')==='recovery'||hash.has('access_token')||params.has('token_hash');
function showRecovery(){recovery=true;panel.hidden=false;loginForm.hidden=true;forgot.hidden=true;msg.textContent='인증되었습니다. 아래에서 새 비밀번호를 설정해 주세요.';}
sb.auth.onAuthStateChange(event=>{if(event==='PASSWORD_RECOVERY')showRecovery();});
(async()=>{
 if(params.get('error')||hash.get('error')){msg.textContent='재설정 링크 오류: '+(params.get('error_description')||hash.get('error_description')||'링크가 만료되었거나 유효하지 않습니다.');return;}
 if(params.get('token_hash')&&params.get('type')==='recovery'){
  const {error}=await sb.auth.verifyOtp({token_hash:params.get('token_hash'),type:'recovery'});
  if(error){msg.textContent='재설정 링크 확인 실패: '+error.message;return;}
  showRecovery();return;
 }
 if(params.has('code')){
  const {error}=await sb.auth.exchangeCodeForSession(params.get('code'));
  if(error){msg.textContent='재설정 링크 확인 실패: '+error.message;return;}
  showRecovery();return;
 }
 if(hash.get('type')==='recovery'||hash.has('access_token')){
  const {data,error}=await sb.auth.getSession();
  if(error){msg.textContent='재설정 링크 확인 실패: '+error.message;return;}
  if(data.session){showRecovery();return;}
  msg.textContent='재설정 링크가 만료되었거나 유효하지 않습니다.';return;
 }
 const {data}=await sb.auth.getSession();
 if(data.session&&!recoveryLink){const {data:role}=await sb.rpc('is_eunbitdam_admin');if(role===true)location.replace('admin.html');}
})();
loginForm.addEventListener('submit',async e=>{
 e.preventDefault();const btn=e.currentTarget.querySelector('button');msg.textContent='로그인 확인 중...';btn.disabled=true;
 const {error}=await sb.auth.signInWithPassword({email:document.getElementById('loginEmail').value.trim(),password:document.getElementById('loginPassword').value});
 if(error){msg.textContent='로그인 실패: '+(error.message==='Invalid login credentials'?'이메일 또는 비밀번호가 일치하지 않습니다.':error.message);btn.disabled=false;return;}
 const {data,error:roleError}=await sb.rpc('is_eunbitdam_admin');
 if(roleError||data!==true){msg.textContent='로그인되었지만 관리자 권한이 없는 계정입니다.';btn.disabled=false;return;}
 location.replace('admin.html');
});
forgot.onclick=async()=>{
 const email=document.getElementById('loginEmail').value.trim();
 if(!email){msg.textContent='위 이메일 칸에 가입한 이메일을 먼저 입력해 주세요.';return;}
 msg.textContent='재설정 메일 요청 중...';
 const {error}=await sb.auth.resetPasswordForEmail(email,{redirectTo:'https://eunbitdam.com/login.html'});
 msg.textContent=error?'메일 요청 실패: '+error.message:'재설정 메일을 요청했습니다. 메일이 오면 링크를 눌러 새 비밀번호를 설정하세요. (스팸함도 확인)';
};
document.getElementById('saveNewPassword').onclick=async()=>{
 const password=document.getElementById('newPassword').value;
 if(password.length<8){msg.textContent='비밀번호는 8자 이상 입력해 주세요.';return;}
 const button=document.getElementById('saveNewPassword');button.disabled=true;
 const {error}=await sb.auth.updateUser({password});
 if(error){msg.textContent='변경 실패: '+error.message;button.disabled=false;return;}
 await sb.auth.signOut();history.replaceState(null,'',location.pathname);
 panel.hidden=true;loginForm.hidden=false;forgot.hidden=false;recovery=false;
 document.getElementById('loginPassword').value='';
 msg.textContent='비밀번호가 변경되었습니다. 새 비밀번호로 로그인해 주세요.';
 button.disabled=false;
};