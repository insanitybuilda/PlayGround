import * as THREE from 'three';

const app = document.querySelector('#app');
const world = document.querySelector('#world');
const flameCanvas = document.querySelector('#flames');
const flameCtx = flameCanvas.getContext('2d');
const readyButton = document.querySelector('#readyButton');
const blackout = document.querySelector('#blackout');
const joystick = document.querySelector('#joystick');
const joystickThumb = document.querySelector('#joystickThumb');
const jumpButton = document.querySelector('#jumpButton');
const toast = document.querySelector('#toast');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

// A small, original, hand-built 3D skeleton scene keeps the game self-contained.
const renderer = new THREE.WebGLRenderer({ canvas: world, alpha: true, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.8));
renderer.setClearColor(0x000000, 0);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(52, innerWidth / innerHeight, .1, 140);
camera.position.set(0, 0, 11);
camera.lookAt(0, 0, 0);
scene.add(new THREE.AmbientLight(0x9eb7c9, 1.5));
const keyLight = new THREE.DirectionalLight(0xdffaff, 3.5); keyLight.position.set(-5, 7, 9); scene.add(keyLight);
const rimLight = new THREE.PointLight(0x00dfff, 18, 18); rimLight.position.set(5, 2, 4); scene.add(rimLight);
const floorGlow = new THREE.PointLight(0x00c5e8, 11, 12); floorGlow.position.set(-4, -5, 3); scene.add(floorGlow);
const corridorGroup = new THREE.Group(); scene.add(corridorGroup); corridorGroup.visible = false;
const hallwayLights = new THREE.Group(); scene.add(hallwayLights); hallwayLights.visible = false;
const floorMat = new THREE.MeshStandardMaterial({ color: 0x202c35, roughness: .48, metalness: .12 });
const wallMat = new THREE.MeshStandardMaterial({ color: 0x101b23, roughness: .8 });
const trimMat = new THREE.MeshStandardMaterial({ color: 0x344653, roughness: .5, metalness: .25 });
const hallwayGlowMat = new THREE.MeshBasicMaterial({ color: 0x62eaff, transparent: true, opacity: .58 });
const distantDoorMat = new THREE.MeshStandardMaterial({ color: 0x090d12, roughness: .9 });
const corridorFloor = new THREE.Mesh(new THREE.PlaneGeometry(18, 68), floorMat);
corridorFloor.rotation.x = -Math.PI / 2; corridorFloor.position.set(0, -2.35, -23); corridorGroup.add(corridorFloor);
for (const side of [-1, 1]) {
  const wall = new THREE.Mesh(new THREE.BoxGeometry(.4, 8, 68), wallMat); wall.position.set(side * 7.8, 1.65, -23); corridorGroup.add(wall);
  const base = new THREE.Mesh(new THREE.BoxGeometry(.14, .3, 68), trimMat); base.position.set(side * 7.53, -2.15, -23); corridorGroup.add(base);
  const upper = new THREE.Mesh(new THREE.BoxGeometry(.1, .12, 68), trimMat); upper.position.set(side * 7.54, 4.65, -23); corridorGroup.add(upper);
}
const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(15.6, 68), new THREE.MeshStandardMaterial({ color: 0x10171c, side: THREE.DoubleSide, roughness: .9 }));
ceiling.rotation.x = Math.PI / 2; ceiling.position.set(0, 5.65, -23); corridorGroup.add(ceiling);
for (let i = 0; i < 13; i++) {
  const z = 5 - i * 4.6;
  const stripe = new THREE.Mesh(new THREE.BoxGeometry(.15, .035, 2.2), hallwayGlowMat); stripe.position.set(0, -2.325, z); corridorGroup.add(stripe);
  const lightBar = new THREE.Mesh(new THREE.BoxGeometry(1.7, .07, .22), hallwayGlowMat); lightBar.position.set(0, 5.59, z - 1.6); corridorGroup.add(lightBar);
  const lamp = new THREE.PointLight(0x60dfff, 2.1, 8); lamp.position.set(0, 4.7, z - 1.5); hallwayLights.add(lamp);
}
const endWall = new THREE.Mesh(new THREE.BoxGeometry(15.7, 8, .45), wallMat); endWall.position.set(0, 1.6, -57); corridorGroup.add(endWall);
const door = new THREE.Mesh(new THREE.BoxGeometry(4.6, 6, .24), distantDoorMat); door.position.set(0, .35, -56.72); corridorGroup.add(door);
const doorFrame = new THREE.Mesh(new THREE.BoxGeometry(5.1, 6.4, .14), trimMat); doorFrame.position.set(0, .35, -56.85); corridorGroup.add(doorFrame);
const doorFace = new THREE.Mesh(new THREE.BoxGeometry(4.35, 5.8, .12), distantDoorMat); doorFace.position.set(0, .35, -56.55); corridorGroup.add(doorFace);
const horizonLight = new THREE.PointLight(0x59ddff, 7, 24); horizonLight.position.set(0, 2.6, -52); corridorGroup.add(horizonLight);
const lineMat = new THREE.MeshBasicMaterial({ color: 0x52d9ef, transparent: true, opacity: .32 });
for (const x of [-7.3, 7.3]) { const line = new THREE.Mesh(new THREE.BoxGeometry(.025, .02, 58), lineMat); line.position.set(x, -2.13, -23); corridorGroup.add(line); }
const stars = new THREE.Group(); scene.add(stars);
const starMaterial = new THREE.MeshBasicMaterial({ color: 0x9befff, transparent: true, opacity: .7 });
for (let i = 0; i < 110; i++) {
  const dot = new THREE.Mesh(new THREE.SphereGeometry(Math.random() * .018 + .008, 6, 6), starMaterial);
  dot.position.set((Math.random() - .5) * 25, (Math.random() - .5) * 14, -4 - Math.random() * 8);
  stars.add(dot);
}
const mat = (color, roughness = .78, metalness = 0) => new THREE.MeshStandardMaterial({ color, roughness, metalness });
const coatMat = mat(0x222e43); const coatLight = mat(0x33445e); const dark = mat(0x10151d); const bone = mat(0xe9edf0, .52); const shoeMat = mat(0x11151c);
const black = new THREE.MeshBasicMaterial({ color: 0x03070b });
const cyan = new THREE.MeshStandardMaterial({ color: 0x8cffff, emissive: 0x00dfff, emissiveIntensity: 3.8, roughness: .2 });
const eyeAuraMat = new THREE.MeshBasicMaterial({ color: 0x00eaff, transparent: true, opacity: .17, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false });
const sans = new THREE.Group(); scene.add(sans);
const torso = new THREE.Group(); sans.add(torso);
function ellipsoid(parent, material, pos, scale, segments = 24) {
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, segments, Math.max(12, segments >> 1)), material);
  mesh.position.set(...pos); mesh.scale.set(...scale); parent.add(mesh); return mesh;
}
function cylinderBetween(parent, material, a, b, radiusA, radiusB = radiusA, segments = 12) {
  const start = new THREE.Vector3(...a), end = new THREE.Vector3(...b), dir = end.clone().sub(start);
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radiusB, radiusA, dir.length(), segments), material);
  mesh.position.copy(start.add(end).multiplyScalar(.5)); mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize()); parent.add(mesh); return mesh;
}
// Hood and short, rounded skeleton body.
ellipsoid(torso, coatMat, [0, -.62, 0], [.72, .85, .49]);
ellipsoid(torso, coatLight, [-.44, -.48, .12], [.35, .43, .37]);
ellipsoid(torso, coatLight, [.44, -.48, .12], [.35, .43, .37]);
ellipsoid(torso, dark, [0, -1.11, .13], [.5, .28, .42]);
// zipper / drawstrings
cylinderBetween(torso, mat(0x97a8b7), [0, -.16, .493], [0, -1.04, .52], .018, .018, 8);
for (const x of [-.22, .22]) cylinderBetween(torso, mat(0xb9c5cc), [x, -.18, .45], [x * 1.15, -.62, .5], .014, .014, 8);
// tiny arms, hands and sneakers
for (const side of [-1, 1]) {
  cylinderBetween(torso, coatMat, [side * .59, -.35, .05], [side * .79, -.83, .13], .2, .17);
  ellipsoid(torso, bone, [side * .8, -.88, .18], [.18, .14, .16]);
  cylinderBetween(torso, dark, [side * .29, -1.18, 0], [side * .32, -1.52, .03], .17, .15);
  ellipsoid(torso, shoeMat, [side * .34, -1.58, .12], [.26, .14, .3]);
}
// Skull: oversized friendly skull silhouette with sculpted cheeks and jaw.
const head = new THREE.Group(); head.position.set(0, .83, .05); torso.add(head);
const skullBack = new THREE.Mesh(new THREE.SphereGeometry(.84, 28, 20), bone); skullBack.position.set(0, .04, -.12); skullBack.scale.set(1, 1, .84); head.add(skullBack);
for (let i = 0; i < 4; i++) { const tooth = new THREE.Mesh(new THREE.BoxGeometry(.2, .14, .2), bone); tooth.position.set(-.3 + i * .2, -.57, .15); head.add(tooth); }
ellipsoid(head, bone, [0, 0, 0], [.83, .84, .64], 32);
ellipsoid(head, bone, [0, -.42, .12], [.59, .39, .53], 28);
ellipsoid(head, bone, [-.69, -.08, .02], [.22, .28, .38], 20);
ellipsoid(head, bone, [.69, -.08, .02], [.22, .28, .38], 20);
// eye sockets and the signature lit eye (front of the face is +Z)
ellipsoid(head, black, [-.31, .12, .548], [.23, .3, .11]);
ellipsoid(head, black, [.31, .12, .548], [.23, .3, .11]);
ellipsoid(head, cyan, [.33, .09, .66], [.10, .145, .045], 20);
ellipsoid(head, new THREE.MeshBasicMaterial({ color: 0xffffff }), [.345, .09, .704], [.035, .09, .025], 16);
const aura = new THREE.Mesh(new THREE.CircleGeometry(.42, 32), eyeAuraMat); aura.position.set(.32, .09, .57); head.add(aura);
const eyeLight = new THREE.PointLight(0x00dcff, 2.5, 2.8); eyeLight.position.set(.36, .12, 1); head.add(eyeLight);
// Nose and grin, built from fine, dark tubes over the jaw.
ellipsoid(head, mat(0xc8d1d5), [0, -.23, .62], [.055, .07, .04], 12);
const grinPts = [new THREE.Vector3(-.43, -.38, .56), new THREE.Vector3(-.3, -.43, .64), new THREE.Vector3(-.14, -.45, .66), new THREE.Vector3(0, -.44, .67), new THREE.Vector3(.16, -.45, .66), new THREE.Vector3(.31, -.42, .63), new THREE.Vector3(.43, -.37, .56)];
const grin = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(grinPts), 24, .018, 5, false), mat(0x78838b)); head.add(grin);
for (let i = 0; i < 6; i++) {
  const x = -.31 + i * .125;
  cylinderBetween(head, mat(0x9ca7ac), [x, -.418, .64], [x, -.48, .63], .009, .009, 5);
}
// Floating cyan dust motes around the silhouette.
const motes = new THREE.Group(); scene.add(motes);
for (let i = 0; i < 16; i++) {
  const mote = new THREE.Mesh(new THREE.SphereGeometry(.025 + Math.random() * .025, 8, 6), new THREE.MeshBasicMaterial({ color: i % 3 ? 0x39eaff : 0xfadf71, transparent: true, opacity: .72 }));
  mote.userData = { phase: Math.random() * 6.28, radius: 1.3 + Math.random() * 2.6, speed: .3 + Math.random() * .6 };
  motes.add(mote);
}
const clock = new THREE.Clock();
let viewWidth = 16, viewHeight = 12, introStart = performance.now(), corridorMode = false;
let flameW = 0, flameH = 0, flames = [];
const keys = new Set();
const playerSpeed = 4.2;
function resize() {
  const w = innerWidth, h = innerHeight;
  renderer.setSize(w, h, false); viewWidth = viewHeight * w / h;
  camera.aspect = w / h;
  camera.position.set(0, 0, 11);
  camera.lookAt(0, 0, 0);
  camera.updateProjectionMatrix();
  flameW = flameCanvas.width = Math.floor(w * Math.min(devicePixelRatio || 1, 1.5));
  flameH = flameCanvas.height = Math.floor(h * Math.min(devicePixelRatio || 1, 1.5));
  flameCanvas.style.width = `${w}px`; flameCanvas.style.height = `${h}px`;
  flames = Array.from({ length: Math.floor(w / 9) }, () => ({ x: Math.random() * flameW, y: flameH + Math.random() * flameH * .25, r: 12 + Math.random() * 45, life: Math.random(), drift: (Math.random() - .5) * .75 }));
}
addEventListener('resize', resize); resize();
function drawFlames(dt) {
  const ctx = flameCtx; ctx.clearRect(0, 0, flameW, flameH);
  const sx = flameW / innerWidth, sy = flameH / innerHeight;
  ctx.save(); ctx.scale(sx, sy); ctx.globalCompositeOperation = 'lighter';
  const base = innerHeight * .97;
  for (const f of flames) {
    f.life += dt * (.55 + Math.random() * .4); f.y -= dt * (80 + f.r * 3); f.x += f.drift + Math.sin(f.life * 5 + f.x) * .45;
    if (f.y < innerHeight * (.35 + Math.random() * .3) || f.life > 2.3) { f.y = base + Math.random() * 80; f.x = Math.random() * innerWidth; f.r = 10 + Math.random() * 49; f.life = 0; }
    const life = Math.max(0, 1 - f.life / 2.3), radius = f.r * (.4 + life * .75);
    const grad = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, radius);
    grad.addColorStop(0, `rgba(218,255,255,${.22 * life})`); grad.addColorStop(.24, `rgba(0,238,255,${.18 * life})`); grad.addColorStop(1, 'rgba(0,159,255,0)');
    ctx.fillStyle = grad; ctx.beginPath(); ctx.arc(f.x, f.y, radius, 0, Math.PI * 2); ctx.fill();
  }
  const bed = ctx.createLinearGradient(0, innerHeight, 0, innerHeight * .57);
  bed.addColorStop(0, 'rgba(0,220,248,.22)'); bed.addColorStop(.28, 'rgba(0,183,240,.12)'); bed.addColorStop(1, 'rgba(0,130,220,0)'); ctx.fillStyle = bed; ctx.fillRect(0, innerHeight * .56, innerWidth, innerHeight * .44);
  ctx.restore();
}

