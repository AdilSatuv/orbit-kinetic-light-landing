import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {finishes,temperatures,poses,normalizeConfig} from './config';

// No model downloads, textures or environment maps: all geometry is local and procedural.
export function createScene(host,initial,onLost){
 const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'});
 renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));
 renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;
 const canvas=renderer.domElement;canvas.setAttribute('aria-hidden','true');canvas.style.touchAction='pan-y';host.appendChild(canvas);
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(35,1,.1,30);camera.position.set(4.2,1.7,6.4);
 const object=new THREE.Group();scene.add(object);object.rotation.z=-.12;
 const metal=new THREE.MeshStandardMaterial(),diffuser=new THREE.MeshStandardMaterial({color:'#fff4de',emissive:'#ffd7a0',emissiveIntensity:1.3,roughness:.65});
 const ringGeometry=new THREE.TorusGeometry(1.55,.047,12,96),innerGeometry=new THREE.TorusGeometry(1.5,.014,8,96);
 const rings=[];
 for(let i=0;i<3;i++){const group=new THREE.Group();group.add(new THREE.Mesh(ringGeometry,metal));const light=new THREE.Mesh(innerGeometry,diffuser);group.add(light);object.add(group);rings.push(group);}
 const sphereGeometry=new THREE.SphereGeometry(.39,32,24),sphere=new THREE.Mesh(sphereGeometry,diffuser);object.add(sphere);
 const wireGeometry=new THREE.CylinderGeometry(.012,.012,3.7,8),wire=new THREE.Mesh(wireGeometry,metal);wire.position.y=2.1;object.add(wire);
 const jointGeometry=new THREE.SphereGeometry(.082,12,8);for(const y of [-1.55,1.55]){const joint=new THREE.Mesh(jointGeometry,metal);joint.position.y=y;object.add(joint);}
 scene.add(new THREE.HemisphereLight('#eeeaff','#69574e',3));const key=new THREE.DirectionalLight('#ffffff',5);key.position.set(-3,4,4);scene.add(key);const rim=new THREE.DirectionalLight('#cab9ff',4);rim.position.set(3,1,-2);scene.add(rim);
 const controls=new OrbitControls(camera,canvas);controls.target.set(0,.15,0);controls.enableZoom=false;controls.enablePan=false;controls.enableDamping=false;controls.minPolarAngle=.45;controls.maxPolarAngle=2.55;controls.update();
 let disposed=false,auto=false,visible=true,frame=0,last=0;const media=window.matchMedia('(prefers-reduced-motion: reduce)');
 function render(){if(!disposed&&visible&&!document.hidden)renderer.render(scene,camera);}
 function loop(time){frame=0;if(disposed||!auto||media.matches||!visible||document.hidden)return;object.rotation.y+=Math.min((time-last)/1000,.04)*.22;last=time;render();frame=requestAnimationFrame(loop);}
 function schedule(){if(!frame&&auto&&!media.matches&&visible&&!document.hidden){last=performance.now();frame=requestAnimationFrame(loop);}else if(frame&&(!auto||media.matches||!visible||document.hidden)){cancelAnimationFrame(frame);frame=0;}}
 function update(value){const c=normalizeConfig(value),f=finishes[c.finish],t=temperatures[c.temperature];metal.color.set(f.color);metal.metalness=f.metalness;metal.roughness=f.roughness;diffuser.emissive.set(t.color);const a=poses[c.pose].angle;rings.forEach((ring,i)=>{ring.rotation.set(.18*(i-1),a*(i-1),i===1?.12:0);});render();}
 function resize(){const {width,height}=host.getBoundingClientRect();if(!width||!height)return;renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();render();}
 const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(host);
 const intersection=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;schedule();render();},{threshold:.05});intersection.observe(host);
 function visibility(){schedule();render();}function motion(){if(media.matches)auto=false;schedule();render();}
 function lost(event){event.preventDefault();auto=false;schedule();onLost();}
 controls.addEventListener('change',render);document.addEventListener('visibilitychange',visibility);media.addEventListener('change',motion);canvas.addEventListener('webglcontextlost',lost);
 update(initial);resize();
 return {update,setAuto(value){auto=value&&!media.matches;schedule();},rotate(delta){object.rotation.y+=delta;render();},reset(){object.rotation.set(0,0,-.12);camera.position.set(4.2,1.7,6.4);controls.target.set(0,.15,0);controls.update();render();},destroy(){disposed=true;cancelAnimationFrame(frame);resizeObserver.disconnect();intersection.disconnect();document.removeEventListener('visibilitychange',visibility);media.removeEventListener('change',motion);canvas.removeEventListener('webglcontextlost',lost);controls.removeEventListener('change',render);controls.dispose();[ringGeometry,innerGeometry,sphereGeometry,wireGeometry,jointGeometry].forEach(g=>g.dispose());metal.dispose();diffuser.dispose();renderer.dispose();renderer.forceContextLoss();canvas.remove();}};
}
