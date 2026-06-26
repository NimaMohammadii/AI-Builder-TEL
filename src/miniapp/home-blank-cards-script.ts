export const HOME_BLANK_CARDS_SCRIPT = `
(function(){
  var LETTERS='ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  var ROW_HEIGHT=48;

  function q(sel,root){return (root||document).querySelector(sel)}
  function qa(sel,root){return Array.prototype.slice.call((root||document).querySelectorAll(sel))}

  function ensureStyle(){
    var old=q('#homeLuckyCodeStyle');
    if(old)old.remove();
    var style=document.createElement('style');
    style.id='homeLuckyCodeStyle';
    style.textContent=[
      '#home .home-finance-split{display:none!important}',
      '#home .home-intro-card{display:grid!important;pointer-events:none!important;user-select:none!important;-webkit-user-select:none!important;margin-bottom:14px!important}',
      '#home .home-intro-card *{pointer-events:none!important}',
      '#homeLuckyCodeSection{padding:0 0 18px!important;display:grid!important;gap:14px!important}',
      '.home-lucky-card{position:relative!important;overflow:hidden!important;border-radius:34px!important;padding:17px!important;background:linear-gradient(180deg,rgba(255,255,255,.07),rgba(255,255,255,.026))!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.11),0 24px 56px rgba(0,0,0,.36)!important;backdrop-filter:blur(18px) saturate(1.08)!important;-webkit-backdrop-filter:blur(18px) saturate(1.08)!important}',
      '.home-lucky-card:before{content:"";position:absolute;inset:1px;border-radius:33px;background:linear-gradient(180deg,rgba(255,255,255,.035),transparent 44%,rgba(0,0,0,.12));pointer-events:none!important}',
      '.home-lucky-card:after{content:"";position:absolute;inset:0;border-radius:inherit;pointer-events:none;border:1px solid rgba(255,255,255,.09)!important}',
      '.home-lucky-head{display:flex!important;align-items:center!important;justify-content:space-between!important;gap:12px!important;margin-bottom:14px!important;position:relative!important;z-index:1!important}',
      '.home-lucky-titlebox{min-width:0!important;display:grid!important;gap:5px!important}',
      '.home-lucky-titlebox strong{font-size:19px!important;line-height:1!important;font-weight:950!important;letter-spacing:-.05em!important;color:#fff!important}',
      '.home-lucky-titlebox span{font-size:11px!important;line-height:1.25!important;font-weight:760!important;color:rgba(255,255,255,.5)!important}',
      '.home-lucky-head-badge{flex:0 0 auto;border-radius:999px!important;padding:7px 10px!important;background:rgba(255,255,255,.055)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.08)!important;color:rgba(255,255,255,.58)!important;font-size:10px!important;font-weight:900!important;letter-spacing:.06em!important}',
      '.home-lucky-machine{position:relative!important;z-index:1!important;display:grid!important;grid-template-columns:repeat(6,minmax(0,1fr))!important;gap:8px!important;padding:11px!important;border-radius:28px!important;background:linear-gradient(180deg,rgba(0,0,0,.38),rgba(0,0,0,.24))!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.075),inset 0 -16px 36px rgba(0,0,0,.22),0 16px 34px rgba(0,0,0,.16)!important;overflow:hidden!important}',
      '.home-lucky-machine:before,.home-lucky-machine:after{content:"";position:absolute;left:12px;right:12px;height:32px;z-index:3;pointer-events:none}.home-lucky-machine:before{top:10px;background:linear-gradient(180deg,rgba(6,6,7,.96),transparent)}.home-lucky-machine:after{bottom:10px;background:linear-gradient(0deg,rgba(6,6,7,.96),transparent)}',
      '.home-lucky-window-line{position:absolute!important;left:12px!important;right:12px!important;top:50%!important;height:48px!important;transform:translateY(-50%)!important;border-radius:19px!important;border:1px solid rgba(255,255,255,.055)!important;background:linear-gradient(180deg,rgba(255,255,255,.035),rgba(255,255,255,.01))!important;z-index:0!important;pointer-events:none!important}',
      '.home-lucky-reel{height:48px!important;border-radius:18px!important;overflow:hidden!important;position:relative!important;background:linear-gradient(180deg,rgba(255,255,255,.085),rgba(255,255,255,.03))!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.12),inset 0 -10px 22px rgba(0,0,0,.16),0 10px 22px rgba(0,0,0,.15)!important;z-index:1!important}',
      '.home-lucky-reel:before{content:"";position:absolute;inset:0;border-radius:inherit;border:1px solid rgba(255,255,255,.075);z-index:2;pointer-events:none}',
      '.home-lucky-reel:after{content:"";position:absolute;left:5px;right:5px;top:4px;height:12px;border-radius:999px;background:linear-gradient(180deg,rgba(255,255,255,.105),transparent);z-index:2;pointer-events:none}',
      '.home-lucky-strip{will-change:transform!important;transform:translate3d(0,0,0)}',
      '.home-lucky-letter{height:48px!important;display:grid!important;place-items:center!important;color:#fff!important;font-size:23px!important;font-weight:950!important;letter-spacing:-.04em!important;text-shadow:0 9px 20px rgba(0,0,0,.48)!important}',
      '.home-lucky-reel.is-spinning{box-shadow:inset 0 1px 0 rgba(255,255,255,.15),0 15px 26px rgba(0,0,0,.22)!important}',
      '.home-lucky-code{height:40px!important;margin:13px 0!important;border-radius:18px!important;display:flex!important;align-items:center!important;justify-content:center!important;gap:8px!important;background:rgba(255,255,255,.04)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.055)!important;color:rgba(255,255,255,.62)!important;font-size:12px!important;font-weight:800!important;letter-spacing:.03em!important;position:relative!important;z-index:1!important}',
      '.home-lucky-code b{color:#fff!important;font-size:14px!important;letter-spacing:.16em!important}',
      '.home-lucky-spin{position:relative!important;z-index:1!important;width:100%!important;height:54px!important;border-radius:22px!important;border:0!important;background:#fff!important;color:#090909!important;font-size:16px!important;font-weight:950!important;letter-spacing:-.025em!important;box-shadow:0 18px 42px rgba(255,255,255,.09),0 14px 34px rgba(0,0,0,.18)!important}',
      '.home-lucky-spin:active{transform:scale(.988)!important}',
      '.home-lucky-spin[disabled]{opacity:.72!important;transform:none!important}',
      '.home-lucky-note{position:relative!important;z-index:1!important;margin:10px 0 0!important;text-align:center!important;color:rgba(255,255,255,.44)!important;font-size:11px!important;font-weight:720!important;line-height:1.35!important}'
    ].join('');
    document.head.appendChild(style);
  }

  function reelHtml(){
    var html='';
    for(var round=0;round<2;round++){
      for(var i=0;i<LETTERS.length;i++)html+='<div class="home-lucky-letter">'+LETTERS.charAt(i)+'</div>';
    }
    return html;
  }

  function ensureSection(){
    var home=q('#home');
    if(!home)return null;
    var old=q('#homeLuckyCodeSection',home);
    if(old)old.remove();
    var section=document.createElement('section');
    section.id='homeLuckyCodeSection';
    section.innerHTML='<div class="home-lucky-card"><div class="home-lucky-head"><div class="home-lucky-titlebox"><strong>Lucky Code</strong><span>Free ticket code machine</span></div><div class="home-lucky-head-badge">TEST MODE</div></div><div class="home-lucky-machine" id="homeLuckyMachine"><div class="home-lucky-window-line"></div>'+Array(6).fill(0).map(function(){return '<div class="home-lucky-reel"><div class="home-lucky-strip">'+reelHtml()+'</div></div>'}).join('')+'</div><div class="home-lucky-code">Current code <b id="homeLuckyCode">------</b></div><button class="home-lucky-spin" id="homeLuckySpin" type="button">Spin</button><p class="home-lucky-note">Front-end test only. Later tickets can come from invites or daily tasks.</p></div>';
    var anchor=q('#depositSheet',home);
    home.insertBefore(section,anchor||home.firstChild);
    return section;
  }

  function bindSpin(section){
    var btn=q('#homeLuckySpin',section);
    var code=q('#homeLuckyCode',section);
    var reels=qa('.home-lucky-reel',section);
    if(!btn||!code||!reels.length)return;
    var busy=false;
    btn.addEventListener('click',function(){
      if(busy)return;
      busy=true;
      btn.disabled=true;
      btn.textContent='Spinning...';
      var letters=[];
      var done=0;
      reels.forEach(function(reel,index){
        var strip=q('.home-lucky-strip',reel);
        if(!strip)return;
        var target=Math.floor(Math.random()*LETTERS.length);
        letters[index]=LETTERS.charAt(target);
        reel.classList.add('is-spinning');
        strip.style.transition='none';
        strip.style.transform='translate3d(0,0,0)';
        strip.offsetHeight;
        strip.style.transition='transform '+(5000+index*200)+'ms cubic-bezier(.08,.78,.14,1)';
        strip.style.transform='translate3d(0,'+(-(LETTERS.length+target)*ROW_HEIGHT)+'px,0)';
        var ended=false;
        strip.addEventListener('transitionend',function finish(){
          if(ended)return;
          ended=true;
          strip.removeEventListener('transitionend',finish);
          strip.style.transition='none';
          strip.style.transform='translate3d(0,'+(-target*ROW_HEIGHT)+'px,0)';
          reel.classList.remove('is-spinning');
          done++;
          if(done===reels.length){
            code.textContent=letters.join('');
            btn.disabled=false;
            btn.textContent='Spin';
            busy=false;
          }
        });
      });
    });
  }

  function init(){
    ensureStyle();
    var section=ensureSection();
    if(section)bindSpin(section);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
`;