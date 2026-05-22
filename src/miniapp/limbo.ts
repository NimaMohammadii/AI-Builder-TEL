export const LIMBO_SECTION = `<section id="limbo" class="view limbo-view">
<style>
.limbo-view{padding:10px 12px calc(112px + env(safe-area-inset-bottom))!important;overflow:hidden!important;background:linear-gradient(180deg,#050b08,#010201)!important}.limbo-game3d{height:calc(100dvh - 156px - env(safe-area-inset-top) - env(safe-area-inset-bottom));min-height:520px;display:grid;grid-template-rows:minmax(0,1fr) auto;gap:10px}.limbo-stage3d{position:relative;overflow:hidden;border-radius:28px;border:1px solid rgba(255,255,255,.12);background:#020403;box-shadow:0 28px 70px rgba(0,0,0,.48),inset 0 1px 0 rgba(255,255,255,.1)}.limbo-stage3d canvas{width:100%!important;height:100%!important;display:block!important}.limbo-hud3d{position:absolute;left:12px;right:12px;top:12px;display:flex;justify-content:space-between;gap:8px;z-index:5;pointer-events:none}.limbo-pill3d{height:34px;padding:0 12px;border-radius:999px;background:rgba(0,0,0,.42);border:1px solid rgba(255,255,255,.13);display:flex;align-items:center;color:#fff;font-size:12px;font-weight:900;-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px)}.limbo-aim3d{position:absolute;left:50%;top:50%;width:10px;height:10px;margin:-5px 0 0 -5px;border-radius:50%;border:1px solid rgba(255,255,255,.38);z-index:4;pointer-events:none;box-shadow:0 0 18px rgba(170,255,200,.18)}.limbo-msg3d{position:absolute;left:12px;right:12px;bottom:12px;z-index:5;padding:12px 14px;border-radius:20px;background:rgba(0,0,0,.45);border:1px solid rgba(255,255,255,.13);color:#fff;font-size:13px;font-weight:800;line-height:1.25;-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px)}.limbo-controls3d{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.limbo-controls3d button{height:54px;border-radius:18px;border:1px solid rgba(255,255,255,.14);background:linear-gradient(180deg,rgba(255,255,255,.16),rgba(255,255,255,.055));color:#fff;font-size:22px;font-weight:950;box-shadow:0 14px 30px rgba(0,0,0,.28),inset 0 1px 0 rgba(255,255,255,.22)}.limbo-controls3d button:active{transform:scale(.96)}.limbo-controls3d [data-limbo-action=forward]{grid-column:2}.limbo-controls3d [data-limbo-action=left]{grid-column:1;grid-row:2}.limbo-controls3d [data-limbo-action=back]{grid-column:2;grid-row:2}.limbo-controls3d [data-limbo-action=right]{grid-column:3;grid-row:2}.limbo-controls3d [data-limbo-action=reset]{grid-column:1/4;height:44px;font-size:14px;color:rgba(255,255,255,.76)}
</style>
<div class="limbo-game3d"><div class="limbo-stage3d" data-limbo-stage><div class="limbo-hud3d"><span class="limbo-pill3d" data-limbo-inventory>No lantern</span><span class="limbo-pill3d" data-limbo-state>Forest</span></div><span class="limbo-aim3d"></span><div class="limbo-msg3d" data-limbo-message>Loading forest...</div></div><div class="limbo-controls3d"><button type="button" data-limbo-action="forward">↑</button><button type="button" data-limbo-action="left">←</button><button type="button" data-limbo-action="back">↓</button><button type="button" data-limbo-action="right">→</button><button type="button" data-limbo-action="reset">Reset</button></div></div>
<script type="module">
import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
(function(){
var section=document.getElementById('limbo');
if(!section||section.dataset.limboThree==='1')return;
section.dataset.limboThree='1';
var stage=section.querySelector('[data-limbo-stage]');
var msg=section.querySelector('[data-limbo-message]');
var inv=section.querySelector('[data-limbo-inventory]');
var stateEl=section.querySelector('[data-limbo-state]');
var renderer,scene,camera,player,lanternMesh,gateMesh,lanternLight,compassArrow;
var trees=[],rocks=[],pressed={},hasLantern=false,won=false,yaw=0,targetYaw=0,last=performance.now(),walkTime=0,blockedCooldown=0;
var seed=1337;
function rnd(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296}
function say(t){if(msg)msg.textContent=t}
function sync(){if(inv)inv.textContent=hasLantern?'Lantern on':'No lantern';if(stateEl)stateEl.textContent=won?'Escaped':'Forest'}
function mat(color,rough,emissive,ei){return new THREE.MeshStandardMaterial({color:color,roughness:rough||1,emissive:emissive||0x000000,emissiveIntensity:ei||0})}
function init(){
  if(!stage)return;
  scene=new THREE.Scene();
  scene.background=new THREE.Color(0x06100b);
  scene.fog=new THREE.FogExp2(0x06100b,0.043);
  camera=new THREE.PerspectiveCamera(74,1,0.08,95);
  renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(2,window.devicePixelRatio||1));
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.shadowMap.enabled=true;
  renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  stage.appendChild(renderer.domElement);
  var hemi=new THREE.HemisphereLight(0xb8ffd0,0x071007,0.62);scene.add(hemi);
  var moon=new THREE.DirectionalLight(0xdcffe8,1.05);moon.position.set(-6,11,5);moon.castShadow=true;moon.shadow.mapSize.set(1024,1024);scene.add(moon);
  lanternLight=new THREE.PointLight(0xffd27a,0,8,1.7);scene.add(lanternLight);
  var ground=new THREE.Mesh(new THREE.PlaneGeometry(82,82,28,28),mat(0x0d2315,1));ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;scene.add(ground);
  var pathMat=mat(0x5b4424,1);
  for(var p=0;p<18;p++){var seg=new THREE.Mesh(new THREE.PlaneGeometry(7.8+rnd()*1.2,4.4),pathMat);seg.rotation.x=-Math.PI/2;seg.position.set(Math.sin(p*.55)*1.5,.018,5-p*2.05);seg.rotation.z=Math.sin(p*.6)*.09;seg.receiveShadow=true;scene.add(seg)}
  makeForest();makeDetails();makeLantern();makeGate();makePlayer();
  bind();resize();say('You are inside a real forest. Move forward, find the lantern, then reach the glowing gate.');sync();requestAnimationFrame(loop);
}
function makePlayer(){
  player=new THREE.Object3D();player.position.set(0,1.55,4);scene.add(player);player.add(camera);camera.position.set(0,0,0);
  var handMat=mat(0x2b1d19,.75);
  var leftHand=new THREE.Mesh(new THREE.BoxGeometry(.18,.18,.58),handMat);leftHand.position.set(-.38,-.43,-.86);leftHand.rotation.z=.25;leftHand.castShadow=true;camera.add(leftHand);
  var rightHand=leftHand.clone();rightHand.position.x=.38;rightHand.rotation.z=-.25;camera.add(rightHand);
  compassArrow=new THREE.Mesh(new THREE.ConeGeometry(.055,.22,16),mat(0xffd27a,.5,0xffb13d,.8));compassArrow.position.set(0,-.28,-.72);compassArrow.rotation.x=-Math.PI/2;camera.add(compassArrow);
}
function makeTree(x,z,s,type){
  var trunkMat=mat(type?0x4b2d18:0x3b2415,1);
  var leafMat=mat(type?0x0f5e31:0x0a4325,1);
  var trunk=new THREE.Mesh(new THREE.CylinderGeometry(.11*s,.2*s,1.6*s,8),trunkMat);trunk.position.set(x,.8*s,z);trunk.castShadow=true;scene.add(trunk);
  var crown1=new THREE.Mesh(new THREE.ConeGeometry(.75*s,2.1*s,10),leafMat);crown1.position.set(x,2.2*s,z);crown1.castShadow=true;scene.add(crown1);
  var crown2=new THREE.Mesh(new THREE.ConeGeometry(.58*s,1.7*s,10),leafMat);crown2.position.set(x,3.05*s,z);crown2.castShadow=true;scene.add(crown2);
  trees.push({x:x,z:z,r:.62*s});
}
function makeForest(){
  for(var i=0;i<150;i++){var side=i%2===0?-1:1;var x=side*(5+rnd()*28);var z=9-rnd()*54;makeTree(x,z,.65+rnd()*1.05,i%5===0)}
  for(var j=0;j<40;j++){makeTree(-3.8-rnd()*1.8,7-j*1.05,.48+rnd()*.5,j%4===0);makeTree(3.8+rnd()*1.8,7-j*1.05,.48+rnd()*.5,j%3===0)}
}
function makeDetails(){
  var rockMat=mat(0x263028,1);var grassMat=mat(0x1b6a38,1);
  for(var i=0;i<34;i++){var side=rnd()>.5?-1:1;var x=side*(2.5+rnd()*3.3);var z=6-rnd()*38;var rock=new THREE.Mesh(new THREE.DodecahedronGeometry(.18+rnd()*.22,0),rockMat);rock.position.set(x,.14,z);rock.rotation.set(rnd()*2,rnd()*3,rnd()*2);rock.castShadow=true;scene.add(rock);rocks.push({x:x,z:z,r:.32})}
  for(var g=0;g<90;g++){var gx=(rnd()-.5)*11,gz=7-rnd()*42;var blade=new THREE.Mesh(new THREE.ConeGeometry(.035,.42,5),grassMat);blade.position.set(gx,.21,gz);blade.rotation.z=(rnd()-.5)*.45;scene.add(blade)}
  for(var f=0;f<16;f++){var bug=new THREE.Mesh(new THREE.SphereGeometry(.035,8,8),mat(0xb8ff9a,.4,0xaaff6a,1.2));bug.position.set((rnd()-.5)*7,1.2+rnd()*2,4-rnd()*28);bug.userData.base=bug.position.clone();bug.userData.phase=rnd()*6;scene.add(bug)}
}
function makeLantern(){
  lanternMesh=new THREE.Group();
  var body=new THREE.Mesh(new THREE.CylinderGeometry(.18,.2,.52,16),mat(0xffd77b,.5,0xffb13d,1.35));body.castShadow=true;
  var ring=new THREE.Mesh(new THREE.TorusGeometry(.18,.025,8,18),mat(0xffd77b,.45,0xffb13d,.75));ring.position.y=.34;ring.rotation.x=Math.PI/2;
  var glow=new THREE.PointLight(0xffbd67,1.2,4,1.4);glow.position.y=.16;
  lanternMesh.add(body,ring,glow);lanternMesh.position.set(-2,.42,-14);scene.add(lanternMesh);
}
function makeGate(){
  gateMesh=new THREE.Group();
  var gateMat=mat(0x85ffc1,.35,0x2cff9b,1.1);
  var a=new THREE.Mesh(new THREE.BoxGeometry(.38,3.4,.38),gateMat);a.position.set(-1.25,1.7,-27);a.castShadow=true;
  var b=a.clone();b.position.x=1.25;
  var top=new THREE.Mesh(new THREE.BoxGeometry(3,.38,.38),gateMat);top.position.set(0,3.25,-27);top.castShadow=true;
  var gateLight=new THREE.PointLight(0x4cffb2,1.4,8,1.2);gateLight.position.set(0,1.7,-26.4);
  gateMesh.add(a,b,top,gateLight);scene.add(gateMesh);
}
function bind(){
  section.querySelectorAll('[data-limbo-action]').forEach(function(b){
    var a=b.getAttribute('data-limbo-action');
    if(a==='reset'){b.addEventListener('click',function(e){e.preventDefault();reset()});return}
    b.addEventListener('touchstart',function(e){e.preventDefault();pressed[a]=true},{passive:false});
    b.addEventListener('touchend',function(e){e.preventDefault();pressed[a]=false},{passive:false});
    b.addEventListener('mousedown',function(){pressed[a]=true});
    b.addEventListener('mouseup',function(){pressed[a]=false});
    b.addEventListener('mouseleave',function(){pressed[a]=false});
    b.addEventListener('click',function(e){e.preventDefault();tap(a)});
  });
}
function tap(a){pressed[a]=true;setTimeout(function(){pressed[a]=false},120)}
function reset(){hasLantern=false;won=false;yaw=0;targetYaw=0;player.position.set(0,1.55,4);player.rotation.y=0;lanternMesh.visible=true;lanternLight.intensity=0;scene.fog.density=.043;say('You are inside a real forest. Move forward, find the lantern, then reach the glowing gate.');sync()}
function collides(nx,nz){if(Math.abs(nx)>32||nz>8||nz<-33)return true;var i,t,dx,dz;for(i=0;i<trees.length;i++){t=trees[i];dx=nx-t.x;dz=nz-t.z;if(dx*dx+dz*dz<(t.r+.36)*(t.r+.36))return true}for(i=0;i<rocks.length;i++){t=rocks[i];dx=nx-t.x;dz=nz-t.z;if(dx*dx+dz*dz<(t.r+.22)*(t.r+.22))return true}return false}
function move(dx,dz){var nx=player.position.x+dx,nz=player.position.z+dz;if(!collides(nx,nz)){player.position.x=nx;player.position.z=nz}else if(blockedCooldown<=0){say('A tree blocks your way.');blockedCooldown=.8}}
function update(dt,now){
  if(blockedCooldown>0)blockedCooldown-=dt;
  if(won)return;
  if(pressed.left)targetYaw+=dt*2.45;if(pressed.right)targetYaw-=dt*2.45;yaw+=(targetYaw-yaw)*Math.min(1,dt*12);player.rotation.y=yaw;
  var walking=pressed.forward||pressed.back;var speed=walking?4.0:0;var dir=pressed.back?1:-1;
  if(speed){move(Math.sin(yaw)*speed*dt*dir,Math.cos(yaw)*speed*dt*dir);walkTime+=dt*9;camera.position.y=Math.sin(walkTime)*.045}else{camera.position.y*=.86}
  if(lanternMesh.visible){lanternMesh.rotation.y+=dt*1.7;lanternMesh.position.y=.42+Math.sin(now*.002)*.06;if(player.position.distanceTo(lanternMesh.position)<1.35){hasLantern=true;lanternMesh.visible=false;lanternLight.intensity=2.1;scene.fog.density=.027;say('Lantern found. The forest opens. Find the glowing gate.');sync()}}
  if(hasLantern){lanternLight.position.copy(player.position);lanternLight.position.y=1.25}
  if(compassArrow){var target=hasLantern?new THREE.Vector3(0,0,-27):lanternMesh.position;var angle=Math.atan2(target.x-player.position.x,target.z-player.position.z)-yaw;compassArrow.rotation.z=angle}
  scene.children.forEach(function(o){if(o.userData&&o.userData.base){o.position.x=o.userData.base.x+Math.sin(now*.0015+o.userData.phase)*.35;o.position.y=o.userData.base.y+Math.sin(now*.002+o.userData.phase)*.18}});
  if(player.position.distanceTo(new THREE.Vector3(0,1.5,-27))<2.2){if(hasLantern){won=true;say('You escaped the forest.')}else say('The gate is locked by fog. Find the lantern first.');sync()}
}
function resize(){if(!stage||!renderer||!camera)return;var w=stage.clientWidth||300,h=stage.clientHeight||500;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}
function loop(now){var dt=Math.min(.05,(now-last)/1000);last=now;resize();update(dt,now);if(gateMesh)gateMesh.rotation.y=Math.sin(now*.001)*.035;renderer.render(scene,camera);requestAnimationFrame(loop)}
try{init()}catch(e){say('3D engine could not start.')}
})();
</script>
</section>`;
