export const HOME_BLANK_CARDS_SCRIPT = `
(function(){
  document.querySelectorAll('#homeBlankCardsWrap').forEach(function(n){try{n.remove()}catch(e){}});
  document.querySelectorAll('#homeBlankCardsStyle').forEach(function(n){try{n.remove()}catch(e){}});
})();
`;