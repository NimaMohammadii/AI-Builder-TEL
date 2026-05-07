export const MINIAPP_STYLES = `
:root{color-scheme:dark;--text:#fff;--muted:rgba(255,255,255,.58);--line:rgba(255,255,255,.14);--card:rgba(255,255,255,.055);font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
html,body{margin:0;height:100%;background:#000!important;color:#fff;overflow:hidden}
body{height:100dvh}
button,input,select,textarea{font:inherit}
button{border:0}
.app{position:relative;width:min(100%,560px);height:100dvh;margin:auto;padding:calc(16px + env(safe-area-inset-top)) 16px calc(76px + env(safe-area-inset-bottom));background:#000!important;overflow:hidden}
.top{height:68px;display:flex;align-items:center;margin-bottom:14px}
.brand{display:flex;gap:12px;align-items:center}
.logo,.avatar{width:58px;height:58px;border-radius:24px;object-fit:cover;background:transparent!important;border:0!important;box-shadow:none!important;outline:0!important}
.brand h1{font-size:21px;line-height:1;margin:0;font-weight:900;letter-spacing:-.05em}
.brand p{font-size:11px;margin:4px 0 0;color:var(--muted)}
.content{height:calc(100dvh - 68px - 92px - env(safe-area-inset-top) - env(safe-area-inset-bottom));overflow:hidden}
.view{display:none;height:100%;overflow:auto;padding-bottom:8px;position:relative}.view.active{display:block}
.hero h2{font-size:clamp(46px,13vw,72px);line-height:.88;letter-spacing:-.09em;margin:12px 0 10px}.hero p{color:var(--muted);line-height:1.45;margin:0 0 16px}
.card{border:1px solid var(--line);border-radius:30px;background:linear-gradient(180deg,rgba(255,255,255,.105),rgba(255,255,255,.03));box-shadow:0 28px 80px rgba(0,0,0,.75),inset 0 1px 0 rgba(255,255,255,.10);margin-bottom:13px;backdrop-filter:blur(22px)}
.pad{padding:16px}.title{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:13px}.title h3{margin:0;font-size:16px}.title span,.tiny,label{font-size:12px;color:var(--muted)}label{font-size:10.5px;letter-spacing:.095em;text-transform:uppercase}
.field{display:grid;gap:8px;margin:12px 0}input,select,textarea{width:100%;border:1px solid var(--line);border-radius:20px;background:#030303;color:#fff;outline:0;padding:0 14px}input,select{height:52px}textarea{min-height:178px;resize:none;padding:14px;line-height:1.45}
.actions,.stats,.toolbar{display:grid;grid-template-columns:1fr 1fr;gap:10px}.stats{grid-template-columns:repeat(3,1fr)}.toolbar{grid-template-columns:repeat(3,1fr);margin-top:12px}
.primary,.secondary,.ghost,.danger{height:50px;border-radius:20px;display:flex;align-items:center;justify-content:center;font-weight:850}.primary{background:#fff;color:#050505;box-shadow:0 0 24px rgba(255,255,255,.2)}.secondary,.ghost,.danger{border:1px solid var(--line);background:rgba(255,255,255,.075);color:#fff}.ghost,.danger{height:42px;font-size:12px}
.stat,.notice{border:1px solid rgba(255,255,255,.12);border-radius:24px;background:var(--card);padding:13px;color:var(--muted)}.stat b{display:block;color:#fff;font-size:24px}.stat span{font-size:11px}.list{display:grid;gap:9px;max-height:300px;overflow:auto}
.bot-row{width:100%;display:grid;grid-template-columns:48px minmax(0,1fr) auto;gap:12px;align-items:center;border:1px solid rgba(255,255,255,.12);border-radius:25px;background:rgba(255,255,255,.06);color:#fff;padding:10px;text-align:left}.bot-row strong,.bot-row small{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.bot-row small,.pill{color:var(--muted)}.pill{border:1px solid var(--line);border-radius:999px;padding:6px 9px;font-size:11px}.avatar{width:48px;height:48px;border-radius:50%}.avatar-fallback{width:48px;height:48px;border-radius:50%;display:grid;place-items:center;color:#fff;font-weight:950;font-size:17px;background:rgba(255,255,255,.08)}
.tabs{position:absolute;left:16px;right:16px;bottom:calc(12px + env(safe-area-inset-bottom));height:58px;border:1px solid var(--line);border-radius:25px;background:rgba(5,5,5,.9);display:grid;grid-template-columns:repeat(4,1fr);gap:4px;padding:6px;backdrop-filter:blur(22px);z-index:80}.tab{border-radius:20px;background:transparent;color:var(--muted);display:grid;place-items:center;font-weight:800;font-size:14px}.tab.active{background:#fff;color:#050505}
.toast{position:fixed;left:16px;right:16px;bottom:calc(80px + env(safe-area-inset-bottom));max-width:528px;margin:0 auto;padding:12px 14px;border:1px solid var(--line);border-radius:17px;background:rgba(18,18,18,.96);display:none;z-index:90}
.tts-page{height:100%;display:flex;flex-direction:column;overflow:hidden}.tts-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:2px 0 18px}.credit-pill{height:36px;border-radius:999px;border:1px solid rgba(255,255,255,.13);background:rgba(255,255,255,.055);display:flex;align-items:center;gap:8px;padding:0 11px;font-size:13px;font-weight:850}.credit-pill img{width:24px;height:24px;object-fit:contain;border:0;background:transparent;box-shadow:none}
.voice-wrap{position:relative;flex:0 0 auto}.voice-btn{height:36px;min-width:104px;border-radius:999px;border:1px solid var(--line);background:rgba(255,255,255,.055);color:#fff;display:flex;align-items:center;justify-content:center;gap:8px;padding:0 13px;font-size:14px;font-weight:850}.voice-btn svg{transition:transform .22s ease}.voice-wrap.open .voice-btn svg{transform:rotate(180deg)}.voice-menu{position:absolute;right:0;top:44px;z-index:5;width:150px;max-height:242px;overflow:auto;padding:6px;border:1px solid rgba(255,255,255,.13);border-radius:18px;background:rgba(8,8,8,.96);box-shadow:0 24px 70px rgba(0,0,0,.72);opacity:0;transform:translateY(-8px) scale(.96);pointer-events:none;transition:opacity .18s ease,transform .18s ease}.voice-wrap.open .voice-menu{opacity:1;transform:translateY(0) scale(1);pointer-events:auto}.voice-menu button{width:100%;height:32px;border-radius:13px;background:transparent;color:rgba(255,255,255,.64);text-align:left;padding:0 10px;font-size:12.5px;font-weight:750}.voice-menu button.active{background:#fff;color:#050505}
.tts-area{flex:1;display:flex;flex-direction:column;min-height:0}.tts-label{font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);margin:8px 0 10px}.tts-area textarea{flex:1;min-height:0;border:0!important;background:transparent!important;border-radius:0!important;padding:0!important;font-size:28px;line-height:1.35;color:#fff;box-shadow:none!important}.tts-area textarea::placeholder{color:rgba(255,255,255,.28)}.tts-bottom{display:grid;gap:8px;margin-top:10px;padding-bottom:0}.tts-generate{width:100%;height:44px;border-radius:999px;background:#fff;color:#050505;font-weight:900;font-size:14px;box-shadow:0 0 28px rgba(255,255,255,.18)}.wave-player{display:none;border:1px solid rgba(255,255,255,.12);border-radius:22px;background:rgba(255,255,255,.045);padding:8px 10px;align-items:center;gap:10px;animation:waveIn .32s cubic-bezier(.2,.8,.2,1)}.wave-player.show{display:flex}.wave-play{width:34px;height:34px;border-radius:50%;background:#fff;color:#050505;display:grid;place-items:center;flex:0 0 auto}.wave-svg{height:28px;flex:1}.wave-svg rect{fill:#fff;opacity:.28}.wave-time{font-size:12px;color:var(--muted)}.tts-hidden-audio{display:none}@keyframes waveIn{from{opacity:0;transform:translateY(10px) scale(.98)}to{opacity:1;transform:translateY(0) scale(1)}}
/* TTS-only compact controls. Do not change the main bottom navigation. */
#flow .tts-head{gap:9px;margin:0 0 14px}
#flow .credit-pill{height:30px;gap:7px;padding:0 10px;font-size:12px;border-radius:999px}
#flow .credit-pill img{width:20px;height:20px}
#flow .voice-btn{height:30px;min-width:90px;padding:0 10px;font-size:12.5px;gap:6px}
#flow .voice-btn svg{width:14px;height:14px}
#flow .voice-menu{top:36px;width:132px;max-height:198px;padding:5px;border-radius:16px}
#flow .voice-menu button{height:28px;border-radius:12px;font-size:12px;padding:0 9px}
#flow .tts-bottom{gap:7px;margin-top:8px}
#flow .tts-generate{height:38px;font-size:13px;box-shadow:0 0 18px rgba(255,255,255,.14)}
#flow .wave-player{min-height:42px;padding:6px 9px;border-radius:20px;gap:9px}
#flow .wave-play{width:30px;height:30px;font-size:12px}
#flow .wave-svg{height:24px}
#flow .wave-svg rect{opacity:.34}
#flow .wave-time{font-size:11px}
#flow .tts-page:focus-within .tts-bottom{display:none!important}
.view.is-section-locked>*:not(.section-locked-view){display:none!important}
.section-locked-view{position:absolute;inset:0;display:grid;place-items:center;z-index:10;background:#000;color:#fff;padding:24px 24px calc(24px + env(safe-area-inset-bottom));text-align:center;pointer-events:auto}
.section-locked-card{display:grid;justify-items:center;gap:10px;max-width:260px;margin:auto}.section-locked-card svg{width:54px;height:54px;color:#fff;opacity:.9}.section-lock-image{width:min(148px,48vw);height:min(148px,48vw);object-fit:contain;display:block;border:0;background:transparent;box-shadow:none}.section-locked-card h2{margin:4px 0 0;font-size:19px;letter-spacing:-.04em;line-height:1.1}.section-locked-card p{margin:0;color:rgba(255,255,255,.52);font-size:12px}.code-card{gap:9px}.section-code-input{width:100%;height:38px;border-radius:999px;border:1px solid rgba(255,255,255,.16);background:#050505;color:#fff;text-align:center;font-size:13px;margin-top:5px}.section-code-submit{width:100%;height:38px;border-radius:999px;background:#fff;color:#050505;font-weight:900;font-size:13px}.section-code-status{min-height:15px;color:rgba(255,255,255,.58);font-size:11px}
`;
