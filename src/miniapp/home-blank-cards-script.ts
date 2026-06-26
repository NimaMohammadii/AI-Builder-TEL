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
      '#home .home-intro-card{display:grid!important;pointer-events:none!important;user-select:none!important;-webkit-user-select:none!important;margin:0 0 14px!important}',
      '#home .home-intro-card *{pointer-events:none!important}',
      '#homeLuckyCodeSection{display:block!important;order:-9999!important;padding:0 0 14px!important;margin:0!important}',
      '.home-lucky-card{position:relative!important;overflow:visible!important;border-radius:0!important;padding:0!important;background:none!important;background-color:transparent!important;background-image:none!important;box-shadow:none!important;border:0!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important}',
      '.home-lucky-card:before,.home-lucky-card:after{display:none!important;content:none!important}',
      '.home-lucky-head{display:flex!important;align-items:center!important;justify-content:space-between!important;gap:12px!important;margin:0 0 12px!important;position:relative!important;z-index:1!important}',
      '.home-lucky-titlebox{min-width:0!important;display:grid!important;gap:5px!important}',
      '.home-lucky-titlebox strong{font-size:19px!important;line-height:1!important;font-weight:950!important;letter-spacing:-.05em!important;color:#fff!important}',
      '.home-lucky-titlebox span{font-size:11px!important;line-height:1.25!important;font-weight:760!important;color:rgba(255,255,255,.5)!important}',
      '.home-lucky-head-badge{flex:0 0 auto;border-radius:999px!important;padding:7px 10px!important;background:rgba(255,255,255,.045)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.06)!important;color:rgba(255,255,255,.55)!important;font-size:10px!important;font-weight:900!important;letter-spacing:.06em!important}',
      '.home-lucky-machine{position:relative!important;z-index:1!important;display:grid!important;grid-template-columns:repeat(6,minmax(0,1fr))!important;gap:8px!important;padding:0!important;border-radius:0!important;background:none!important;background-color:transparent!important;background-image:none!important;box-shadow:none!important;border:0!important;overflow:visible!important}',
      '.home-lucky-machine:before,.home-lucky-machine:after{display:none!important;content:none!important}',
      '.home-lucky-window-line{display:none!important}',
      '.home-lucky-reel{height:48px!important;border-radius:18px!important;overflow:hidden!important;position:relative!important;background:rgba(255,255,255,.055)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.1),inset 0 -10px 20px rgba(0,0,0,.16),0 10px 22px rgba(0,0,0,.13)!important;border:0!important;z-index:1!important}',
      '.home-lucky-reel:before{content:""!important;display:block!important;position:absolute!important;left:0!important;right:0!important;top:0!important;height:18px!important;background:linear-gradient(180deg,rgba(0,0,0,.82),rgba(0,0,0,.34),transparent)!important;z-index:3!important;pointer-events:none!important}',
      '.home-lucky-reel:after{content:""!important;display:block!important;position:absolute!important;left:0!important;right:0!important;bottom:0!important;height:18px!important;background:linear-gradient(0deg,rgba(0,0,0,.82),rgba(0,0,0,.34),transparent)!important;z-index:3!important;pointer-events:none!important}',
      '.home-lucky-strip{will-change:transform!important;transform:translate3d(0,0,0)}',
      '.home-lucky-letter{height:48px!important;display:grid!important;place-items:center!important;color:#fff!important;font-size:23px!important;font-weight:950!important;letter-spacing:-.04em!important;text-shadow:0 9px 20px rgba(0,0,0,.48)!important}',
      '.home-lucky-reel.is-spinning{box-shadow:inset 0 1px 0 rgba(255,255,255,.13),0 14px 24px rgba(0,0,0,.2)!important}',
      '.home-lucky-code{height:40px!important;margin:13px 0!important;border-radius:18px!important;display:flex!important;align-items:center!important;justify-content:center!important;gap:8px!important;background:rgba(255,255,255,.035)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.045)!important;color:rgba(255,255,255,.62)!important;font-size:12px!important;font-weight:800!important;letter-spacing:.03em!important;position:relative!important;z-index:1!important}',
      '.home-lucky-code b{color:#fff!important;font-size:14px!important;letter-spacing:.16em!important}',
      '.home-lucky-spin{position:relative!important;z-index:1!important;width:100%!important;height:54px!important;border-radius:22px!important;border:0!important;background:#fff!important;color:#090909!important;font-size:16px!important;font-weight:950!important;letter-spacing:-.025em!important;box-shadow:0 18px 42px rgba(255,255,255,.09),0 14px 34px rgba(0,0,0,.18)!important}',
      '.home-lucky-spin:active{transform:scale(.988)!important}',
      '.home-lucky-spin[disabled]{opacity:.72!important;transform:none!important}',
      '.home-lucky-note{position:relative!important;z-index:1!important;margin:10px 0 0!important;text-align:center!important;color:rgba(255,255,255,.44)!important;font-size:11px!important;font-weight:720!important;line-height:1.35!important}',
      '.home-ticket-card{margin-top:14px!important;border-radius:28px!important;padding:13px!important;background:rgba(255,255,255,.045)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.08),0 16px 36px rgba(0,0,0,.18)!important;display:grid!important;grid-template-columns:minmax(0,1fr) auto!important;align-items:center!important;gap:12px!important;overflow:hidden!important}',
      '.home-ticket-copy{min-width:0!important;display:grid!important;gap:5px!important}',
      '.home-ticket-copy strong{color:#fff!important;font-size:16px!important;line-height:1!important;font-weight:950!important;letter-spacing:-.045em!important}',
      '.home-ticket-copy span{color:rgba(255,255,255,.5)!important;font-size:11px!important;line-height:1.25!important;font-weight:740!important}',
      '.home-ticket-action{display:grid!important;grid-template-columns:auto 42px!important;align-items:center!important;gap:9px!important}',
      '.home-ticket-count{height:42px!important;min-width:54px!important;padding:0 12px!important;border-radius:16px!important;background:rgba(0,0,0,.22)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.06)!important;color:#fff!important;font-size:15px!important;font-weight:950!important;display:flex!important;align-items:center!important;justify-content:center!important}',
      '.home-ticket-button{width:42px!important;height:42px!important;border-radius:16px!important;border:0!important;background:#fff!important;color:#080808!important;font-size:24px!important;line-height:1!important;font-weight:950!important;box-shadow:0 12px 26px rgba(255,255,255,.08),0 10px 24px rgba(0,0,0,.16)!important}',
      '.home-ticket-button:active{transform:scale(.96)!important}'
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

  function firstVisibleHomeNode(home){
    var kids=qa('#home > *');
    for(var i=0;i<kids.length;i++){
      var n=kids[i];
      if(!n||n.id==='homeLuckyCodeSection')continue;
      if(String(n.tagName).toLowerCase()==='style')continue;
      if(n.id==='depositSheet'||n.id==='withdrawSheet'||n.id==='transactionsSheet')continue;
      return n;
    }
    return null;
  }

  function pinToTop(section){
    var home=q('#home');
    if(!home||!section)return;
    var first=firstVisibleHomeNode(home);
    if(first&&section.nextSibling!==first)home.insertBefore(section,first);
    else if(!first&&home.firstChild!==section)home.insertBefore(section,home.firstChild);
  }

  function ticketCount(){
    try{return Math.max(0,Math.floor(Number(localStorage.getItem('vexaFreeTickets')||'0')))}catch(e){return 0}
  }

  function setTicketCount(v){
    var count=Math.max(0,Math.floor(Number(v)||0));
    try{localStorage.setItem('vexaFreeTickets',String(count))}catch(e){}
    var n=q('#homeTicketCount');
    if(n)n.textContent=String(count);
  }

  function ensureSection(){
    var home=q('#home');
    if(!home)return null;
    var section=q('#homeLuckyCodeSection',home);
    if(!section){
      section=document.createElement('section');
      section.id='homeLuckyCodeSection';
      section.innerHTML='<div class="home-lucky-card"><div class="home-lucky-head"><div class="home-lucky-titlebox"><strong>Lucky Code</strong><span>Free ticket code machine</span></div><div class="home-lucky-head-badge">TEST MODE</div></div><div class="home-lucky-machine" id="homeLuckyMachine"><div class="home-lucky-window-line"></div>'+Array(6).fill(0).map(function(){return '<div class="home-lucky-reel"><div class="home-lucky-strip">'+reelHtml()+'</div></div>'}).join('')+'</div><div class="home-lucky-code">Current code <b id="homeLuckyCode">------</b></div><button class="home-lucky-spin" id="homeLuckySpin" type="button">Spin</button><p class="home-lucky-note">Front-end test only. Later tickets can come from invites or daily tasks.</p><div class="home-ticket-card"><div class="home-ticket-copy"><strong>Free Ticket</strong><span>Claim a test ticket for your next Lucky Code reveal.</span></div><div class="home-ticket-action"><div class="home-ticket-count" id="homeTicketCount">0</div><button class="home-ticket-button" id="homeTicketButton" type="button" aria-label="Get free ticket">+</button></div></div></div>';
    }
    pinToTop(section);
    setTimeout(function(){pinToTop(section)},0);
    setTimeout(function(){pinToTop(section)},250);
    setTicketCount(ticketCount());
    return section;
  }

  function bindSpin(section){
    var btn=q('#homeLuckySpin',section);
    var code=q('#homeLuckyCode',section);
    var reels=qa('.home-lucky-reel',section);
    if(!btn||!code||!reels.length||btn.dataset.luckyBound==='1')return;
    btn.dataset.luckyBound='1';
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

  function bindTicket(section){
    var btn=q('#homeTicketButton',section);
    if(!btn||btn.dataset.ticketBound==='1')return;
    btn.dataset.ticketBound='1';
    btn.addEventListener('click',function(){
      setTicketCount(ticketCount()+1);
      btn.textContent='✓';
      setTimeout(function(){btn.textContent='+'},650);
    });
  }

  function init(){
    ensureStyle();
    var section=ensureSection();
    if(section){bindSpin(section);bindTicket(section)}
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
`;