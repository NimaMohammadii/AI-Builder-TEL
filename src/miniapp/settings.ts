export const SETTINGS_STYLES = `
  #settings{padding:2px 16px 118px;font-family:ui-rounded,"SF Pro Rounded","Nunito",system-ui,sans-serif}
  .vexa-settings-head{padding:16px 4px 18px;animation:vexa-settings-rise .42s cubic-bezier(.2,.8,.2,1) both}
  .vexa-settings-eyebrow{margin:0 0 7px;color:rgba(255,255,255,.42);font-size:10px;font-weight:850;letter-spacing:.11em;text-transform:uppercase}
  .vexa-settings-head h2{margin:0;color:#fff;font-size:30px;line-height:1;letter-spacing:-.06em;font-weight:900}
  .vexa-settings-head p{margin:10px 0 0;color:rgba(255,255,255,.5);font-size:13px;font-weight:650}
  .vexa-settings-card{margin:0 0 14px;padding:15px;border:1px solid rgba(255,255,255,.1);border-radius:24px;background:linear-gradient(145deg,rgba(255,255,255,.09),rgba(255,255,255,.035));box-shadow:inset 0 1px 0 rgba(255,255,255,.12),0 14px 34px rgba(0,0,0,.18);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);animation:vexa-settings-rise .42s .05s cubic-bezier(.2,.8,.2,1) both}
  .vexa-settings-card+.vexa-settings-card{animation-delay:.1s}
  .vexa-settings-label{display:flex;align-items:center;justify-content:space-between;margin:0 2px 12px;color:rgba(255,255,255,.56);font-size:11px;font-weight:850;letter-spacing:.06em;text-transform:uppercase}
  .vexa-settings-value{color:#fff;font-size:11px;font-weight:850;letter-spacing:0;text-transform:none}
  .vexa-settings-actions{display:grid;grid-template-columns:1fr 1fr;gap:10px}
  .vexa-settings-action{min-height:82px;padding:13px;border:1px solid rgba(255,255,255,.1);border-radius:18px;color:#fff;text-align:left;background:rgba(255,255,255,.055);font:inherit;transition:transform .2s ease,background .2s ease,border-color .2s ease}
  .vexa-settings-action:active{transform:scale(.96);background:rgba(143,29,61,.26);border-color:rgba(214,83,116,.45)}
  .vexa-settings-action b{display:block;margin-top:8px;font-size:13px;font-weight:900;letter-spacing:-.025em}
  .vexa-settings-action span{display:block;color:rgba(255,255,255,.5);font-size:11px;font-weight:700}
  .vexa-settings-icon{font-size:19px;line-height:1}
  .vexa-country-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
  .vexa-country{display:flex;align-items:center;gap:8px;min-height:46px;padding:0 11px;border:1px solid rgba(255,255,255,.085);border-radius:15px;color:rgba(255,255,255,.76);background:rgba(255,255,255,.04);font:inherit;font-size:12px;font-weight:800;text-align:left;transition:transform .18s ease,background .18s ease,border-color .18s ease,color .18s ease}
  .vexa-country:active{transform:scale(.96)}
  .vexa-country.is-selected{color:#fff;border-color:rgba(213,72,108,.7);background:linear-gradient(135deg,rgba(132,24,55,.72),rgba(215,70,106,.36));box-shadow:0 8px 20px rgba(104,16,43,.25)}
  .vexa-country-mark{margin-left:auto;opacity:0;font-size:12px;transform:scale(.7);transition:opacity .18s ease,transform .18s ease}
  .vexa-country.is-selected .vexa-country-mark{opacity:1;transform:scale(1)}
  @keyframes vexa-settings-rise{from{opacity:0;transform:translateY(12px) scale(.985)}to{opacity:1;transform:none}}
`;

export const SETTINGS_SECTION = `
<section id="settings" class="view">
  <header class="vexa-settings-head">
    <p class="vexa-settings-eyebrow">Vexa preferences</p>
    <h2>Settings</h2>
    <p>Personalize your Vexa experience.</p>
  </header>
  <section class="vexa-settings-card">
    <div class="vexa-settings-label">Quick actions</div>
    <div class="vexa-settings-actions">
      <button class="vexa-settings-action" type="button" data-settings-action="open-chat"><i class="vexa-settings-icon">◌</i><b>Open Chat</b><span>Talk to Vexa</span></button>
      <button class="vexa-settings-action" type="button" data-settings-action="invite-friends"><i class="vexa-settings-icon">↗</i><b>Invite Friends</b><span>Share Vexa</span></button>
    </div>
  </section>
  <section class="vexa-settings-card">
    <div class="vexa-settings-label">Your country <span id="vexaCountryValue" class="vexa-settings-value">Not selected</span></div>
    <div class="vexa-country-grid" id="vexaCountryGrid"></div>
  </section>
</section>`;

export const SETTINGS_SCRIPT = `
(function(){
  var root=document.getElementById('settings');if(!root||root.dataset.vexaSettingsBound)return;
  root.dataset.vexaSettingsBound='1';
  var tg=window.Telegram&&window.Telegram.WebApp;
  var user=tg&&tg.initDataUnsafe&&tg.initDataUnsafe.user;
  var key='vexa:country:'+String((user&&user.id)||localStorage.getItem('ownerId')||'guest');
  var countries=[
    ['IR','🇮🇷','Iran'],['TR','🇹🇷','Turkey'],['DE','🇩🇪','Germany'],['AE','🇦🇪','UAE'],
    ['SA','🇸🇦','Saudi Arabia'],['RU','🇷🇺','Russia'],['IN','🇮🇳','India'],['BR','🇧🇷','Brazil'],
    ['US','🇺🇸','United States'],['OTHER','🌐','Other']
  ];
  var grid=root.querySelector('#vexaCountryGrid'),value=root.querySelector('#vexaCountryValue');
  function read(){try{return localStorage.getItem(key)||''}catch(e){return ''}}
  function write(code){try{localStorage.setItem(key,code)}catch(e){}}
  function render(){var selected=read();if(value){var found=countries.filter(function(item){return item[0]===selected})[0];value.textContent=found?found[1]+' '+found[2]:'Not selected'}grid.innerHTML=countries.map(function(item){var active=item[0]===selected;return '<button class="vexa-country'+(active?' is-selected':'')+'" type="button" data-country="'+item[0]+'"><span>'+item[1]+'</span><span>'+item[2]+'</span><b class="vexa-country-mark">✓</b></button>'}).join('')}
  function openLink(url){try{if(tg&&tg.openTelegramLink){tg.openTelegramLink(url);return}}catch(e){}window.location.href=url}
  root.addEventListener('click',function(event){var country=event.target.closest('[data-country]');if(country){write(country.getAttribute('data-country')||'');render();try{window.dispatchEvent(new CustomEvent('vexa:country-changed',{detail:{country:read()}}))}catch(e){}return}var action=event.target.closest('[data-settings-action]');if(!action)return;if(action.getAttribute('data-settings-action')==='open-chat')openLink('https://t.me/VexaAppBOT');if(action.getAttribute('data-settings-action')==='invite-friends')openLink('https://t.me/share/url?url='+encodeURIComponent('https://t.me/VexaAppBOT')+'&text='+encodeURIComponent('Play Vexa with me'))});
  render();
})();`;
