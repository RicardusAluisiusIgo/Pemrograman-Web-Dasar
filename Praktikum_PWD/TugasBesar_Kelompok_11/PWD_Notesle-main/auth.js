const themeToggle = document.getElementById('themeToggle');
const savedTheme = localStorage.getItem('theme') || 'dark';
document.documentElement.setAttribute('data-theme', savedTheme);
if (themeToggle) themeToggle.textContent = savedTheme === 'dark' ? '🌙' : '☀️';

themeToggle?.addEventListener('click', () => {
  const cur = document.documentElement.getAttribute('data-theme') || 'dark';
  const next = cur === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
  themeToggle.textContent = next === 'dark' ? '🌙' : '☀️';
});

function byId(...ids){
  for (const id of ids){
    const el = document.getElementById(id);
    if(el) return el;
  }
  return null;
}
function show(el, visible=true){
  if(!el) return;
  el.classList.toggle('hide', !visible);
}
async function safeParse(res){
  const text = await res.text();
  try { return { ok: res.ok, data: JSON.parse(text) }; }
  catch { return { ok: res.ok, data: { error: text } }; }
}

const registerCard = byId('registerCard','registercard');
const loginCard    = byId('loginCard','logincard');

byId('toLogin','tologin')?.addEventListener('click', e=>{
  e.preventDefault();
  show(registerCard,false); show(loginCard,true);
});
byId('toRegister','toregister')?.addEventListener('click', e=>{
  e.preventDefault();
  show(loginCard,false); show(registerCard,true);
});

byId('registerForm','registerform')?.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const fb = byId('registerFeedback','registerFeedback');
  fb.className = 'feedback';
  fb.textContent = 'Memproses...';

  const username = byId('regUsername','username','regusername')?.value.trim();
  const email    = byId('regEmail','email','regemail')?.value.trim();
  const password = byId('regPassword','password','regpassword')?.value || '';

  if(!username || !email || !password){
    fb.classList.add('error');
    fb.textContent = 'Lengkapi username, email, dan password.';
    return;
  }

  try{
    const fd = new FormData();
    fd.append('username', username);
    fd.append('email', email);
    fd.append('password', password);

    const res = await fetch('api/register.php', {method:'POST', body:fd});
    const parsed = await safeParse(res);

    if(parsed.ok){
      fb.classList.add('success');
      fb.textContent = parsed.data.message || 'Registrasi berhasil!';
      setTimeout(()=>{ show(registerCard,false); show(loginCard,true); }, 900);
    }else{
      fb.classList.add('error');
      fb.textContent = parsed.data.error || 'Registrasi gagal.';
    }
  }catch(err){
    console.error(err);
    fb.classList.add('error');
    fb.textContent = 'Server error / fetch gagal.';
  }
});

byId('loginForm','loginform')?.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const fb = byId('loginFeedback','loginFeedback');
  fb.className = 'feedback';
  fb.textContent = 'Memproses...';

  const email    = byId('loginEmail','emaillogin','loginemail')?.value.trim();
  const password = byId('loginPassword','passwordlogin','loginpassword')?.value || '';

  if(!email || !password){
    fb.classList.add('error');
    fb.textContent='Email & password wajib diisi.';
    return;
  }

  try{
    const fd = new FormData();
    fd.append('email', email);
    fd.append('password', password);

    const res = await fetch('api/login.php', {method:'POST', body:fd});
    const parsed = await safeParse(res);

    if(parsed.ok && parsed.data.token){
      localStorage.setItem('notes_token', parsed.data.token);
      location.href = parsed.data.role === 'admin' ? 'admin.html' : 'app.html';
    }else{
      fb.classList.add('error');
      fb.textContent = parsed.data.error || 'Login gagal.';
    }
  }catch(err){
    console.error(err);
    fb.classList.add('error');
    fb.textContent='Server error / fetch gagal.';
  }
});
