const canvas = document.getElementById('dashCanvas');
const ctx = canvas.getContext('2d');
const startScreen = document.getElementById('start-screen');
const finalButtons = document.getElementById('final-buttons');

const GROUND_Y = 250;

let player = {
    x: 150,
    y: GROUND_Y - 40,
    size: 40,
    ySpeed: 0,
    gravity: 0.8,
    jumpStrength: -14, // DIUBAH: Dari -13 ke -14 (Lompatan jadi lebih tinggi & ringan)
    isGrounded: false,
    angle: 0,
    rotationSpeed: 0
};

// DATA BACKGROUND (100% PUJIAN)
const backgroundScenes = [
    {
        x: 600,
        imgUrl: "foto1.jpeg", 
        text: "✨ bebe sayang awal kmu kirim foto ini aku sempat heran knapa ada orang yang makin hari makin cantik.",
        imgObj: null, loaded: false
    },
    {
        x: 1600,
        imgUrl: "foto2.jpeg", 
        text: "🌸 bebe kmu di foto ini keliatan bangettt berbeda dri orang lainn. ceweku emang paling gacoorrrrr.",
        imgObj: null, loaded: false
    },
    {
        x: 2600,
        imgUrl: "foto3.jpeg", 
        text: "💖 Bebeee kmu di foto cantik dan menawan ini cantik bangett kamu kangen kan?. liat depan bee, aku udah siap peluk kamu!",
        imgObj: null, loaded: false
    }
];

// Pre-load gambar background
backgroundScenes.forEach(scene => {
    const img = new Image(); img.src = scene.imgUrl;
    img.onload = () => { scene.imgObj = img; scene.loaded = true; };
});

const levelPattern = [0, 1, 0, 0, 1, 0, 2, 0, 1, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9];
let obstacles = [];
let gameSpeed = 5.5;
let gameState = "MENU"; 
let finalMessage = "";
let subMessage = "";

function generateLevel() {
    obstacles = [];
    let startX = 700;
    levelPattern.forEach((type) => {
        // DIUBAH: Lebar duri dikecilkan jadi 22, tinggi dipangkas jadi 26 agar mudah dilewati
        if (type === 1) { obstacles.push({ type: 'spike', x: startX, width: 22, height: 26 }); }
        else if (type === 2) { 
            obstacles.push({ type: 'spike', x: startX, width: 22, height: 26 });
            obstacles.push({ type: 'spike', x: startX + 22, width: 22, height: 26 });
        }
        else if (type === 9) { 
            obstacles.push({ type: 'you', x: startX + 400, width: 40, height: 50 }); 
        }
        startX += 260;
    });
    backgroundScenes[0].x = 600; backgroundScenes[1].x = 1600; backgroundScenes[2].x = 2600;
}

function startGame() {
    startScreen.style.display = "none";
    restartGame();
}

function handleJump() {
    if (gameState === "PLAYING" && player.isGrounded) {
        player.ySpeed = player.jumpStrength; player.isGrounded = false; player.rotationSpeed = 6;
    } else if (gameState === "GAMEOVER") {
        restartGame();
    }
}

window.addEventListener('keydown', (e) => { if (e.code === 'Space') handleJump(); });
canvas.addEventListener('touchstart', (e) => { e.preventDefault(); handleJump(); }); 
canvas.addEventListener('mousedown', handleJump);

