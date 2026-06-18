export const PREDICT_ZONE_LIVE_BETS_SCRIPT = `
(function(){
  var values = [
    '+12','+18','+23','+27','+31','+34','+38','+41','+44','+47',
    '+49','+52','+55','+58','+62','+67','+71','+73','+76','+84',
    '+89','+92','+110','+125','+140','+160','+180','+200','+225','+250',
    '+275','+300','+340','+380','+420','+460','+500','+560','+620','+700',
    '+820','+960','+1,100','+1,280','+1,450','+1,700','+2,050','+2,600','+3,200','+4,900'
  ];
  var sides = ['up','down'];
  var timer = 0;
  function active(){var root=document.getElementById('predictzone');return !!(root&&root.classList.contains('active')&&document.visibilityState!=='hidden')}
  function box(){var root=document.getElementById('predictzone');return root&&root.querySelector('[data-predict-live-bets]')}
  function spawn(){
    var wrap=box();
    if(!wrap||!active())return;
    var item=document.createElement('span');
    var side=sides[Math.floor(Math.random()*sides.length)];
    item.className='predict-zone-live-bet '+side+' predict-zone-live-bet-override';
    item.textContent=values[Math.floor(Math.random()*values.length)];
    item.style.left='0px';
    wrap.appendChild(item);
    window.setTimeout(function(){try{item.remove()}catch(e){}},1500);
  }
  function start(){if(timer||!active())return;spawn();timer=window.setTimeout(function loop(){timer=0;if(!active())return;spawn();timer=window.setTimeout(loop,850)},850)}
  function stop(){if(timer){clearTimeout(timer);timer=0}}
  function sync(){if(active())start();else stop()}
  document.addEventListener('visibilitychange',sync);
  document.addEventListener('click',function(){setTimeout(sync,80)},true);
  if(window.MutationObserver){var root=document.getElementById('predictzone');if(root)new MutationObserver(sync).observe(root,{attributes:true,attributeFilter:['class']});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',sync);else sync();
})();
`;
