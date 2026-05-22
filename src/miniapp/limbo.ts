export const LIMBO_SECTION = `<section id="limbo" class="view limbo-view">
<style>
.limbo-view{padding:10px 12px calc(112px + env(safe-area-inset-bottom))!important;overflow:hidden!important;background:linear-gradient(180deg,#050b08,#010201)!important}.limbo-game3d{height:calc(100dvh - 156px - env(safe-area-inset-top) - env(safe-area-inset-bottom));min-height:520px;display:grid;grid-template-rows:minmax(0,1fr) auto;gap:10px}.limbo-stage3d{position:relative;overflow:hidden;border-radius:28px;border:1px solid rgba(255,255,255,.12);background:#020403;box-shadow:0 28px 70px rgba(0,0,0,.48),inset 0 1px 0 rgba(255,255,255,.1)}.limbo-stage3d canvas{width:100%!important;height:100%!important;display:block!important}.limbo-hud3d{position:absolute;left:12px;right:12px;top:12px;display:flex;justify-content:space-between;gap:8px;z-index:5;pointer-events:none}.limbo-pill3d{height:34px;padding:0 12px;border-radius:999px;background:rgba(0,0,0,.42);border:1px solid rgba(255,255,255,.13);display:flex;align-items:center;color:#fff;font-size:12px;font-weight:900;-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px)}.limbo-msg3d{position:absolute;left:12px;right:12px;bottom:12px;z-index:5;padding:12px 14px;border-radius:20px;background:rgba(0,0,0,.45);border:1px solid rgba(255,255,255,.13);color:#fff;font-size:13px;font-weight:800;line-height:1.25;-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px)}.limbo-controls3d{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.limbo-controls3d button{height:54px;border-radius:18px;border:1px solid rgba(255,255,255,.14);background:linear-gradient(180deg,rgba(255,255,255,.16),rgba(255,255,255,.055));color:#fff;font-size:22px;font-weight:950;box-shadow:0 14px 30px rgba(0,0,0,.28),inset 0 1px 0 rgba(255,255,255,.22)}.limbo-controls3d button:active{transform:scale(.96)}.limbo-controls3d [data-limbo-action=forward]{grid-column:2}.limbo-controls3d [data-limbo-action=left]{grid-column:1;grid-row:2}.limbo-controls3d [data-limbo-action=back]{grid-column:2;grid-row:2}.limbo-controls3d [data-limbo-action=right]{grid-column:3;grid-row:2}.limbo-controls3d [data-limbo-action=reset]{grid-column:1/4;height:44px;font-size:14px;color:rgba(255,255,255,.76)}
</style>
<div class="limbo-game3d"><div class="limbo-stage3d" data-limbo-stage><div class="limbo-hud3d"><span class="limbo-pill3d" data-limbo-inventory>No lantern</span><span class="limbo-pill3d" data-limbo-state>Forest</span></div><div class="limbo-msg3d" data-limbo-message>Loading forest...</div></div><div class="limbo-controls3d"><button type="button" data-limbo-action="forward">↑</button><button type="button" data-limbo-action="left">←</button><button type="button" data-limbo-action="back">↓</button><button type="button" data-limbo-action="right">→</button><button type="button" data-limbo-action="reset">Reset</button></div></div>
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
var renderer,scene,camera,player,lanternMesh,gateMesh,lanternLight;
var trees=[],pressed={},hasLantern=false,won=false,yaw=0,last=performance.now();
function say(t){if(msg)msg.textContent=t}
function sync(){if(inv)inv.textContent=hasLantern?'Lantern on':'No lantern';if(stateEl)stateEl.textContent=won?'Escaped':'Forest'}
function init(){
  if(!stage)return;
  scene=new THREE.Scene();
  scene.background=new THREE.Color(0x07110c);
  scene.fog=new THREE.FogExp2(0x07110c,0.055);
  camera=new THREE.PerspectiveCamera(72,1,0.1,90);
  renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(2,window.devicePixelRatio||1));
  stage.appendChild(renderer.domElement);
  var hemi=new THREE.HemisphereLight(0xa7ffc6,0x071007,0.72);scene.add(hemi);
  var moon=new THREE.DirectionalLight(0xd4ffe0,0.8);moon.position.set(-4,8,3);scene.add(moon);
  lanternLight=new THREE.PointLight(0xffd27a,0,7,1.8);scene.add(lanternLight);
  var ground=new THREE.Mesh(new THREE.PlaneGeometry(70,70),new THREE.MeshStandardMaterial({color:0x102717,roughness:1}));ground.rotation.x=-Math.PI/2;scene.add(ground);
  var pathMat=new THREE.MeshStandardMaterial({color:0x5b4424,roughness:1});
  var path=new THREE.Mesh(new THREE.PlaneGeometry(9,62),pathMat);path.rotation.x=-Math.PI/2;path.position.z=-7;path.position.y=.01;scene.add(path);
  makeForest();
  lanternMesh=new THREE.Mesh(new THREE.CylinderGeometry(.18,.18,.55,16),new THREE.MeshStandardMaterial({color:0xffd77b,emissive:0xffb13d,emissiveIntensity:1.3}));lanternMesh.position.set(-2,.32,-14);scene.add(lanternMesh);
  gateMesh=new THREE.Group();
  var gateMat=new THREE.MeshStandardMaterial({color:0x85ffc1,emissive:0x2cff9b,emissiveIntensity:.8});
  var a=new THREE.Mesh(new THREE.BoxGeometry(.35,3.2,.35),gateMat);a.position.set(-1.2,1.6,-25);
  var b=a.clone();b.position.x=1.2;
  var top=new THREE.Mesh(new THREE.BoxGeometry(2.8,.35,.35),gateMat);top.position.set(0,3.1,-25);
  gateMesh.add(a,b,top);scene.add(gateMesh);
  player=new THREE.Object3D();player.position.set(0,1.55,4);scene.add(player);player.add(camera);camera.position.set(0,0,0);
  var handMat=new THREE.MeshStandardMaterial({color:0x241915,roughness:.7});
  var leftHand=new THREE.Mesh(new THREE.BoxGeometry(.18,.18,.55),handMat);leftHand.position.set(-.38,-.42,-.85);leftHand.rotation.z=.25;camera.add(leftHand);
  var rightHand=leftHand.clone();rightHand.position.x=.38;rightHand.rotation.z=-.25;camera.add(rightHand);
  bind();resize();say('You are inside the forest. Move forward and find the lantern.');sync();requestAnimationFrame(loop);
}
function makeTree(x,z,s){
  var trunk=new THREE.Mesh(new THREE.CylinderGeometry(.13*s,.18*s,1.5*s,8),new THREE.MeshStandardMaterial({color:0x3b2415,roughness:1}));trunk.position.set(x,.75*s,z);
  var crown=new THREE.Mesh(new THREE.ConeGeometry(.72*s,2.2*s,10),new THREE.MeshStandardMaterial({color:0x0b4b27,roughness:1}));crown.position.set(x,2.2*s,z);
  scene.add(trunk,crown);trees.push({x:x,z:z,r:.72*s});
}
function makeForest(){
  for(var i=0;i<120;i++){var side=i%2===0?-1:1;var x=side*(5+Math.random()*24);var z=8-Math.random()*48;makeTree(x,z,.75+Math.random()*.9)}
  for(var j=0;j<34;j++){makeTree(-3.7-Math.random()*1.6,6-j*1.1,.55+Math.random()*.45);makeTree(3.7+Math.random()*1.6,6-j*1.1,.55+Math.random()*.45)}
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
function reset(){hasLantern=false;won=false;yaw=0;player.position.set(0,1.55,4);player.rotation.y=0;lanternMesh.visible=true;lanternLight.intensity=0;say('You are inside the forest. Move forward and find the lantern.');sync()}
function canMove(nx,nz){if(Math.abs(nx)>32||nz>8||nz<-31)return false;for(var i=0;i<trees.length;i++){var t=trees[i],dx=nx-t.x,dz=nz-t.z;if(dx*dx+dz*dz<(t.r+.38)*(t.r+.38))return false}return true}
function move(dx,dz){var nx=player.position.x+dx,nz=player.position.z+dz;if(canMove(nx,nz)){player.position.x=nx;player.position.z=nz}else say('A tree blocks your way.')}
function update(dt){
  if(won)return;
  if(pressed.left)yaw+=dt*2.35;if(pressed.right)yaw-=dt*2.35;player.rotation.y=yaw;
  var speed=pressed.forward||pressed.back?4.1:0;var dir=pressed.back?1:-1;
  if(speed){move(Math.sin(yaw)*speed*dt*dir,Math.cos(yaw)*speed*dt*dir)}
  if(lanternMesh.visible&&player.position.distanceTo(lanternMesh.position)<1.25){hasLantern=true;lanternMesh.visible=false;lanternLight.intensity=1.7;say('Lantern found. The fog is weaker. Find the glowing gate.');sync()}
  if(hasLantern){lanternLight.position.copy(player.position);lanternLight.position.y=1.2}
  if(player.position.distanceTo(new THREE.Vector3(0,1.5,-25))<2.1){if(hasLantern){won=true;say('You escaped the forest.')}else say('The gate is locked by fog. Find the lantern first.');sync()}
}
function resize(){if(!stage||!renderer||!camera)return;var w=stage.clientWidth||300,h=stage.clientHeight||500;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}
function loop(now){var dt=Math.min(.05,(now-last)/1000);last=now;resize();update(dt);if(lanternMesh&&lanternMesh.visible)lanternMesh.rotation.y+=dt*1.6;if(gateMesh)gateMesh.rotation.y=Math.sin(now*.001)*.04;renderer.render(scene,camera);requestAnimationFrame(loop)}
try{init()}catch(e){say('3D engine could not start.')}
})();
</script>
</section>`;
