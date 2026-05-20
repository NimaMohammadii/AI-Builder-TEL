export const PREDICT_SHORT_QUESTION_SCRIPT = `
(function(){
  var labels={bitcoin:'Bitcoin up or down?',ethereum:'Ethereum up or down?',solana:'Solana up or down?',gold:'Gold up or down?',ton:'TON up or down?'};
  function apply(){
    var root=document.getElementById('predictzone');
    if(!root)return;
    var active=root.querySelector('.predict-zone-category-card.active[data-vexa-predict-market]');
    var market=active&&active.getAttribute('data-vexa-predict-market');
    var text=labels[market||''];
    if(!text)return;
    var question=root.querySelector('[data-predict-question]');
    var betQuestion=root.querySelector('[data-predict-bet-question]');
    if(question)question.textContent=text;
    if(betQuestion)betQuestion.textContent=text;
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(apply,120);});else setTimeout(apply,120);
  document.addEventListener('click',function(){setTimeout(apply,40);setTimeout(apply,180);},true);
  document.addEventListener('visibilitychange',function(){if(document.visibilityState==='visible')setTimeout(apply,80)});
})();
`;
