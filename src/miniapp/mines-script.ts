export const MINES_SCRIPT = `
(function(){
  var size=25;
  var friendMode=false;
  function inviteUrl(roomId){var url=new URL(location.href);url.searchParams.set('minesRoom',roomId);url.searchParams.set('startapp','minesroom_'+String(roomId||'').replace(/[^0-9A-Za-z_-]/g,'').slice(0,80));url.searchParams.delete('open');return url.toString()}
})();
`;