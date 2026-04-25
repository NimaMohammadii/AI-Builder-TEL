export const SITE_HTML = `<!doctype html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
  <meta name="theme-color" content="#07050a" />
  <title>VEX | AI Empire</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Vazirmatn:wght@400;500;700;800&display=swap');
    *{box-sizing:border-box;margin:0;padding:0}
    :root{--bg:#07050a;--panel:rgba(255,255,255,.055);--panel2:rgba(255,255,255,.085);--line:rgba(255,255,255,.11);--line2:rgba(255,255,255,.2);--wine:#a8243a;--wine2:#c42b44;--text:#f6f1f3;--muted:rgba(246,241,243,.62);--dim:rgba(246,241,243,.34);--glow:rgba(196,43,68,.34)}
    html,body{min-height:100%;background:var(--bg);color:var(--text);font-family:Vazirmatn,system-ui,sans-serif;overflow-x:hidden}
    body{display:flex;justify-content:center;background:radial-gradient(circle at 20% -10%,rgba(196,43,68,.28),transparent 34%),radial-gradient(circle at 90% 20%,rgba(90,25,55,.32),transparent 38%),linear-gradient(180deg,#07050a,#0b070d 58%,#07050a)}
    .app{width:100%;max-width:460px;min-height:100vh;position:relative;padding:18px 16px 96px}
    .top{display:flex;align-items:center;justify-content:space-between;margin-bottom:18px}
    .brand{font-family:'Bebas Neue',sans-serif;font-size:34px;letter-spacing:9px;direction:ltr}.brand span{color:var(--wine2);text-shadow:0 0 24px var(--glow)}
    .pill{border:1px solid rgba(196,43,68,.35);background:rgba(196,43,68,.1);color:var(--wine2);font-size:11px;letter-spacing:1px;padding:8px 12px;border-radius:999px;backdrop-filter:blur(18px)}
    .hero{position:relative;border:1px solid var(--line);background:linear-gradient(135deg,rgba(255,255,255,.075),rgba(255,255,255,.028));border-radius:30px;padding:24px 20px 20px;box-shadow:0 24px 80px rgba(0,0,0,.36),0 0 70px rgba(196,43,68,.1);overflow:hidden;backdrop-filter:blur(24px)}
    .hero:before{content:"";position:absolute;inset:-1px;background:linear-gradient(135deg,rgba(255,255,255,.16),transparent 42%,rgba(196,43,68,.12));pointer-events:none}.hero>*{position:relative}
    h1{font-size:30px;line-height:1.25;margin-bottom:10px;font-weight:800}.accent{color:var(--wine2)}
    .sub{font-size:14px;line-height:1.95;color:var(--muted);margin-bottom:18px}
    .score{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin:16px 0}.stat{border:1px solid var(--line);background:rgba(255,255,255,.045);border-radius:18px;padding:12px 10px;text-align:center}.stat b{display:block;font-family:'Bebas Neue';font-size:27px;letter-spacing:1px}.stat span{font-size:10px;color:var(--dim)}
    .tap{width:176px;height:176px;border-radius:50%;margin:20px auto 8px;border:1px solid rgba(196,43,68,.45);background:radial-gradient(circle at 38% 30%,rgba(196,43,68,.32),rgba(7,5,10,.95) 68%);display:flex;align-items:center;justify-content:center;flex-direction:column;box-shadow:0 0 42px rgba(196,43,68,.25),inset 0 1px 0 rgba(255,255,255,.12);user-select:none;cursor:pointer;transition:.08s transform}.tap:active{transform:scale(.94)}.tap strong{font-family:'Bebas Neue';font-size:38px;letter-spacing:5px}.tap small{color:var(--wine2);letter-spacing:2px;font-size:10px}
    .actions{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:18px}.btn{border:1px solid var(--line);background:var(--panel);color:var(--text);border-radius:18px;padding:14px 12px;font:inherit;text-align:right;cursor:pointer;backdrop-filter:blur(18px)}.btn.primary{border-color:rgba(196,43,68,.5);background:linear-gradient(135deg,rgba(196,43,68,.22),rgba(255,255,255,.045))}.btn b{display:block;font-size:14px;margin-bottom:3px}.btn span{font-size:11px;color:var(--muted)}
    .section{margin-top:18px;border:1px solid var(--line);background:var(--panel);border-radius:26px;padding:17px;backdrop-filter:blur(20px)}.section h2{font-size:16px;margin-bottom:10px}.mission{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:12px 0;border-bottom:1px solid rgba(255,255,255,.07)}.mission:last-child{border-bottom:0}.mission div{font-size:13px;color:var(--muted)}.reward{color:var(--wine2);font-weight:800;white-space:nowrap}
    .nav{position:fixed;left:50%;bottom:14px;transform:translateX(-50%);width:min(428px,calc(100% - 28px));display:grid;grid-template-columns:repeat(4,1fr);gap:8px;border:1px solid var(--line);background:rgba(7,5,10,.76);backdrop-filter:blur(28px);border-radius:24px;padding:9px;box-shadow:0 18px 60px rgba(0,0,0,.45)}.nav button{border:0;background:transparent;color:var(--muted);font:inherit;font-size:11px;padding:10px 4px;border-radius:16px}.nav button.active{background:rgba(196,43,68,.14);color:var(--wine2)}
    .toast{position:fixed;top:18px;left:50%;transform:translateX(-50%) translateY(-16px);opacity:0;border:1px solid rgba(196,43,68,.45);background:rgba(7,5,10,.82);color:var(--wine2);padding:11px 18px;border-radius:999px;transition:.25s;backdrop-filter:blur(22px);z-index:99}.toast.show{opacity:1;transform:translateX(-50%) translateY(0)}
  </style>
</head>
<body>
  <main class="app">
    <div class="top"><div class="brand">VE<span>X</span></div><div class="pill">SEASON 01</div></div>
    <section class="hero">
      <h1>امپراتوری AI خودت رو <span class="accent">بساز</span></h1>
      <p class="sub">VEX یک تجربه بازی‌گونه برای رشد، مأموریت روزانه، امتیاز، دعوت دوست و ساخت ابزارهای AI است. این نسخه وب آماده اتصال به ربات و دیتابیس پروژه است.</p>
      <div class="score"><div class="stat"><b id="coins">1240</b><span>VEX COINS</span></div><div class="stat"><b id="level">01</b><span>LEVEL</span></div><div class="stat"><b id="energy">500</b><span>ENERGY</span></div></div>
      <div class="tap" id="tap"><strong>TAP</strong><small>+25 VEX</small></div>
      <div class="actions"><button class="btn primary" onclick="toast('Upgrade system is ready for backend')"><b>🚀 ارتقا</b><span>افزایش درآمد و قدرت AI</span></button><button class="btn" onclick="toast('Referral module next')"><b>👥 دعوت دوست</b><span>جایزه رشد و رتبه</span></button><button class="btn" onclick="toast('Daily reward claimed')"><b>🎁 جایزه روزانه</b><span>استریک و پاداش فصل</span></button><button class="btn" onclick="toast('Leaderboard coming soon')"><b>🏆 رتبه‌بندی</b><span>رقابت بین کاربران</span></button></div>
    </section>
    <section class="section"><h2>🎯 مأموریت‌های امروز</h2><div class="mission"><div>یک بار وارد بازی شو</div><span class="reward">+100</span></div><div class="mission"><div>یک دوست دعوت کن</div><span class="reward">+500</span></div><div class="mission"><div>یک خروجی AI بساز</div><span class="reward">+150</span></div></section>
  </main>
  <nav class="nav"><button class="active">خانه</button><button onclick="toast('Missions')">مأموریت</button><button onclick="toast('Boosts')">ارتقا</button><button onclick="toast('Profile')">پروفایل</button></nav>
  <div class="toast" id="toast"></div>
  <script>
    const coins=document.getElementById('coins');const energy=document.getElementById('energy');const tap=document.getElementById('tap');let c=1240,e=500;
    tap.addEventListener('click',()=>{if(e<=0){toast('Energy is empty');return}c+=25;e-=5;coins.textContent=c.toLocaleString('en-US');energy.textContent=e;toast('+25 VEX');});
    function toast(t){const el=document.getElementById('toast');el.textContent=t;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),1200)}
  </script>
</body>
</html>`;