// Corridor exploration controls and scene transition.
let audioCtx = null, transitioning = false, corridorReady = false;
let player = { x: 0, z: 7.5, jump: 0, jumpVelocity: 0, moving: false };
let joystickPointer = null, joystickVector = { x: 0, y: 0 };
function showToast(text) { toast.textContent = text; toast.classList.add('show'); clearTimeout(showToast.timer); showToast.timer = setTimeout(() => toast.classList.remove('show'), 1750); }
function beep(freq = 440, duration = .07, type = 'sine', volume = .045) {
  if (!audioCtx || audioCtx.state !== 'running') return;
  const osc = audioCtx.createOscillator(), gain = audioCtx.createGain(); osc.type = type; osc.frequency.value = freq; gain.gain.setValueAtTime(volume, audioCtx.currentTime); gain.gain.exponentialRampToValueAtTime(.001, audioCtx.currentTime + duration); osc.connect(gain); gain.connect(audioCtx.destination); osc.start(); osc.stop(audioCtx.currentTime + duration);
}
async function lockLandscape() {
  try { if (screen.orientation?.lock) await screen.orientation.lock('landscape'); } catch { /* iOS/browser fullscreen policies may reject orientation lock. */ }
}
async function startBattle() {
  if (transitioning || corridorReady) return;
  transitioning = true; readyButton.classList.remove('show');
  blackout.classList.add('cover'); await lockLandscape();
  await new Promise(resolve => setTimeout(resolve, 1250));
  app.classList.add('corridor-mode'); corridorMode = true; corridorReady = true;
  player = { x: 0, z: 7.5, jump: 0, jumpVelocity: 0, moving: false };
  sans.position.set(0, -.62, -42); sans.scale.setScalar(.9); sans.rotation.set(0, Math.PI, 0); torso.rotation.set(0, 0, 0); head.rotation.set(0, 0, 0);
  camera.position.set(0, .25, 8); camera.lookAt(0, .15, -20);
  corridorGroup.visible = true; hallwayLights.visible = true; stars.visible = false; motes.visible = false; floorGlow.intensity = 0;
  await new Promise(resolve => setTimeout(resolve, 350)); blackout.classList.remove('cover');
  document.querySelector('#corridorPrompt').textContent = 'WASD / JOYSTICK TO WALK';
  showToast('THE LAST CORRIDOR. SANS IS WAITING.'); beep(260, .22, 'triangle', .04);
}
readyButton.addEventListener('click', startBattle);
function setJoystick(event) {
  const rect = joystick.getBoundingClientRect(), radius = rect.width * .33;
  const dx = event.clientX - (rect.left + rect.width / 2), dy = event.clientY - (rect.top + rect.height / 2), length = Math.hypot(dx, dy), scale = length > radius ? radius / length : 1;
  joystickVector = { x: dx * scale / radius, y: dy * scale / radius };
  joystickThumb.style.transform = `translate(calc(-50% + ${joystickVector.x * radius}px), calc(-50% + ${joystickVector.y * radius}px))`;
}
joystick.addEventListener('pointerdown', e => { if (!corridorReady) return; joystickPointer = e.pointerId; joystick.setPointerCapture(e.pointerId); setJoystick(e); });
joystick.addEventListener('pointermove', e => { if (e.pointerId === joystickPointer) setJoystick(e); });
function releaseJoystick() { joystickPointer = null; joystickVector = { x: 0, y: 0 }; joystickThumb.style.transform = 'translate(-50%, -50%)'; }
joystick.addEventListener('pointerup', releaseJoystick); joystick.addEventListener('pointercancel', releaseJoystick);
function jump() { if (!corridorReady || player.jump > .02) return; player.jumpVelocity = 5.3; beep(360, .09, 'triangle', .025); }
jumpButton.addEventListener('pointerdown', e => { e.preventDefault(); jump(); });
addEventListener('keydown', e => {
  const key = e.key.toLowerCase(); if (['arrowup','arrowdown','arrowleft','arrowright','w','a','s','d',' ','enter'].includes(key)) e.preventDefault();
  keys.add(key); if (key === ' ' || key === 'arrowup') jump();
});
addEventListener('keyup', e => keys.delete(e.key.toLowerCase()));
document.querySelector('#soundToggle').addEventListener('click', () => {
  const toggle = document.querySelector('#soundToggle'); if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume(); toggle.classList.toggle('on'); document.querySelector('#soundLabel').textContent = toggle.classList.contains('on') ? 'SOUND ON' : 'SOUND OFF';
  if (!toggle.classList.contains('on')) audioCtx.suspend(); else beep(440, .12, 'sine', .03);
});
document.querySelector('#soundToggle').addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') document.querySelector('#soundToggle').click(); });

