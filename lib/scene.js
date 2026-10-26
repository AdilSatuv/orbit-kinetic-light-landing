import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {finishes,temperatures,poses,normalizeConfig} from './config';

export function createScene(host,initial,onLost){
 const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'});renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;
 const canvas=renderer.domElement;canvas.setAttribute('aria-hidden','true');host.appendChild(canvas);
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(35,1,.1,60);camera.position.set(2.7,1.3,8);const targetCamera=new THREE.Vector3();
 const object=new THREE.Group();scene.add(object);object.rotation.z=-.19;
 const metal=new THREE.MeshStandardMaterial(),diffuser=new THREE.MeshStandardMaterial({color:'#fff3da',emissive:'#ffd7a0',emissiveIntensity:2.5,roughness:.4});
 const geometries=[],materials=[metal,diffuser];function geo(g){geometries.push(g);return g}function mat(m){materials.push(m);return m}
 const ringGeometry=geo(new THREE.TorusGeometry(1.55,.045,14,120)),innerGeometry=geo(new THREE.TorusGeometry(1.5,.012,8,120)),rings=[];
 for(let i=0;i<3;i++){const ring=new THREE.Group();ring.add(new THREE.Mesh(ringGeometry,metal),new THREE.Mesh(innerGeometry,diffuser));object.add(ring);rings.push(ring)}
 const sphere=new THREE.Mesh(geo(new THREE.SphereGeometry(.33,40,28)),diffuser);object.add(sphere);
 const wire=new THREE.Mesh(geo(new THREE.CylinderGeometry(.009,.009,4.4,8)),metal);wire.position.y=2.25;object.add(wire);
 const jointGeometry=geo(new THREE.SphereGeometry(.065,12,8));for(const y of [-1.55,1.55]){const joint=new THREE.Mesh(jointGeometry,metal);joint.position.y=y;object.add(joint)}
 const glowBytes=new Uint8Array(64*64*4);for(let y=0;y<64;y++)for(let x=0;x<64;x++){const d=Math.hypot((x-31.5)/31.5,(y-31.5)/31.5),i=(y*64+x)*4;glowBytes[i]=255;glowBytes[i+1]=255;glowBytes[i+2]=255;glowBytes[i+3]=Math.round(100*Math.pow(Math.max(0,1-d),3))}
 const glowTexture=new THREE.DataTexture(glowBytes,64,64);glowTexture.needsUpdate=true;const glowMaterial=mat(new THREE.SpriteMaterial({map:glowTexture,color:'#ffc68a',transparent:true,blending:THREE.AdditiveBlending,depthWrite:false})),glow=new THREE.Sprite(glowMaterial);glow.scale.set(3.5,3.5,1);object.add(glow);
 scene.add(new THREE.HemisphereLight('#e8deff','#291820',2.2));const key=new THREE.DirectionalLight('#ffe5c1',5);key.position.set(-3,4,5);scene.add(key);const rim=new THREE.DirectionalLight('#a295ff',5);rim.position.set(3,1,-3);scene.add(rim);const fill=new THREE.DirectionalLight('#a6c5ff',1.5);fill.position.set(-4,-2,2);scene.add(fill);
 const guideMaterial=mat(new THREE.LineBasicMaterial({color:'#9f91c6',transparent:true,opacity:.15}));const guides=new THREE.Group();for(let i=0;i<2;i++){const points=[];for(let j=0;j<=160;j++){const a=j/160*Math.PI*2;points.push(new THREE.Vector3(Math.cos(a)*(2.65+i*.35),0,Math.sin(a)*(2.65+i*.35)))}const line=new THREE.Line(geo(new THREE.BufferGeometry().setFromPoints(points)),guideMaterial);line.rotation.set(i*.45,.2,i*.12);guides.add(line)}guides.position.y=-.6;scene.add(guides);
 const positions=new Float32Array(180*3);for(let i=0;i<180;i++){const n=i+1;positions[i*3]=Math.sin(n*127.1)*14;positions[i*3+1]=Math.sin(n*311.7)*9;positions[i*3+2]=-4-Math.abs(Math.cos(n*74.7))*10}const starGeometry=geo(new THREE.BufferGeometry());starGeometry.setAttribute('position',new THREE.BufferAttribute(positions,3));const stars=new THREE.Points(starGeometry,mat(new THREE.PointsMaterial({color:'#bfb6df',size:.018,transparent:true,opacity:.55,depthWrite:false})));scene.add(stars);
 const controls=new OrbitControls(camera,canvas);controls.enableZoom=false;controls.enablePan=false;controls.enableDamping=false;controls.minPolarAngle=.35;controls.maxPolarAngle=2.65;controls.target.set(0,.1,0);controls.update();canvas.style.touchAction='pan-y';
 const media=matchMedia('(prefers-reduced-motion: reduce)');let disposed=false,visible=true,auto=false,frame=0,last=0,chapter=0,moving=false,interacting=false,cfg=normalizeConfig(initial),mobile=false;
 const targetRings=[new THREE.Euler(),new THREE.Euler(),new THREE.Euler()],targetY=[0,0,0];
 function render(){if(!disposed&&visible&&!document.hidden)renderer.render(scene,camera)}
 function canAnimate(){return !disposed&&visible&&!document.hidden&&!media.matches&&(moving||auto)}
 function request(){if(!frame&&canAnimate()){last=performance.now();frame=requestAnimationFrame(loop)}}
 function stop(){if(frame)cancelAnimationFrame(frame);frame=0}
 function settle(){camera.position.copy(targetCamera);rings.forEach((r,i)=>{r.rotation.copy(targetRings[i]);r.position.y=targetY[i]});moving=false;controls.update();render()}
 function loop(time){frame=0;if(!canAnimate())return;const dt=Math.min((time-last)/1000,.04);last=time;if(auto&&!interacting)object.rotation.y+=dt*.12;
  if(moving){camera.position.lerp(targetCamera,.085);let error=camera.position.distanceTo(targetCamera);rings.forEach((r,i)=>{for(const axis of ['x','y','z']){r.rotation[axis]+=(targetRings[i][axis]-r.rotation[axis])*.085;error+=Math.abs(targetRings[i][axis]-r.rotation[axis])}r.position.y+=(targetY[i]-r.position.y)*.085;error+=Math.abs(targetY[i]-r.position.y)});controls.update();if(error<.007)moving=false}
  render();if(canAnimate())frame=requestAnimationFrame(loop);
 }
 function targets(){const a=poses[cfg.pose].angle;rings.forEach((r,i)=>{targetRings[i].set(.16*(i-1),a*(i-1),i===1?.15:0);targetY[i]=chapter===2?(i-1)*.32:0});const distance=mobile?[12.8,11.8,13.8][chapter]*Math.max(1,.55/camera.aspect):[8.2,6.6,8.6][chapter];targetCamera.set([2.7,-1.8,3.8][chapter],chapter===1?.7:1.2,distance);object.position.x=mobile?0:1.05;object.position.y=mobile?-1.15:0;guides.position.x=object.position.x;moving=true;if(media.matches)settle();else request()}
 function update(value){cfg=normalizeConfig(value);const f=finishes[cfg.finish],t=temperatures[cfg.temperature];metal.color.set(f.color);metal.metalness=f.metalness;metal.roughness=f.roughness;diffuser.emissive.set(t.color);glowMaterial.color.set(t.color);targets();render()}
 function resize(){const {width,height}=host.getBoundingClientRect();if(!width||!height)return;mobile=width<760;renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();targets();render()}
 function visibility(){if(document.hidden)stop();else{render();request()}}function motion(){if(media.matches){auto=false;stop();settle()}else request()}function lost(e){e.preventDefault();auto=false;moving=false;stop();onLost()}function start(){interacting=true;moving=false}function end(){interacting=false;request()}
 const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(host);const intersection=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(!visible)stop();else{render();request()}},{threshold:.01});intersection.observe(host);
 controls.addEventListener('change',render);controls.addEventListener('start',start);controls.addEventListener('end',end);document.addEventListener('visibilitychange',visibility);media.addEventListener('change',motion);canvas.addEventListener('webglcontextlost',lost);
 update(initial);resize();
 return {update,setChapter(value){chapter=Math.max(0,Math.min(2,value));targets()},setAuto(value){auto=value&&!media.matches;if(!auto&&!moving)stop();request();render()},rotate(delta){object.rotation.y+=delta;render()},reset(){object.rotation.set(0,0,-.19);targets();render()},destroy(){disposed=true;stop();resizeObserver.disconnect();intersection.disconnect();controls.removeEventListener('change',render);controls.removeEventListener('start',start);controls.removeEventListener('end',end);controls.dispose();document.removeEventListener('visibilitychange',visibility);media.removeEventListener('change',motion);canvas.removeEventListener('webglcontextlost',lost);geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());glowTexture.dispose();renderer.dispose();renderer.forceContextLoss();canvas.remove()}};
}
