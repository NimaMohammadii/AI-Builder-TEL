export const REFERRAL_SECTION = `<section id="referral" class="view referral-view">
  <style>
    #referral{overflow-y:auto!important;overflow-x:hidden!important;padding-bottom:120px!important;-webkit-overflow-scrolling:touch;scrollbar-width:none;font-family:var(--font-main)!important;letter-spacing:0!important}
    #referral *{font-family:var(--font-main)!important;letter-spacing:0!important}
    #referral::-webkit-scrollbar{display:none}
    .referral-shell{display:grid;gap:12px;padding-top:2px}
    .referral-hero{border:0;border-radius:30px;background:linear-gradient(135deg,rgba(255,255,255,.055),rgba(90,8,18,.11));box-shadow:inset 0 1px 0 rgba(255,255,255,.08),0 18px 44px rgba(0,0,0,.24);backdrop-filter:blur(3px) saturate(1.14);-webkit-backdrop-filter:blur(3px) saturate(1.14);padding:18px 16px;display:grid;gap:13px;color:#fff;overflow:hidden;position:relative}
    .referral-hero:before{content:"";position:absolute;inset:auto -42px -72px auto;width:160px;height:160px;border-radius:999px;background:radial-gradient(circle,rgba(115,16,35,.32),rgba(115,16,35,0) 68%);pointer-events:none}
    .referral-hero-top{display:flex;align-items:center;gap:12px;position:relative;z-index:1}
    .referral-hero-icon{width:52px;height:52px;min-width:52px;border-radius:21px;display:grid;place-items:center;color:rgba(255,255,255,.9);background:rgba(255,255,255,.06);box-shadow:inset 0 1px 0 rgba(255,255,255,.1),0 12px 28px rgba(0,0,0,.2)}
    .referral-hero-icon svg{width:34px;height:34px;display:block}
    .referral-hero h2{margin:0;font-size:24px;line-height:1;font-weight:800;color:#fff}
    .referral-hero p{margin:4px 0 0;font-size:12px;line-height:1.35;font-weight:500;color:rgba(255,255,255,.56)}
    .referral-reward-pill{position:relative;z-index:1;border-radius:20px;background:rgba(255,255,255,.055);box-shadow:inset 0 1px 0 rgba(255,255,255,.08);padding:12px;display:flex;align-items:center;justify-content:space-between;gap:10px}
    .referral-reward-pill span{font-size:11px;font-weight:600;color:rgba(255,255,255,.55)}
    .referral-reward-pill strong{font-size:18px;line-height:1;font-weight:800;color:#fff;white-space:nowrap}
    .referral-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
    .referral-stat{border:0;border-radius:22px;background:rgba(255,255,255,.035);box-shadow:inset 0 1px 0 rgba(255,255,255,.065),0 12px 28px rgba(0,0,0,.18);padding:12px;color:#fff;display:grid;gap:5px;text-align:center}
    .referral-stat strong{font-size:18px;line-height:1;font-weight:800;color:#fff}
    .referral-stat span{font-size:10.5px;line-height:1.2;font-weight:500;color:rgba(255,255,255,.48)}
    .referral-link-card{border:0;border-radius:26px;background:rgba(255,255,255,.035);box-shadow:inset 0 1px 0 rgba(255,255,255,.07),0 14px 34px rgba(0,0,0,.22);padding:14px;color:#fff;display:grid;gap:10px}
    .referral-link-card label{font-size:11px;font-weight:600;color:rgba(255,255,255,.52);text-transform:none}
    .referral-link-box{height:44px;border-radius:18px;background:rgba(0,0,0,.22);box-shadow:inset 0 1px 0 rgba(255,255,255,.055);display:flex;align-items:center;padding:0 12px;color:rgba(255,255,255,.66);font-size:12px;font-weight:500;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}
    .referral-actions{display:grid;grid-template-columns:1fr 1fr;gap:10px}
    .referral-action{height:46px;border:0;border-radius:18px;background:rgba(255,255,255,.065);box-shadow:inset 0 1px 0 rgba(255,255,255,.09),0 12px 28px rgba(0,0,0,.18);color:#fff;font-size:12px;font-weight:700}
    .referral-note{margin:0;color:rgba(255,255,255,.42);font-size:11px;line-height:1.35;font-weight:500;text-align:center}
    .referral-list{display:grid;gap:8px}
    .referral-row{border:0;border-radius:18px;background:rgba(255,255,255,.03);box-shadow:inset 0 1px 0 rgba(255,255,255,.055);padding:11px 12px;display:flex;align-items:center;justify-content:space-between;gap:10px;color:#fff}
    .referral-row strong{font-size:12px;font-weight:650}.referral-row span{font-size:11px;color:rgba(255,255,255,.52)}
  </style>
  <div class="referral-shell">
    <section class="referral-hero">
      <div class="referral-hero-top">
        <span class="referral-hero-icon" aria-hidden="true"><svg viewBox="0 0 48 48" fill="none"><path d="M15 26h13" stroke="currentColor" stroke-width="3.3" stroke-linecap="round"/><path d="M24 19l7 7-7 7" stroke="currentColor" stroke-width="3.3" stroke-linecap="round" stroke-linejoin="round"/><circle cx="13" cy="26" r="6.5" stroke="currentColor" stroke-opacity=".45" stroke-width="2.6"/><circle cx="36" cy="15" r="5.5" fill="currentColor" opacity=".26"/><circle cx="36" cy="37" r="5.5" fill="currentColor" opacity=".26"/></svg></span>
        <span><h2>Referral Rewards</h2><p>Invite friends and earn TON after their first deposit.</p></span>
      </div>
      <div class="referral-reward-pill"><span>Reward per valid friend</span><strong>0.1 TON</strong></div>
    </section>
    <section class="referral-stats">
      <div class="referral-stat"><strong id="referralInvitedCount">0</strong><span>Invited</span></div>
      <div class="referral-stat"><strong id="referralRewardedCount">0</strong><span>Rewarded</span></div>
      <div class="referral-stat"><strong id="referralEarnedTon">0</strong><span>TON earned</span></div>
    </section>
    <section class="referral-link-card">
      <label>Your referral link</label>
      <div id="referralLinkBox" class="referral-link-box">Loading referral link</div>
      <div class="referral-actions">
        <button id="referralCopyButton" class="referral-action" type="button">Copy Link</button>
        <button id="referralShareButton" class="referral-action" type="button">Share</button>
      </div>
      <p class="referral-note">Reward unlocks when your invited friend makes their first deposit.</p>
    </section>
    <section class="referral-link-card">
      <label>Recent referrals</label>
      <div id="referralList" class="referral-list"><p class="referral-note">No referrals yet</p></div>
    </section>
  </div>
  <script>
  (function(){
    if(window.__vexaReferralReady)return;window.__vexaReferralReady=true;
    var tg=window.Telegram&&window.Telegram.WebApp;
    function q(id){return document.getElementById(id)}
    function uid(){return String((tg&&tg.initDataUnsafe&&tg.initDataUnsafe.user&&tg.initDataUnsafe.user.id)||localStorage.getItem('ownerId')||'')}
    function bot(){return 'VexaAppBOT'}
    function refFromUrl(){try{var p=new URLSearchParams(location.search);var ref=p.get('ref')||p.get('startapp')||'';var start=(tg&&tg.initDataUnsafe&&tg.initDataUnsafe.start_param)||'';ref=ref||start;return String(ref).replace(/^ref[_-]/,'').replace(/[^0-9A-Za-z_-]/g,'').slice(0,80)}catch(e){return ''}}
    function linkFor(id){return 'https://t.me/'+bot()+'?startapp=ref_'+encodeURIComponent(id)}
    function formatTon(nano){var n=Math.max(0,Math.floor(Number(nano)||0));return (n/1000000000).toFixed(1).replace(/\.0$/,'')}
    async function api(path,opt){var r=await fetch(path,Object.assign({headers:{'content-type':'application/json','cache-control':'no-store'}},opt||{}));var j=await r.json().catch(function(){return{}});if(!r.ok)throw new Error(j.error||'Request failed');return j}
    async function claimIfNeeded(id){var ref=refFromUrl();if(!id||!ref||ref===id)return;try{await api('/app/api/referral/claim',{method:'POST',body:JSON.stringify({userId:id,ref:ref})})}catch(e){}}
    function renderList(items){var box=q('referralList');if(!box)return;if(!items||!items.length){box.innerHTML='<p class="referral-note">No referrals yet</p>';return}box.innerHTML=items.slice(0,8).map(function(item){return '<div class="referral-row"><strong>'+String(item.invitedUserId||'Friend')+'</strong><span>'+(item.status==='rewarded'?'Rewarded':'Pending')+'</span></div>'}).join('')}
    async function load(){var id=uid();var link=linkFor(id||'');var linkBox=q('referralLinkBox');if(linkBox)linkBox.textContent=id?link:'Telegram user not found';if(id)localStorage.setItem('ownerId',id);await claimIfNeeded(id);if(!id)return;try{var data=await api('/app/api/referral?userId='+encodeURIComponent(id));if(q('referralInvitedCount'))q('referralInvitedCount').textContent=String(data.invitedCount||0);if(q('referralRewardedCount'))q('referralRewardedCount').textContent=String(data.rewardedCount||0);if(q('referralEarnedTon'))q('referralEarnedTon').textContent=formatTon(data.earnedNano||0);renderList(data.referrals||[])}catch(e){}}
    document.addEventListener('click',function(ev){var id=uid();if(!id)return;var link=linkFor(id);if(ev.target&&ev.target.closest&&ev.target.closest('#referralCopyButton')){ev.preventDefault();try{navigator.clipboard&&navigator.clipboard.writeText(link)}catch(e){}var b=q('referralCopyButton');if(b){b.textContent='Copied';setTimeout(function(){b.textContent='Copy Link'},1200)}}if(ev.target&&ev.target.closest&&ev.target.closest('#referralShareButton')){ev.preventDefault();var url='https://t.me/share/url?url='+encodeURIComponent(link)+'&text='+encodeURIComponent('Join Vexa and play TON games');if(tg&&tg.openTelegramLink)tg.openTelegramLink(url);else location.href=url}},true);
    document.addEventListener('click',function(){setTimeout(function(){if(document.getElementById('referral')&&document.getElementById('referral').classList.contains('active'))load()},80)},true);
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',load);else setTimeout(load,100);
  })();
  </script>
</section>`;