function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), .04), now = performance.now(), elapsed = (now - introStart) / 1000;
  drawFlames(dt);
  stars.rotation.z = Math.sin(now * .00004) * .018;
  const appear = corridorMode ? 1 : THREE.MathUtils.smoothstep(elapsed, 2.7, 4.4);
  if (!corridorMode) {
    const targetX = Math.min(viewWidth * .28, 4.6), targetY = -.82;
    sans.position.x = THREE.MathUtils.damp(sans.position.x, targetX, 2.3, dt);
    sans.position.y = THREE.MathUtils.damp(sans.position.y, THREE.MathUtils.lerp(-7.3, targetY, appear), 2.6, dt);
    const entry = THREE.MathUtils.smoothstep(elapsed, 2.6, 4.25);
    sans.scale.setScalar(THREE.MathUtils.lerp(.001, 1.34, entry));
    sans.rotation.y = Math.sin(now * .00048) * .055;
    sans.rotation.z = THREE.MathUtils.lerp(.12, 0, entry) + Math.sin(now * .0011) * .009;
    torso.position.y = Math.sin(now * .0015) * .045;
    head.rotation.x = Math.sin(now * .0011) * .025;
    readyButton.classList.toggle('show', elapsed > 5.25);
    const t = now * .001;
    motes.children.forEach((m, i) => { const d = m.userData; m.position.set(sans.position.x + Math.cos(t * d.speed + d.phase) * d.radius, sans.position.y + Math.sin(t * d.speed * 1.2 + d.phase) * d.radius * .7, .4 + Math.sin(t + i) * .4); });
  } else {
    updateCorridor(dt, now);
  }
  aura.material.opacity = .12 + (Math.sin(now * .004) + 1) * .08;
  eyeLight.intensity = 1.8 + (Math.sin(now * .005) + 1) * 1.5;
  renderer.render(scene, camera);
}
function updateCorridor(dt, now) {
  const keyboardX = (keys.has('arrowright') || keys.has('d') ? 1 : 0) - (keys.has('arrowleft') || keys.has('a') ? 1 : 0);
  const keyboardY = (keys.has('arrowdown') || keys.has('s') ? 1 : 0) - (keys.has('arrowup') || keys.has('w') ? 1 : 0);
  const inputX = keyboardX || joystickVector.x;
  const inputY = keyboardY || joystickVector.y;
  const length = Math.hypot(inputX, inputY), normalizer = length > 1 ? 1 / length : 1;
  player.x = THREE.MathUtils.clamp(player.x + inputX * normalizer * playerSpeed * dt, -5.8, 5.8);
  player.z = THREE.MathUtils.clamp(player.z + inputY * normalizer * playerSpeed * dt, -50, 7.5);
  player.moving = Math.hypot(inputX, inputY) > .08;

  player.jump = Math.max(0, player.jump + player.jumpVelocity * dt);
  player.jumpVelocity -= 12 * dt;
  if (player.jump === 0 && player.jumpVelocity < 0) player.jumpVelocity = 0;

  const cameraTarget = new THREE.Vector3(player.x, .15 + player.jump, player.z + .55);
  camera.position.x = THREE.MathUtils.damp(camera.position.x, cameraTarget.x, 8, dt);
  camera.position.y = THREE.MathUtils.damp(camera.position.y, cameraTarget.y, 8, dt);
  camera.position.z = THREE.MathUtils.damp(camera.position.z, cameraTarget.z, 8, dt);
  camera.lookAt(player.x, .15 + player.jump * .8, player.z - 22);
  sans.position.y = -.62 + Math.sin(now * .0014) * .035;
  torso.position.y = Math.sin(now * .0014) * .025;
  head.rotation.x = Math.sin(now * .0014) * .018;
  document.querySelector('#corridorPrompt').textContent = player.moving ? 'KEEP WALKING. HE IS WAITING.' : 'WASD / JOYSTICK TO WALK';
}

animate();
