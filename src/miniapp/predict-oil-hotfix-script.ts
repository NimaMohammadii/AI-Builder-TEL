export const PREDICT_OIL_HOTFIX_SCRIPT = `
(function(){
  var timer=0;
  var startValue=0;
  function isOil(root){return !!(root&&root.querySelector('[data-vexa-predict-market="oil"].active'))}
  function close(){if(timer){clearTimeout(timer);timer=0}}
  function money(value){return '$'+Number(value).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}
  function y(value,min,max){return Math.max(24,Math.min(196,24+((max-value)/(max-min))*172))}
  function setChart(root,p){
    var chart=root.querySelector('[data-predict-chart]');
    if(!chart)return;
    var line=chart.querySelector('.predict-zone-chart-line');
    var fill=chart.querySelector('.predict-zone-chart-fill');
    var dot=chart.querySelector('.predict-zone-chart-dot');
    var guide=chart.querySelector('.predict-zone-price-guide');
    var startGuide=chart.querySelector('[data-predict-start-guide]');
    var axis=chart.querySelectorAll('[data-price-axis]');
    var grid=chart.querySelectorAll('[data-chart-grid-line]');
    var center=Math.round(Number(p)*20)/20;
    var min=center-.35,max=center+.35;
    var pts=[];
    for(var i=0;i<18;i++){var x=14+i*(268/17),v=Number(p)+(Math.sin(i*.8)*.08)-((17-i)*.006);pts.push({x:x,y:y(v,min,max)})}
    var d='M'+pts[0].x.toFixed(1)+' '+pts[0].y.toFixed(1);
    for(var j=0;j<pts.length-1;j++){var a=pts[j],b=pts[j+1],mx=(a.x+b.x)/2;d+=' C '+mx.toFixed(1)+' '+a.y.toFixed(1)+' '+mx.toFixed(1)+' '+b.y.toFixed(1)+' '+b.x.toFixed(1)+' '+b.y.toFixed(1)}
    if(line)line.setAttribute('d',d);
    if(fill)fill.setAttribute('d',d+' L 282 220 L 14 220 Z');
    var last=pts[pts.length-1],xp=last.x/360*100,yp=last.y/220*100;
    if(dot){dot.style.visibility='';dot.style.left=xp+'%';dot.style.top=yp+'%'}
    if(guide){guide.style.visibility='';guide.style.top=yp+'%'}
    axis.forEach(function(el,i){var r=axis.length>1?i/(axis.length-1):0,v=max-r*(max-min),top=y(v,min,max)/220*100+'%';el.style.visibility='';el.style.top=top;el.textContent=money(v);if(grid[i])grid[i].style.top=top});
    if(startGuide&&startValue){startGuide.style.top=(y(startValue,min,max)/220*100)+'%';startGuide.classList.add('show')}
    chart.classList.add('ready');
  }
  function setPrice(root,p){
    var live=root.querySelector('.predict-zone-live-price');
    var start=root.querySelector('.predict-zone-start-price');
    var txt=money(p);
    if(!startValue)startValue=Number(p);
    if(live)live.textContent=txt;
    if(start)start.textContent=money(startValue);
    setChart(root,p);
  }
  function tick(root){
    close();
    if(!isOil(root))return;
    fetch('/app/api/predict-oil-price',{cache:'no-store'}).then(function(r){return r.json()}).then(function(data){var p=Number(data&&data.price);if(p&&isOil(root))setPrice(root,p)}).catch(function(){}).finally(function(){if(isOil(root))timer=setTimeout(function(){tick(root)},5000)});
  }
  function run(){
    var root=document.getElementById('predictzone');
    if(!root)return;
    if(isOil(root))tick(root);else{startValue=0;close()}
  }
  document.addEventListener('click',function(){setTimeout(run,40);setTimeout(run,180)},true);
  document.addEventListener('visibilitychange',function(){if(document.visibilityState==='visible')setTimeout(run,80);else close()});
  setInterval(run,1500);
})();
`;