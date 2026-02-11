// --- Audio Sounds (Base64) ---
// Simple synthesized beep sounds converted to base64 to avoid external dependencies
const popSound = new Audio("data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU..."); // Placeholder - will use a real simple blob generation
const tadaSound = new Audio("data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU...");

// Function to generate simple beep/pop sounds using Web Audio API instead of large base64 strings
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playSound(type) {
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    const now = audioCtx.currentTime;

    if (type === 'pop') {
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.1);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
    } else if (type === 'success') {
        // TADA chord
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C E G C
        notes.forEach((freq, i) => {
            const osc2 = audioCtx.createOscillator();
            const gain2 = audioCtx.createGain();
            osc2.connect(gain2);
            gain2.connect(audioCtx.destination);

            osc2.frequency.setValueAtTime(freq, now + i * 0.1);
            gain2.gain.setValueAtTime(0.1, now + i * 0.1);
            gain2.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.4);
            osc2.start(now + i * 0.1);
            osc2.stop(now + i * 0.1 + 0.4);
        });
    }
}

// --- Custom Cursor ---
const cursor = document.querySelector('.custom-cursor');

document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';

    const hearts = document.querySelectorAll('.heart');
    hearts.forEach(heart => {
        const speed = heart.getAttribute('data-speed') || 1;
        const x = (window.innerWidth - e.clientX * speed) / 100;
        const y = (window.innerHeight - e.clientY * speed) / 100;
        heart.style.transform = `translate(${x}px, ${y}px)`;
    });
});

document.addEventListener('mousedown', () => {
    cursor.classList.add('click');
    if (soundEnabled) playSound('pop');
});
document.addEventListener('mouseup', () => cursor.classList.remove('click'));

// --- Floating Hearts Background ---
function createHeart() {
    const heart = document.createElement('div');
    heart.classList.add('heart');
    heart.innerHTML = '❤️';
    heart.style.left = Math.random() * 100 + 'vw';
    heart.style.animationDuration = Math.random() * 2 + 3 + 's';
    heart.setAttribute('data-speed', Math.random() * 5 + 1);
    document.querySelector('.background-hearts').appendChild(heart);

    setTimeout(() => {
        heart.remove();
    }, 5000);
}

setInterval(createHeart, 300);

// --- Core Logic ---
const params = new URLSearchParams(window.location.search);
const sender = params.get('from');
const recipient = params.get('to');
const theme = params.get('theme') || 'classic';
const note = params.get('note');
const reasons = params.get('reasons') ? params.get('reasons').split('|') : [];
const startDateParam = params.get('startDate'); // YYYY-MM-DD
const unlockTimeParam = params.get('unlock'); // ISO String
const soundEnabled = params.get('sound') === 'true';

// Apply Theme
document.body.className = theme;

// DOM Elements
const creatorMode = document.getElementById('creatorMode');
const proposalMode = document.getElementById('proposalMode');
const successMode = document.getElementById('successMode');

const lockScreen = document.getElementById('lockScreen');
const unlockTimeDisplay = document.getElementById('unlockTimeDisplay');
const countdownTimer = document.getElementById('countdownTimer');

const slideshowContainer = document.getElementById('slideshowContainer');
const slideshowText = document.getElementById('slideshowText');
const nextSlideBtn = document.getElementById('nextSlideBtn');

const relationshipTimer = document.getElementById('relationshipTimer');
const timerText = document.getElementById('timerText');

const mainProposalContent = document.getElementById('mainProposalContent');
const noteContainer = document.getElementById('noteContainer');
const noteText = document.getElementById('noteText');
const proposalText = document.getElementById('proposalText');
const successMessage = document.getElementById('successMessage');

// Inputs
const senderInput = document.getElementById('senderName');
const recipientInput = document.getElementById('recipientName');
const themeSelector = document.getElementById('themeSelector');
const loveNoteInput = document.getElementById('loveNote');
const reasonInputs = document.querySelectorAll('.reason-input');
const startDateInput = document.getElementById('startDate');
const unlockInput = document.getElementById('unlockTime');
const soundCheck = document.getElementById('enableSound');
const createBtn = document.getElementById('createBtn');
const linkOutput = document.getElementById('linkOutput');
const generatedLink = document.getElementById('generatedLink');
const copyBtn = document.getElementById('copyBtn');

const yesBtn = document.getElementById('yesBtn');
const noBtn = document.getElementById('noBtn');
const dateBtns = document.querySelectorAll('.date-btn');
const dateFeedback = document.getElementById('dateFeedback');

