export const PLINKO_FEED_TOTAL_FIX_SCRIPT = `
(function(){
  function fmt(value){
    var n=Math.max(0,Number(value)||0);
    return n.toFixed(4).replace(/\.0+$/,'').replace(/(\.\d*?)0+$/,'$1');
  }
  function num(value){
    var match=String(value||'').replace(',', '.').match(/-?\d+(?:\.\d+)?/);
    return match?Number(match[0]):0;
  }
  function ensureStyle(){
    if(document.getElementById('plinkoFeedTotalFixStyle'))return;
    var style=document.createElement('style');
    style.id='plinkoFeedTotalFixStyle';
    style.textContent='#plinko .plinko-live-row,#plinko .plinko-history-row{grid-template-columns:24px minmax(0,1fr) auto auto auto!important}.plinko-live-total,.plinko-history-total{display:block!important;font-size:11px!important;font-weight:950!important;color:#0d7a3a!important;white-space:nowrap!important;text-shadow:0 0 10px rgba(13,122,58,.22)!important;min-width:max-content!important}';
    document.head.appendChild(style);
  }
  function fixRow(row){
    if(!row)return;
    var amountEl=row.querySelector('.plinko-live-meta,.plinko-history-meta');
    var multEl=row.querySelector('.plinko-live-mult,.plinko-history-mult');
    var amount=num(amountEl&&amountEl.textContent)||1;
    var mult=num(multEl&&multEl.textContent);
    if(!mult)return;
    if(amountEl&&/^Amount\s+/i.test(amountEl.textContent||''))amountEl.textContent='TON '+fmt(amount);
    if(multEl)multEl.textContent='×'+fmt(mult);
    var total=row.querySelector('.plinko-live-total,.plinko-history-total');
    if(!total){
      total=document.createElement('div');
      total.className=row.classList.contains('plinko-history-row')?'plinko-history-total':'plinko-live-total';
      row.appendChild(total);
    }
    total.textContent=fmt(amount*mult);
  }
  function scan(){
    ensureStyle();
    document.querySelectorAll('#plinkoLiveFeed .plinko-live-row,#plinkoLiveHistoryFeed .plinko-history-row').forEach(fixRow);
  }
  scan();
  if(window.MutationObserver){
    new MutationObserver(function(records){
      records.forEach(function(record){
        Array.prototype.forEach.call(record.addedNodes||[],function(node){
          if(node&&node.classList&&(node.classList.contains('plinko-live-row')||node.classList.contains('plinko-history-row')))fixRow(node);
          if(node&&node.querySelectorAll)node.querySelectorAll('.plinko-live-row,.plinko-history-row').forEach(fixRow);
        });
      });
    }).observe(document.body,{childList:true,subtree:true});
  }
  document.addEventListener('click',function(){setTimeout(scan,80)},true);
  document.addEventListener('visibilitychange',function(){if(!document.hidden)setTimeout(scan,80)});
})();
`;
