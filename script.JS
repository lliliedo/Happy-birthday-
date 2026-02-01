// Build 19 candles on the cake, and toggle flames on "Blow".
// Also add soft pastel confetti (no dark colors).

const candleGroup = document.getElementById("candles");
const cakeArea = document.getElementById("cakeArea");
const noteModal = document.getElementById("noteModal");
const closeModalBtn = document.getElementById("closeModalBtn");

function openModal(){
  noteModal.classList.add("show");
  noteModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden"; // يمنع سحب الخلفية بالجوال
}

function closeModal(){
  noteModal.classList.remove("show");
  noteModal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

closeModalBtn.addEventListener("click", closeModal);

// (اختياري) يقفل إذا ضغطتي على الخلفية خارج الكارد
noteModal.addEventListener("click", (e) => {
  if (e.target === noteModal) closeModal();
});


let isBlown = false;

// ===== Make 19 candles (SVG) =====
function makeCandle(x, y, i){
  // each candle is a <g> with rect + stripe + wick + flame
  const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
  g.setAttribute("class", "candle");
  g.setAttribute("transform", `translate(${x}, ${y})`);

  const body = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  body.setAttribute("x", "-7");
  body.setAttribute("y", "-40");
  body.setAttribute("width", "14");
  body.setAttribute("height", "40");
  body.setAttribute("rx", "6");
  body.setAttribute("class", "candle-body");

  const stripe = document.createElementNS("http://www.w3.org/2000/svg", "path");
  stripe.setAttribute("d", "M-5 -32 L5 -26 M-5 -18 L5 -12 M-5 -4 L5 2");
  stripe.setAttribute("class", "candle-stripe");

  const wick = document.createElementNS("http://www.w3.org/2000/svg", "path");
  wick.setAttribute("d", "M0 -46 L0 -40");
  wick.setAttribute("class", "wick");

  const flame = document.createElementNS("http://www.w3.org/2000/svg", "g");
  flame.setAttribute("class", "flame");
  flame.setAttribute("transform", "translate(0,-56)");

  const outer = document.createElementNS("http://www.w3.org/2000/svg", "path");
  outer.setAttribute("d", "M0 0 C10 10 6 24 0 30 C-6 24 -10 10 0 0 Z");
  outer.setAttribute("class", "flameOuter");

  const core = document.createElementNS("http://www.w3.org/2000/svg", "path");
  core.setAttribute("d", "M0 6 C6 12 4 20 0 24 C-4 20 -6 12 0 6 Z");
  core.setAttribute("class", "flameCore");

  flame.appendChild(outer);
  flame.appendChild(core);

  // slight staggered rotation for cuteness
  const rot = (i % 2 === 0) ? -2 : 2;
  g.setAttribute("transform", `translate(${x}, ${y}) rotate(${rot})`);

  g.appendChild(body);
  g.appendChild(stripe);
  g.appendChild(wick);
  g.appendChild(flame);

  return g;
}

function renderCandles(){
  candleGroup.innerHTML = "";

  // Place candles in a gentle arc on top of cake
  // Cake top area approx: x 160..360 and y ~170
  const startX = 165;
  const endX = 355;
  const count = 19;
  for (let i = 0; i < count; i++){
    const t = i / (count - 1);
    const x = startX + (endX - startX) * t;
    // arc: higher middle, lower sides
    const y = 170 + Math.sin((t * Math.PI)) * -10;
    const c = makeCandle(x, y, i);
    candleGroup.appendChild(c);
  }
}

renderCandles();

// ===== Blow / Reset =====
function setBlown(state){
  isBlown = state;
  cakeArea.classList.toggle("off", isBlown);

  if (isBlown){
    burstConfetti();
    floatBalloons();

    // ⏳ ننتظر شوي قبل ما تطلع الرسالة
    setTimeout(() => {
      openModal();
    }, 900); // غيري الرقم لو تبغين (1000 = ثانية)
    
  } else {
    closeModal();
  }
}



blowBtn.addEventListener("click", () => setBlown(true));
resetBtn.addEventListener("click", () => setBlown(false));

window.addEventListener("keydown", (e) => {
  if (e.code === "Space"){
    e.preventDefault();
    setBlown(true);
  }
});

// ===== Confetti (soft, light) =====
const canvas = document.getElementById("fx");
const ctx = canvas.getContext("2d");
let W, H;
let pieces = [];
let animating = false;

function resize(){
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
window.addEventListener("resize", resize);
resize();

function burstConfetti(){
  const n = 170;
  pieces = [];
  for (let i = 0; i < n; i++){
    pieces.push({
      x: Math.random() * W,
      y: -20,
      vx: (Math.random() - 0.5) * 2.6,
      vy: 2 + Math.random() * 3.6,
      r: 2 + Math.random() * 5,
      a: Math.random() * Math.PI * 2,
      va: (Math.random() - 0.5) * 0.22,
      life: 170 + Math.random() * 90,
      // pastel palette
      c: pastelColor()
    });
  }
  animating = true;
  requestAnimationFrame(tick);
}

function pastelColor(){
  const colors = [
    "rgba(255,118,182,.65)",
    "rgba(205,189,255,.65)",
    "rgba(169,221,255,.65)",
    "rgba(255,180,215,.60)",
    "rgba(255,230,240,.80)"
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

function tick(){
  if (!animating) return;
  ctx.clearRect(0,0,W,H);

  pieces = pieces.filter(p => p.life > 0);

  for (const p of pieces){
    p.life--;
    p.x += p.vx;
    p.y += p.vy;
    p.a += p.va;
    p.vy += 0.018;

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.a);
    ctx.globalAlpha = Math.max(0, Math.min(1, p.life / 210));
    ctx.fillStyle = p.c;

    // soft rounded confetti
    roundRect(ctx, -p.r, -p.r, p.r*2.2, p.r*1.6, 3);
    ctx.fill();
    ctx.restore();
  }

  if (!pieces.length){
    animating = false;
    ctx.clearRect(0,0,W,H);
    return;
  }
  requestAnimationFrame(tick);
}

function roundRect(ctx, x, y, w, h, r){
  ctx.beginPath();
  ctx.moveTo(x+r, y);
  ctx.arcTo(x+w, y, x+w, y+h, r);
  ctx.arcTo(x+w, y+h, x, y+h, r);
  ctx.arcTo(x, y+h, x, y, r);
  ctx.arcTo(x, y, x+w, y, r);
  ctx.closePath();
}

// ===== Balloons (light DOM elements) =====
let balloons = [];

function floatBalloons(){
  // remove old
  for (const b of balloons) b.remove();
  balloons = [];

  const count = 6;
  for (let i=0; i<count; i++){
    const b = document.createElement("div");
    b.className = "balloon";
    b.style.left = `${10 + Math.random()*80}%`;
    b.style.animationDuration = `${6 + Math.random()*3}s`;
    b.style.opacity = `${0.85}`;
    b.style.background = pastelBalloon();
    document.body.appendChild(b);
    balloons.push(b);

    // auto remove
    setTimeout(() => b.remove(), 7000);
  }
}

function pastelBalloon(){
  const colors = [
    "linear-gradient(135deg, rgba(255,118,182,.55), rgba(255,255,255,.75))",
    "linear-gradient(135deg, rgba(205,189,255,.55), rgba(255,255,255,.75))",
    "linear-gradient(135deg, rgba(169,221,255,.55), rgba(255,255,255,.75))"
  ];
  return colors[Math.floor(Math.random()*colors.length)];
}

// Inject balloon CSS once (keeps files simple without extra CSS blocks)
const style = document.createElement("style");
style.textContent = `
  .balloon{
    position: fixed;
    bottom: -120px;
    width: 64px;
    height: 80px;
    border-radius: 50% 50% 45% 45%;
    z-index: 3;
    filter: blur(.1px);
    box-shadow: 0 18px 30px rgba(140,110,160,.14);
    animation: floatUp ease-in forwards;
  }
  .balloon::after{
    content:"";
    position:absolute;
    left: 50%;
    top: 78px;
    width: 2px;
    height: 70px;
    background: rgba(160,150,190,.35);
    transform: translateX(-50%);
  }
  @keyframes floatUp{
    to { transform: translateY(-120vh); }
  }
`;
document.head.appendChild(style);