function update() {
    if (gameState !== "PLAYING") return;

    player.ySpeed += player.gravity; player.y += player.ySpeed;
    if (player.y >= GROUND_Y - player.size) {
        player.y = GROUND_Y - player.size; player.ySpeed = 0; player.isGrounded = true;
        player.rotationSpeed = 0; player.angle = Math.round(player.angle / 90) * 90;
    } else { player.angle += player.rotationSpeed; }

    backgroundScenes.forEach(scene => { scene.x -= gameSpeed * 0.5; });

    obstacles.forEach((obs) => {
        obs.x -= gameSpeed;
        if (obs.type === 'spike') {
            if (player.x < obs.x + obs.width && player.x + player.size > obs.x && player.y < GROUND_Y && player.y + player.size > GROUND_Y - obs.height) {
                gameState = "GAMEOVER";
            }
        }
        if (obs.type === 'you' && player.x + player.size >= obs.x) {
            gameState = "WIN";
            document.getElementById('btn-reject').style.display = "inline-block"; 
            finalButtons.style.display = "flex"; 
        }
    });
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Gambar Background (Foto Gede & Running Text)
    backgroundScenes.forEach(scene => {
        if (scene.x > -400 && scene.x < canvas.width + 200) {
            if (scene.loaded && scene.imgObj) {
                ctx.save(); ctx.globalAlpha = 0.65;
                ctx.fillStyle = '#fff'; 
                ctx.fillRect(scene.x - 5, 10, 190, 145); 
                ctx.drawImage(scene.imgObj, scene.x, 15, 180, 135); 
                ctx.restore();
            }
            ctx.fillStyle = 'rgba(254, 121, 168, 0.9)';
            ctx.font = 'italic bold 14px Arial';
            ctx.fillText(scene.text, scene.x, 175);
        }
    });

    // 2. Lantai Neon
    ctx.strokeStyle = '#fd79a8'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(0, GROUND_Y); ctx.lineTo(canvas.width, GROUND_Y); ctx.stroke();

    // 3. Rintangan & Karakter Kamu
    obstacles.forEach((obs) => {
        if (obs.type === 'spike') {
            ctx.fillStyle = '#ff7675'; ctx.beginPath(); 
            ctx.moveTo(obs.x, GROUND_Y);
            ctx.lineTo(obs.x + obs.width / 2, GROUND_Y - obs.height);
            ctx.lineTo(obs.x + obs.width, GROUND_Y);
            ctx.closePath(); ctx.fill();
        } else if (obs.type === 'you') {
            ctx.save(); ctx.fillStyle = '#74b9ff'; ctx.fillRect(obs.x, GROUND_Y - obs.height, obs.width, obs.height);
            ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.strokeRect(obs.x, GROUND_Y - obs.height, obs.width, obs.height);
            ctx.fillStyle = '#000'; ctx.fillRect(obs.x + 8, GROUND_Y - obs.height + 12, 6, 6); ctx.fillRect(obs.x + 24, GROUND_Y - obs.height + 12, 6, 6);
            ctx.beginPath(); ctx.arc(obs.x + 20, GROUND_Y - obs.height + 26, 8, 0, Math.PI); ctx.stroke();
            ctx.strokeStyle = '#74b9ff'; ctx.lineWidth = 4;
            ctx.beginPath(); ctx.moveTo(obs.x, GROUND_Y - obs.height + 25); ctx.lineTo(obs.x - 12, GROUND_Y - obs.height + 15); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(obs.x + obs.width, GROUND_Y - obs.height + 25); ctx.lineTo(obs.x + obs.width + 12, GROUND_Y - obs.height + 15); ctx.stroke();
            ctx.fillStyle = '#74b9ff'; ctx.font = 'bold 12px Arial'; ctx.fillText('Peluk! 🤗', obs.x - 5, GROUND_Y - obs.height - 10); ctx.restore();
        }
    });

    // 4. Karakter Dia
    ctx.save(); ctx.translate(player.x + player.size / 2, player.y + player.size / 2); ctx.rotate((player.angle * Math.PI) / 180);
    ctx.fillStyle = '#ffeaa7'; ctx.fillRect(-player.size / 2, -player.size / 2, player.size, player.size);
    ctx.strokeStyle = '#000'; ctx.lineWidth = 2; ctx.strokeRect(-player.size / 2, -player.size / 2, player.size, player.size);
    ctx.fillStyle = '#000'; ctx.fillRect(-12, -10, 6, 6); ctx.fillRect(6, -10, 6, 6);
    ctx.beginPath(); ctx.arc(0, 4, 5, 0, Math.PI); ctx.stroke();
    ctx.fillStyle = '#ff7675'; ctx.minusHalf = -player.size / 2; ctx.fillRect(-12, ctx.minusHalf - 6, 10, 6); ctx.fillRect(2, ctx.minusHalf - 6, 10, 6);
    ctx.restore();

    // 5. Kondisi Layar Akhir
    if (gameState === "GAMEOVER") {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)'; ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#ff7675'; ctx.font = 'bold 20px Arial'; ctx.textAlign = 'center';
        ctx.fillText('Bebe terjatuh, tapi aku masih nunggu di ujung jalan 🥺', canvas.width / 2, canvas.height / 2 - 15);
        ctx.fillStyle = '#fff'; ctx.font = '15px Arial'; ctx.fillText('Ketuk layar untuk coba lagi ❤️', canvas.width / 2, canvas.height / 2 + 20);
    } else if (gameState === "WIN") {
        ctx.fillStyle = 'rgba(11, 14, 20, 0.95)'; ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#fd79a8'; ctx.font = '50px Arial'; ctx.textAlign = 'center'; ctx.fillText('❤️ HUGGED! ❤️', canvas.width / 2, canvas.height / 2 - 60);
        ctx.fillStyle = '#fff'; ctx.font = 'bold 20px Arial';
        ctx.fillText('SELAMAT BEBEEE! Kamu berhasil sampai ke pelukanku!', canvas.width / 2, canvas.height / 2 - 10);
        ctx.font = '16px Arial'; ctx.fillStyle = '#aaa';
        ctx.fillText('Sekarang, apakah perjalanan ini cukup buat dapet maaf dari kamu? 🥺👉👈', canvas.width / 2, canvas.height / 2 + 20);
    } else if (gameState === "ANSWERED") {
        ctx.fillStyle = 'rgba(11, 14, 20, 0.95)'; ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#00ffcc'; ctx.font = 'bold 24px Arial'; ctx.textAlign = 'center';
        ctx.fillText(finalMessage, canvas.width / 2, canvas.height / 2 - 10);
        ctx.fillStyle = '#fff'; ctx.font = '16px Arial';
        ctx.fillText(subMessage, canvas.width / 2, canvas.height / 2 + 35);
    }
}

function answerMaaf(isAccepted) {
    if (isAccepted) {
        finalButtons.style.display = "none"; 
        gameState = "ANSWERED";
        finalMessage = "YEAY! MAKASIH UDAH DIMAAFIN SAYANG! 😭❤️";
        subMessage = "wofyuuu sayangku bebeeeeeee ! 🥰💖";
    } else {
        document.getElementById('btn-reject').style.display = "none";
        gameState = "WIN"; 
        ctx.fillStyle = 'rgba(11, 14, 20, 0.95)'; ctx.fillRect(0, 0, canvas.width, canvas.height);
        alert("Yahhh kok diklik sih... 😭 Plisss maafin aku dong bebe. huhuhu! 👉👈");
    }
}

function gameLoop() { update(); draw(); requestAnimationFrame(gameLoop); }
function restartGame() {
    player.y = GROUND_Y - player.size; player.ySpeed = 0; player.isGrounded = true; player.angle = 0; player.rotationSpeed = 0;
    generateLevel(); gameState = "PLAYING"; finalButtons.style.display = "none";
}

gameLoop();