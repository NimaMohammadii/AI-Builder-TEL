export const PREDICT_ENTRY_LOADER_SCRIPT = `
(function(){
  var old=document.getElementById('predictEntryLoader');
  if(old)old.remove();
  var style=document.getElementById('predict-entry-loader-style');
  if(style)style.remove();
})();
`;