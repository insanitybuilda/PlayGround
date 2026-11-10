import * as THREE from 'three';

const app = document.querySelector('#app');
const world = document.querySelector('#world');
const flameCanvas = document.querySelector('#flames');
const flameCtx = flameCanvas.getContext('2d');
const readyButton = document.querySelector('#readyButton');
const battleHud = document.querySelector('#battleHud');
const arena = document.querySelector('.arena-frame');
const soulEl = document.querySelector('#soul');
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
const camera = new THREE.OrthographicCamera(-8, 8, 6, -6, .1, 100);
camera.position.set(0, 0, 22);
camera.lookAt(0, 0, 0);
scene.add(new THREE.AmbientLight(0x9eb7c9, 1.5));
const keyLight = new THREE.DirectionalLight(0xdffaff, 3.5); keyLight.position.set(-5, 7, 9); scene.add(keyLight);
const rimLight = new THREE.PointLight(0x00dfff, 18, 18); rimLight.position.set(5, 2, 4); scene.add(rimLight);
const floorGlow = new THREE.PointLight(0x00c5e8, 11, 12); floorGlow.position.set(-4, -5, 3); scene.add(floorGlow);
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
let viewWidth = 16, viewHeight = 12, introStart = performance.now(), battleMode = false, battleTime = 0;
let flameW = 0, flameH = 0, flames = [];
function resize() {
  const w = innerWidth, h = innerHeight;
  renderer.setSize(w, h, false); viewHeight = 12; viewWidth = viewHeight * w / h;
  camera.left = -viewWidth / 2; camera.right = viewWidth / 2; camera.top = viewHeight / 2; camera.bottom = -viewHeight / 2; camera.updateProjectionMatrix();
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

// Battle state and friendly input handling.
let playerHp = 20, bossHp = 100, wave = 1, waveElapsed = 0, globalBattleElapsed = 0, invulnerable = 0, gameOver = false, victory = false;
let soul = { x: .5, y: .56, vx: 0, vy: 0 }, keys = new Set(), bullets = [], spawnTimer = 0, audioCtx = null;
const setMessage = (text) => { document.querySelector('#battleMessage').textContent = text; };
function showToast(text) { toast.textContent = text; toast.classList.add('show'); clearTimeout(showToast.timer); showToast.timer = setTimeout(() => toast.classList.remove('show'), 1550); }
function updateBars() {
  document.querySelector('#playerHealth').style.width = `${playerHp / 20 * 100}%`;
  document.querySelector('#hpValue').textContent = playerHp;
  document.querySelector('#bossHealth').style.width = `${bossHp}%`;
  document.querySelector('#waveNumber').textContent = String(wave).padStart(2, '0');
}
function beep(freq = 440, duration = .07, type = 'sine', volume = .045) {
  if (!audioCtx || audioCtx.state !== 'running') return;
  const osc = audioCtx.createOscillator(), gain = audioCtx.createGain();
  osc.type = type; osc.frequency.value = freq; gain.gain.setValueAtTime(volume, audioCtx.currentTime); gain.gain.exponentialRampToValueAtTime(.001, audioCtx.currentTime + duration);
  osc.connect(gain); gain.connect(audioCtx.destination); osc.start(); osc.stop(audioCtx.currentTime + duration);
}
function startBattle() {
  if (battleMode) return;
  battleMode = true; battleTime = 0; introStart = performance.now(); app.classList.add('battle');
  battleHud.classList.add('active'); readyButton.classList.remove('show');
  sans.position.set(0, 3.15, 0); sans.scale.setScalar(.78); sans.rotation.set(0, 0, 0);
  torso.rotation.set(0, 0, 0); head.rotation.set(0, 0, 0);
  playerHp = 20; bossHp = 100; wave = 1; waveElapsed = 0; globalBattleElapsed = 0; invulnerable = 0; gameOver = false; victory = false; soul = { x: .5, y: .56, vx: 0, vy: 0 }; bullets.forEach(b => b.el.remove()); bullets = []; spawnTimer = .45; battleHud.classList.remove('over'); updateSoul(); updateBars(); setMessage('DON’T MOVE. JUST KIDDING.');
  showToast('SURVIVE THE ATTACK. KEEP YOUR SOUL SAFE.'); beep(520, .13, 'triangle', .05);
}
readyButton.addEventListener('click', startBattle);
function updateSoul() { soulEl.style.left = `${soul.x * 100}%`; soulEl.style.top = `${soul.y * 100}%`; }
function spawnBone(opts = {}) {
  const el = document.createElement('div'); el.className = `projectile ${opts.blue ? 'blue' : ''}`;
  const horizontal = opts.horizontal ?? Math.random() > .5;
  el.style.cssText = `position:absolute;z-index:2;width:${horizontal ? 49 : 15}px;height:${horizontal ? 15 : 49}px;border-radius:99px;background:${opts.blue ? '#4ceaff' : 'linear-gradient(90deg,#f6fbff,#d6e0e5)'};box-shadow:0 0 9px ${opts.blue ? 'rgba(44,231,255,.62)' : 'rgba(234,248,255,.28)'};left:${(opts.x ?? (horizontal ? -.1 : Math.random() * .84)) * 100}%;top:${(opts.y ?? (horizontal ? Math.random() * .85 : -.12)) * 100}%;transform:rotate(${opts.angle ?? (horizontal ? 0 : 90)}deg);`;
  arena.appendChild(el);
  const b = { el, x: opts.x ?? (horizontal ? -.1 : Math.random() * .84), y: opts.y ?? (horizontal ? Math.random() * .85 : -.12), vx: opts.vx ?? (horizontal ? 0.65 + Math.random() * .32 : (Math.random() - .5) * .1), vy: opts.vy ?? (horizontal ? (Math.random() - .5) * .12 : .72 + Math.random() * .35), horizontal, blue: !!opts.blue, life: 0, damage: 1, w: horizontal ? .09 : .035, h: horizontal ? .035 : .09 };
  if (opts.left) { b.x = -.12; b.y = Math.max(.1, Math.min(.9, soul.y + (Math.random() - .5) * .36)); b.vx = 1.05 + Math.random() * .4; b.vy = 0; }
  if (opts.right) { b.x = 1.12; b.y = Math.max(.1, Math.min(.9, soul.y + (Math.random() - .5) * .36)); b.vx = -1.05 - Math.random() * .4; b.vy = 0; }
  el.style.left = `${b.x * 100}%`; el.style.top = `${b.y * 100}%`;
  bullets.push(b);
}
function makeAttack() {
  const r = Math.random();
  if (r < .25) {
    for (let i = 0; i < 3; i++) spawnBone({ left: true, y: .18 + i * .3, blue: wave === 2 && i === 1 });
  } else if (r < .48) {
    for (let i = 0; i < 3; i++) spawnBone({ right: true, y: .12 + i * .35, blue: wave === 2 && i === 2 });
  } else if (r < .73) {
    const lane = .16 + Math.random() * .68;
    for (let i = 0; i < 4; i++) spawnBone({ x: .14 + i * .23, y: -.12, horizontal: false, angle: 90, vx: (Math.random() - .5) * .12, vy: .92 + Math.random() * .24, blue: wave === 2 && i % 2 === 0 });
    if (Math.random() > .45) showToast('BLUE BONES: STAY STILL TO DODGE');
  } else {
    for (let i = 0; i < 4; i++) spawnBone({ x: -.12, y: .12 + i * .24, horizontal: true, vx: .8 + Math.random() * .3, vy: 0, blue: wave === 2 && i % 2 === 0 });
  }
}
function endBattle(won) {
  gameOver = true; victory = won; battleHud.classList.add('over'); bullets.forEach(b => b.el.remove()); bullets = [];
  setMessage(won ? 'YOU WIN. THE BONES ARE RETIRED.' : 'YOUR SOUL GOT A LITTLE TOO CLOSE.');
  document.querySelector('#restartButton').textContent = won ? 'PLAY AGAIN' : 'RETRY ENCOUNTER';
  showToast(won ? 'SPARED… THIS TIME.' : 'THE ENCOUNTER ENDS HERE.'); beep(won ? 720 : 130, .38, won ? 'triangle' : 'sawtooth', .045);
}
function damagePlayer() {
  if (invulnerable > 0 || gameOver) return;
  playerHp = Math.max(0, playerHp - 1); invulnerable = 1.05; soulEl.classList.remove('hurt'); void soulEl.offsetWidth; soulEl.classList.add('hurt'); document.querySelector('#screenFlash').classList.remove('hit'); void document.querySelector('#screenFlash').offsetWidth; document.querySelector('#screenFlash').classList.add('hit'); updateBars(); beep(180, .1, 'square', .04);
  if (playerHp <= 0) endBattle(false);
}
function advanceWave() {
  waveElapsed = 0; wave++;
  if (wave > 2) { bossHp = 0; updateBars(); endBattle(true); return; }
  bossHp = Math.max(0, bossHp - 35); updateBars();
  setMessage(wave === 2 ? 'OKAY. NOW THE BLUE ONES HURT.' : 'THAT WASN’T EVEN MY FINAL FORM.');
  showToast('WAVE 02 — KEEP MOVING'); beep(620, .15, 'triangle', .05);
  // Brief breathing room between the two patterns.
  bullets.forEach(b => b.el.remove()); bullets = []; spawnTimer = 1.05;
}
function setSoulFromPointer(event) {
  const r = arena.getBoundingClientRect(); soul.x = Math.max(.045, Math.min(.955, (event.clientX - r.left) / r.width)); soul.y = Math.max(.07, Math.min(.93, (event.clientY - r.top) / r.height)); soul.vx = 0; soul.vy = 0; updateSoul();
}
let dragging = false;
arena.addEventListener('pointerdown', e => { if (!battleMode || gameOver) return; dragging = true; arena.setPointerCapture(e.pointerId); setSoulFromPointer(e); });
arena.addEventListener('pointermove', e => { if (dragging) setSoulFromPointer(e); });
arena.addEventListener('pointerup', () => { dragging = false; });
arena.addEventListener('pointercancel', () => { dragging = false; });
addEventListener('keydown', e => { const key = e.key.toLowerCase(); if (['arrowup','arrowdown','arrowleft','arrowright','w','a','s','d',' '].includes(key)) e.preventDefault(); keys.add(key); });
addEventListener('keyup', e => keys.delete(e.key.toLowerCase()));
document.querySelector('#restartButton').addEventListener('click', startBattle);
document.querySelectorAll('.action-button').forEach(button => button.addEventListener('click', () => {
  if (!battleMode || gameOver) return;
  document.querySelectorAll('.action-button').forEach(b => b.classList.remove('active')); button.classList.add('active');
  const action = button.dataset.action;
  if (action === 'FIGHT') { bossHp = Math.max(0, bossHp - 12); updateBars(); setMessage('YOU SWING. SANS DOESN’T LOOK IMPRESSED.'); showToast('A good hit!'); beep(260, .09, 'square', .035); if (bossHp <= 0) endBattle(true); }
  if (action === 'ACT') { setMessage('YOU TELL SANS A KNOCK-KNOCK JOKE.'); showToast('SANS: “WHO’S THERE?”'); beep(540, .12, 'triangle', .035); }
  if (action === 'ITEM') { if (playerHp < 20) { playerHp = Math.min(20, playerHp + 5); updateBars(); setMessage('YOU ATE A NICE CREAM. +5 HP'); showToast('HP restored. NICE!'); beep(720, .12, 'sine', .035); } else { setMessage('YOUR HP IS ALREADY FULL.'); showToast('Save that treat for later.'); } }
  if (action === 'MERCY') { if (bossHp <= 30) endBattle(true); else { setMessage('SANS ISN’T READY TO BE SPARED.'); showToast('WEAR HIM DOWN FIRST.'); } }
}));
document.querySelector('#soundToggle').addEventListener('click', () => {
  const toggle = document.querySelector('#soundToggle');
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  toggle.classList.toggle('on'); document.querySelector('#soundLabel').textContent = toggle.classList.contains('on') ? 'SOUND ON' : 'SOUND OFF';
  if (!toggle.classList.contains('on')) { audioCtx.suspend(); } else beep(440, .12, 'sine', .03);
});
document.querySelector('#soundToggle').addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') document.querySelector('#soundToggle').click(); });

function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), .04), now = performance.now(), elapsed = (now - introStart) / 1000;
  drawFlames(dt);
  stars.rotation.z = Math.sin(now * .00004) * .018;
  const appear = battleMode ? 1 : THREE.MathUtils.smoothstep(elapsed, 2.7, 4.4);
  if (!battleMode) {
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
  } else {
    sans.position.set(0, 3.15 + Math.sin(now * .0014) * .06, 0); sans.scale.setScalar(.78);
    head.rotation.x = Math.sin(now * .0014) * .025;
    sans.rotation.y = Math.sin(now * .00055) * .045;
    if (!gameOver) updateBattle(dt);
  }
  const t = now * .001;
  motes.children.forEach((m, i) => { const d = m.userData; m.position.set(sans.position.x + Math.cos(t * d.speed + d.phase) * d.radius, sans.position.y + Math.sin(t * d.speed * 1.2 + d.phase) * d.radius * .7, .4 + Math.sin(t + i) * .4); });
  aura.material.opacity = .12 + (Math.sin(now * .004) + 1) * .08;
  eyeLight.intensity = 1.8 + (Math.sin(now * .005) + 1) * 1.5;
  renderer.render(scene, camera);
}
function updateBattle(dt) {
  globalBattleElapsed += dt; waveElapsed += dt; invulnerable = Math.max(0, invulnerable - dt);
  soulEl.style.opacity = invulnerable > 0 && Math.floor(globalBattleElapsed * 13) % 2 === 0 ? '.35' : '1';
  if (!dragging) {
    const ax = (keys.has('arrowright') || keys.has('d') ? 1 : 0) - (keys.has('arrowleft') || keys.has('a') ? 1 : 0);
    const ay = (keys.has('arrowdown') || keys.has('s') ? 1 : 0) - (keys.has('arrowup') || keys.has('w') ? 1 : 0);
    soul.vx = THREE.MathUtils.damp(soul.vx, ax * .86, 13, dt); soul.vy = THREE.MathUtils.damp(soul.vy, ay * .86, 13, dt);
    soul.x = Math.max(.045, Math.min(.955, soul.x + soul.vx * dt)); soul.y = Math.max(.07, Math.min(.93, soul.y + soul.vy * dt)); updateSoul();
  }
  spawnTimer -= dt;
  if (spawnTimer <= 0) { makeAttack(); spawnTimer = wave === 1 ? .54 : .4 + Math.random() * .14; }
  const r = arena.getBoundingClientRect(), soulX = soul.x * r.width, soulY = soul.y * r.height;
  bullets = bullets.filter(b => {
    b.life += dt; b.x += b.vx * dt; b.y += b.vy * dt;
    b.el.style.left = `${b.x * 100}%`; b.el.style.top = `${b.y * 100}%`;
    const dx = (b.x * r.width - soulX) / r.width, dy = (b.y * r.height - soulY) / r.height;
    const distance = Math.hypot(dx, dy);
    // Blue bones only hurt a moving soul; white bones only hurt a still soul.
    const moving = Math.hypot(soul.vx, soul.vy) > .13;
    if (distance < .067 && (b.blue ? moving : !b.blue)) damagePlayer();
    if (b.life > 5 || b.x < -.25 || b.x > 1.25 || b.y < -.25 || b.y > 1.25) { b.el.remove(); return false; }
    return true;
  });
  const remain = Math.max(0, 18 - waveElapsed);
  document.querySelector('#turnClock').textContent = `00:${String(Math.ceil(remain)).padStart(2, '0')}`;
  if (waveElapsed >= 18) advanceWave();
}

animate();
