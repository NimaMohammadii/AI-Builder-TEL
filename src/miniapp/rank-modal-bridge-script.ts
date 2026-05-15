export const RANK_MODAL_BRIDGE_SCRIPT = `
(function(){
  var ranks=[
    {name:'Rookie',range:'Level 1-3',text:'Start your Vexa journey.'},
    {name:'Explorer',range:'Level 4-7',text:'Discover games, AI and rewards.'},
    {name:'Pro',range:'Level 8-14',text:'Consistent player with momentum.'},
    {name:'Elite',range:'Level 15-24',text:'Premium status and activity.'},
    {name:'Master',range:'Level 25-39',text:'Advanced user with control.'},
    {name:'Legend',range:'Level 40-59',text:'Rare profile with prestige.'},
    {name:'Titan',range:'Level 60+',text:'Highest Vexa FLOW status.'}
  ];
  function esc(v){return String(v==null?'':v).replace(/[&<>]/g,function(s){return {'&':'&amp;','<':'&lt;','>':'&gt;'}[s]||s})}
  function rankFromLevel(level){level=Math.max(1,Math.floor(Number(level)||1));if(level>=60)return 'Titan';if(level>=40)return 'Legend';if(level>=25)return 'Master';if(level>=15)return 'Elite';if(level>=8)return 'Pro';if(level>=4)return 'Explorer';return 'Rookie'}
  function currentLevel(){var m=String((document.getElementById('userLine')||{}).textContent||'').match(/Level\s+(\d+)/i);return m&&m[1]?Math.max(1,Number(m[1])||1):1}
  function currentRank(){var pill=document.getElementById('rankPill');var text=String(pill&&pill.textContent||'').trim();return ranks.some(function(r){return r.name===text})?text:rankFromLevel(currentLevel())}
  function rankUrl(name){return '/app/api/rank-character/'+encodeURIComponent(name)+'.png?v='+String(window.__vexaAppVersion||'rank')}
  function ensure(){
    var old=document.getElementById('vexaRankModal');
    if(old)return old;
    var style=document.createElement('style');
    style.id='vexaRankBridgeStyle';
    style.textContent='.vexa-rank-overlay{position:fixed;inset:0;z-index:9999;display:flex;align-items:flex-start;justify-content:center;padding:calc(78px + env(safe-area-inset-top)) 18px 24px;background:rgba(0,0,0,.04);opacity:0;pointer-events:none;transition:opacity .24s ease}.vexa-rank-overlay.open{opacity:1;pointer-events:auto}.vexa-rank-card{width:min(100%,390px);overflow:hidden;border:0;border-radius:30px;background:linear-gradient(135deg,rgba(255,255,255,.072),rgba(255,255,255,.026));backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);box-shadow:0 24px 78px rgba(0,0,0,.44),inset 0 1px 0 rgba(255,255,255,.09);transform:translateY(-14px) scale(.965);opacity:.2;transition:transform .32s cubic-bezier(.2,.9,.2,1),opacity .24s ease}.vexa-rank-overlay.open .vexa-rank-card{transform:translateY(0) scale(1);opacity:1}.vexa-rank-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;padding:16px 16px 9px}.vexa-rank-eyebrow{margin:0 0 3px;color:rgba(255,255,255,.45);font-size:9px;font-weight:950;text-transform:uppercase;letter-spacing:.16em}.vexa-rank-head h3{margin:0;color:#fff;font-size:28px;line-height:.92;letter-spacing:-.065em}.vexa-rank-head p{margin:7px 0 0;color:rgba(255,255,255,.56);font-size:11px;line-height:1.25;max-width:260px}.vexa-rank-close{width:34px;height:34px;border:0;border-radius:999px;background:rgba(255,255,255,.08);color:#fff;font-size:18px;font-weight:900}.vexa-rank-list{padding:2px 12px 12px}.vexa-rank-row{display:grid;grid-template-columns:42px 1fr auto;gap:10px;align-items:center;margin:6px 0;padding:8px 10px;border:1px solid rgba(255,255,255,.08);border-radius:18px;background:rgba(255,255,255,.033);min-height:54px}.vexa-rank-row.current{border-color:rgba(255,255,255,.25);background:linear-gradient(135deg,rgba(255,255,255,.12),rgba(192,58,91,.14));box-shadow:0 10px 30px rgba(192,58,91,.11),inset 0 1px 0 rgba(255,255,255,.1)}.vexa-rank-badge{width:42px;height:42px;border-radius:15px;overflow:hidden;border:1px solid rgba(255,255,255,.11);background:rgba(0,0,0,.16)}.vexa-rank-badge img{width:100%;height:100%;object-fit:cover;display:block}.vexa-rank-name{color:#fff;font-size:15px;font-weight:950;line-height:1}.vexa-rank-desc{margin-top:3px;color:rgba(255,255,255,.5);font-size:10px;line-height:1.2}.vexa-rank-range{color:rgba(255,255,255,.68);font-size:10px;font-weight:950;white-space:nowrap}.vexa-rank-now{display:inline-flex;margin-top:5px;padding:3px 7px;border-radius:999px;background:#fff;color:#050505;font-size:8.5px;font-weight:950}.brand{cursor:pointer!important;position:relative}.brand:after{content:"";position:absolute;inset:-8px;z-index:3;border-radius:34px}.brand>*{position:relative;z-index:4}@media(max-height:720px){.vexa-rank-overlay{padding-top:calc(64px + env(safe-area-inset-top))}.vexa-rank-head{padding:13px 15px 6px}.vexa-rank-head h3{font-size:24px}.vexa-rank-row{margin:5px 0;min-height:49px}.vexa-rank-badge{width:38px;height:38px}.vexa-rank-desc{font-size:9.2px}}';
    document.head.appendChild(style);
    var overlay=document.createElement('div');
    overlay.id='vexaRankModal';
    overlay.className='vexa-rank-overlay';
    overlay.innerHTML='<div class="vexa-rank-card" role="dialog" aria-modal="true"><div class="vexa-rank-head"><div><p class="vexa-rank-eyebrow">Vexa FLOW</p><h3>Rank System</h3><p>Level up to unlock higher status and profile prestige.</p></div><button class="vexa-rank-close" type="button" data-rank-close>×</button></div><div class="vexa-rank-list" data-rank-list></div></div>';
    overlay.addEventListener('click',function(e){if(e.target===overlay||e.target.closest('[data-rank-close]'))close()});
    document.body.appendChild(overlay);
    return overlay;
  }
  function render(){
    var overlay=ensure();
    var list=overlay.querySelector('[data-rank-list]');
    var cur=currentRank();
    var lvl=currentLevel();
    list.innerHTML=ranks.map(function(r){var isCur=r.name===cur;return '<div class="vexa-rank-row '+(isCur?'current':'')+'"><div class="vexa-rank-badge"><img src="'+rankUrl(r.name)+'" alt="" decoding="async"/></div><div><div class="vexa-rank-name">'+esc(r.name)+'</div><div class="vexa-rank-desc">'+esc(r.text)+'</div>'+(isCur?'<span class="vexa-rank-now">Current rank · Level '+lvl+'</span>':'')+'</div><div class="vexa-rank-range">'+esc(r.range)+'</div></div>'}).join('');
  }
  function open(){try{if(window.VexaLevel&&window.VexaLevel.openRanks&&window.__preferVexaLevelRanks){window.VexaLevel.openRanks();return}}catch(e){}render();var overlay=ensure();requestAnimationFrame(function(){overlay.classList.add('open')})}
  function close(){var overlay=document.getElementById('vexaRankModal');if(overlay)overlay.classList.remove('open')}
  window.openVexaRankModal=open;
  document.addEventListener('click',function(e){var target=e.target&&e.target.closest&&e.target.closest('.brand');if(!target)return;e.preventDefault();e.stopPropagation();open()},true);
  document.addEventListener('touchend',function(e){var target=e.target&&e.target.closest&&e.target.closest('.brand');if(!target)return;e.preventDefault();e.stopPropagation();open()},true);
})();
`;
