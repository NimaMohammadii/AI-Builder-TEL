export const PLINKO_PERFORMANCE_SCRIPT = `
(function(){
  if(document.getElementById('plinkoPerformanceGuardStyle'))return;
  var style=document.createElement('style');
  style.id='plinkoPerformanceGuardStyle';
  style.textContent='#plinkoCanvasV2,#plinko .plinko-stage{contain:layout paint style}';
  document.head.appendChild(style);
})();
`;