// --- Lock Screen Logic ---
if (unlockTimeParam) {
    const unlockDate = new Date(unlockTimeParam);
    const now = new Date();

    if (now < unlockDate) {
        lockScreen.classList.remove('hidden');
        unlockTimeDisplay.textContent = unlockDate.toLocaleString();

        // Update countdown
        setInterval(() => {
            const now = new Date();
            const diff = unlockDate - now;

            if (diff <= 0) {
                location.reload(); // Reload to unlock
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            countdownTimer.textContent = `${days}d ${hours}h ${minutes}m ${seconds}s`;
        }, 1000);
    }
}

// --- Initialize View ---
if (sender && recipient) {
    // Show Proposal Flow
    creatorMode.classList.add('hidden');
    proposalMode.classList.remove('hidden');
    document.title = `For ${recipient} ❤️`;

    // Initialize Relationship Timer
    if (startDateParam) {
        relationshipTimer.classList.remove('hidden');
        const start = new Date(startDateParam);

        setInterval(() => {
            const now = new Date();
            const diff = now - start;

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const years = Math.floor(days / 365);
            const remainingDays = days % 365;

            timerText.textContent = `${years} Years, ${remainingDays} Days`;
        }, 1000);
    }

    if (reasons.length > 0) {
        startSlideshow();
    } else {
        showMainProposal();
    }

} else {
    // Show Creator
    creatorMode.classList.remove('hidden');
    proposalMode.classList.add('hidden');
}

// --- Creator Events ---
createBtn.addEventListener('click', () => {
    const sName = senderInput.value.trim();
    const rName = recipientInput.value.trim();
    const sTheme = themeSelector.value;
    const sNote = loveNoteInput.value.trim();
    const sStart = startDateInput.value;
    const sUnlock = unlockInput.value;
    const sSound = soundCheck.checked;

    const sReasons = Array.from(reasonInputs)
        .map(input => input.value.trim())
        .filter(val => val !== "")
        .join('|');

    if (!sName || !rName) {
        alert("Please enter both names!");
        return;
    }

    const baseUrl = window.location.origin + window.location.pathname;
    let fullUrl = `${baseUrl}?from=${encodeURIComponent(sName)}&to=${encodeURIComponent(rName)}&theme=${sTheme}`;

    if (sNote) fullUrl += `&note=${encodeURIComponent(sNote)}`;
    if (sReasons) fullUrl += `&reasons=${encodeURIComponent(sReasons)}`;
    if (sStart) fullUrl += `&startDate=${encodeURIComponent(sStart)}`;
    if (sUnlock) fullUrl += `&unlock=${encodeURIComponent(sUnlock)}`;
    if (sSound) fullUrl += `&sound=true`;

    generatedLink.value = fullUrl;
    linkOutput.classList.remove('hidden');
    createBtn.textContent = "Link Created! ↓";
});

copyBtn.addEventListener('click', () => {
    generatedLink.select();
    generatedLink.setSelectionRange(0, 99999);
    navigator.clipboard.writeText(generatedLink.value);
    copyBtn.textContent = "Copied!";
    setTimeout(() => copyBtn.textContent = "Copy", 2000);
});

// --- Slideshow Logic ---
let currentSlide = 0;

function startSlideshow() {
    slideshowContainer.classList.remove('hidden');
    mainProposalContent.classList.add('hidden');
    showSlide(0);
}

function showSlide(index) {
    if (index >= reasons.length) {
        slideshowContainer.classList.add('hidden');
        showMainProposal();
        return;
    }
    slideshowText.textContent = reasons[index];
}

nextSlideBtn.addEventListener('click', () => {
    if (soundEnabled) playSound('pop');
    currentSlide++;
    showSlide(currentSlide);
});

// --- Main Proposal Logic ---
function showMainProposal() {
    mainProposalContent.classList.remove('hidden');

    if (note) {
        noteContainer.classList.remove('hidden');
        noteText.textContent = note;
    }

    const question = `Hi ${recipient}, will you be my Valentine?`;
    let i = 0;
    proposalText.textContent = "";
    proposalText.classList.add('typing-cursor');

    function typeWriter() {
        if (i < question.length) {
            proposalText.textContent += question.charAt(i);
            i++;
            setTimeout(typeWriter, 50);
        } else {
            proposalText.classList.remove('typing-cursor');
        }
    }
    typeWriter();
}

// --- No Button ---
const noTexts = ["Are you sure?", "Really?", "Think again!", "Last chance!", "Pretty please!", "I'll give you chocolate!", "Don't do this!", "Breaking my heart 💔"];

const moveNoBtn = () => {
    if (soundEnabled) playSound('pop');
    const container = document.querySelector('.container');
    const containerRect = container.getBoundingClientRect();
    const btnRect = noBtn.getBoundingClientRect();

    const maxX = containerRect.width - btnRect.width;
    const maxY = containerRect.height - btnRect.height;

    const randomX = Math.floor(Math.random() * maxX);
    const randomY = Math.floor(Math.random() * maxY);

    noBtn.style.position = 'absolute';
    noBtn.style.left = randomX + 'px';
    noBtn.style.top = randomY + 'px';

    const randomText = noTexts[Math.floor(Math.random() * noTexts.length)];
    noBtn.textContent = randomText;
    noBtn.style.minWidth = "150px";
};

noBtn.addEventListener('mouseover', moveNoBtn);
noBtn.addEventListener('touchstart', moveNoBtn);

// --- Yes Button ---
yesBtn.addEventListener('click', () => {
    if (soundEnabled) playSound('success');
    proposalMode.classList.add('hidden');
    successMode.classList.remove('hidden');

    if (recipient) {
        successMessage.textContent = `Yay! ${sender} will be so happy! ❤️`;
    }

    var duration = 5 * 1000;
    var animationEnd = Date.now() + duration;

    var shapes = ['circle', 'square'];
    if (theme === 'midnight') shapes = ['star'];

    var interval = setInterval(function () {
        var timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
            return clearInterval(interval);
        }

        var particleCount = 50 * (timeLeft / duration);

        confetti({
            particleCount: particleCount,
            startVelocity: 30,
            spread: 360,
            origin: { x: Math.random(), y: Math.random() - 0.2 },
            shapes: shapes
        });
    }, 250);

    document.getElementById('datePlanner').classList.remove('hidden');
});

// --- Date Planner ---
dateBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        if (soundEnabled) playSound('pop');
        const choice = e.target.getAttribute('data-date');
        dateFeedback.classList.remove('hidden');
        dateFeedback.textContent = `Great choice! Take a screenshot and send it to ${sender}: ${choice}`;

        dateBtns.forEach(b => b.disabled = true);

        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });
    });
});
