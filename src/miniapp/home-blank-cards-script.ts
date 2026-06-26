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
      '.home-lucky-hero{position:relative!important;overflow:hidden!important;border-radius:36px!important;padding:18px!important;min-height:148px!important;background:radial-gradient(circle at 78% 18%,rgba(255,255,255,.14),transparent 30%),radial-gradient(circle at 18% 88%,rgba(139,29,61,.34),transparent 38%),linear-gradient(145deg,rgba(255,255,255,.105),rgba(255,255,255,.026))!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.13),0 24px 58px rgba(0,0,0,.32)!important}',
      '.home-lucky-hero:before{content:"";position:absolute;right:-44px;top:-58px;width:168px;height:168px;border-radius:999px;background:rgba(255,255,255,.055);box-shadow:0 0 0 34px rgba(255,255,255,.025),0 0 72px rgba(150,28,62,.28);pointer-events:none}',
      '.home-lucky-kicker{display:inline-flex!important;align-items:center!important;gap:7px!important;height:28px!important;padding:0 10px!important;border-radius:999px!important;background:rgba(255,255,255,.07)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.1)!important;color:rgba(255,255,255,.72)!important;font-size:10px!important;font-weight:900!important;letter-spacing:.08em!important;text-transform:uppercase!important}',
      '.home-lucky-kicker i{width:6px;height:6px;border-radius:999px;background:#fff;box-shadow:0 0 18px rgba(255,255,255,.9)}',
      '.home-lucky-title{position:relative;z-index:1;margin:13px 0 8px!important;font-size:33px!important;line-height:.92!important;font-weight:950!important;letter-spacing:-.075em!important;color:#fff!important;text-shadow:0 12px 34px rgba(0,0,0,.38)!important}',
      '.home-lucky-copy{position:relative;z-index:1;margin:0!important;max-width:260px!important;color:rgba(255,255,255,.58)!important;font-size:12.5px!important;line-height:1.38!important;font-weight:700!important}',
      '.home-lucky-ticket{position:absolute!important;right:16px!important;bottom:16px!important;width:74px!important;height:74px!important;border-radius:26px!important;background:linear-gradient(145deg,rgba(255,255,255,.16),rgba(255,255,255,.04))!important;display:grid!important;place-items:center!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.15),0 18px 34px rgba(0,0,0,.24)!important;color:#fff!important;font-size:34px!important;font-weight:950!important;transform:rotate(-7deg)!important}',
      '.home-lucky-card{position:relative!important;overflow:hidden!important;border-radius:38px!important;padding:16px!important;background:radial-gradient(circle at 50% -18%,rgba(255,255,255,.12),transparent 38%),linear-gradient(180deg,rgba(255,255,255,.082),rgba(255,255,255,.024))!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.12),0 26px 62px rgba(0,0,0,.38)!important}',
      '.home-lucky-card:before{content:"";position:absolute;inset:1px;border-radius:37px;background:linear-gradient(180deg,rgba(255,255,255,.035),transparent 42%,rgba(0,0,0,.16));pointer-events:none!important}',
      '.home-lucky-card:after{content:"";position:absolute;inset:0;border-radius:inherit;pointer-events:none;border:1px solid rgba(255,255,255,.095)!important}',
      '.home-lucky-head{display:flex!important;align-items:center!important;justify-content:space-between!important;gap:12px!important;margin-bottom:13px!important;position:relative!important;z-index:1!important}',
      '.home-lucky-head strong{font-size:17px!important;line-height:1!important;font-weight:950!important;letter-spacing:-.045em!important;color:#fff!important}',
      '.home-lucky-head span{min-width:76px;text-align:center;border-radius:999px!important;padding:7px 10px!important;background:rgba(255,255,255,.06)!important;color:rgba(255,255,255,.62)!important;font-size:10px!important;font-weight:900!important;letter-spacing:.06em!important}',
      '.home-lucky-machine{position:relative!important;z-index:1!important;display:grid!important;grid-template-columns:repeat(6,minmax(0,1fr))!important;gap:8px!important;padding:11px!important;border-radius:31px!important;background:linear-gradient(180deg,rgba(0,0,0,.43),rgba(0,0,0,.26))!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.09),inset 0 -18px 42px rgba(0,0,0,.24),0 18px 40px rgba(0,0,0,.18)!important;overflow:hidden!important}',
      '.home-lucky-machine:before,.home-lucky-machine:after{content:"";position:absolute;left:12px;right:12px;height:34px;z-index:3;pointer-events:none}.home-lucky-machine:before{top:10px;background:linear-gradient(180deg,rgba(6,6,7,.98),transparent)}.home-lucky-machine:after{bottom:10px;background:linear-gradient(0deg,rgba(6,6,7,.98),transparent)}',
      '.home-lucky-machine-glow{position:absolute!important;left:18px!important;right:18px!important;top:50%!important;height:48px!important;transform:translateY(-50%)!important;border-radius:20px!important;background:linear-gradient(90deg,transparent,rgba(255,255,255,.055),transparent)!important;box-shadow:0 0 32px rgba(142,32,68,.16)!important;z-index:0!important;pointer-events:none!important}',
      '.home-lucky-reel{height:48px!important;border-radius:20px!important;overflow:hidden!important;position:relative!important;background:linear-gradient(180deg,rgba(255,255,255,.105),rgba(255,255,255,.038))!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.14),inset 0 -10px 22px rgba(0,0,0,.18),0 12px 24px rgba(0,0,0,.18)!important;z-index:1!important}',
      '.home-lucky-reel:before{content:"";position:absolute;inset:0;border-radius:inherit;border:1px solid rgba(255,255,255,.09);z-index:2;pointer-events:none}',
      '.home-lucky-reel:after{content:"";position:absolute;left:4px;right:4px;top:4px;height:13px;border-radius:999px;background:linear-gradient(180deg,rgba(255,255,255,.12),transparent);z-index:2;pointer-events:none}',
      '.home-lucky-strip{will-change:transform!important;transform:translate3d(0,0,0)}',
      '.home-lucky-letter{height:48px!important;display:grid!important;place-items:center!important;color:#fff!important;font-size:23px!important;font-weight:950!important;letter-spacing:-.04em!important;text-shadow:0 10px 22px rgba(0,0,0,.45)!important}',
      '.home-lucky-reel.is-spinning{box-shadow:inset 0 1px 0 rgba(255,255,255,.17),0 0 30px rgba(145,33,68,.24),0 16px 30px rgba(0,0,0,.24)!important}',
      '.home-lucky-code{height:40px!important;margin:13px 0!important;border-radius:19px!important;display:flex!important;align-items:center!important;justify-content:center!important;gap:8px!important;background:rgba(255,255,255,.044)!important;color:rgba(255,255,255,.7)!important;font-size:12px!important;font-weight:800!important;letter-spacing:.03em!important;position:relative!important;z-index:1!important}',
      '.home-lucky-code b{color:#fff!important;font-size:14px!important;letter-spacing:.16em!important}',
      '.home-lucky-spin{position:relative!important;z-index:1!important;width:100%!important;height:54px!important;border-radius:23px!important;border:0!important;background:linear-gradient(135deg,#fff,#ffdfe8)!important;color:#120609!important;font-size:16px!important;font-weight:950!important;letter-spacing:-.025em!important;box-shadow:0 18px 42px rgba(255,255,255,.11),0 14px 36px rgba(119,26,55,.22)!important}',
      '.home-lucky-spin:active{transform:scale(.988)!important}',
      '.home-lucky-spin[disabled]{opacity:.72!important;transform:none!important}',
      '.home-lucky-note{position:relative!important;z-index:1!important;margin:10px 0 0!important;text-align:center!important;color:rgba(255,255,255,.48)!important;font-size:11px!important;font-weight:720!important;line-height:1.35!important}'
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
    section.innerHTML='<div class="home-lucky-hero"><div class="home-lucky-kicker"><i></i>Free ticket</div><h2 class="home-lucky-title">Lucky Code</h2><p class="home-lucky-copy">Spin the code machine for test mode. Each reel uses English alphabet letters.</p><div class="home-lucky-ticket">#</div></div><div class="home-lucky-card"><div class="home-lucky-head"><strong>Code Machine</strong><span>TEST MODE</span></div><div class="home-lucky-machine" id="homeLuckyMachine"><div class="home-lucky-machine-glow"></div>'+Array(6).fill(0).map(function(){return '<div class="home-lucky-reel"><div class="home-lucky-strip">'+reelHtml()+'</div></div>'}).join('')+'</div><div class="home-lucky-code">Current code <b id="homeLuckyCode">------</b></div><button class="home-lucky-spin" id="homeLuckySpin" type="button">Spin</button><p class="home-lucky-note">For now this is only a front-end test. Later tickets can come from invites or daily tasks.</p></div>';
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