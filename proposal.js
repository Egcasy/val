// --- Audio Sounds (Base64) ---
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
    } else if (type === 'error') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.linearRampToValueAtTime(100, now + 0.2);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
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
    setTimeout(() => heart.remove(), 5000);
}
setInterval(createHeart, 300);

// --- Core Logic ---
const params = new URLSearchParams(window.location.search);
const sender = params.get('from');
const recipient = params.get('to');
const theme = params.get('theme') || 'classic';
const note = params.get('note');
const reasons = params.get('reasons') ? params.get('reasons').split('|') : [];
const timelineEvents = params.get('timeline') ? params.get('timeline').split('|') : []; // Date:Event|Date:Event
const startDateParam = params.get('startDate');
const unlockTimeParam = params.get('unlock');
const soundEnabled = params.get('sound') === 'true';
const quizQ = params.get('quizQ');
const quizA = params.get('quizA');
const musicId = params.get('music');
const webhookUrl = params.get('webhook');
const expiryTimeParam = params.get('expiry');
const oneTimeParam = params.get('oneTime') === 'true';
const customYesText = params.get('yesText');
const customNoText = params.get('noText');
const customSuccessMsg = params.get('successMsg');
const customPrimary = params.get('cp');
const customSecondary = params.get('cs');
const customGradient1 = params.get('cg1');
const customGradient2 = params.get('cg2');


// Security: Sanitize user inputs to prevent XSS
function sanitize(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// Webhook Sender
function sendWebhook(message) {
    if (!webhookUrl) return;

    // Payload designed to be compatible with Discord, Formspree, and ntfy.sh
    const payload = {
        message: message, // Flat field for Formspree/ntfy
        sender: sender,   // Explicit field
        recipient: recipient, // Explicit field
        content: message, // For Discord
        username: "Valentine's Cupid 💘",
        embeds: [{
            title: "New Response! 💌",
            description: message,
            color: 16738740 // Pinkish
        }]
    };

    fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    }).catch(err => console.error("Webhook Error:", err));
}

// Apply Theme
document.body.className = theme;

// Apply custom theme colors if theme is 'custom'
if (theme === 'custom' && customPrimary) {
    document.documentElement.style.setProperty('--primary-color', customPrimary);
    document.documentElement.style.setProperty('--secondary-color', customSecondary || customPrimary);
    if (customGradient1 && customGradient2) {
        const gradient = `linear-gradient(135deg, ${customGradient1} 0%, ${customGradient2} 100%)`;
        document.documentElement.style.setProperty('--bg-gradient', gradient);
    }
    document.documentElement.style.setProperty('--cursor-color', customPrimary);
}

const originalTitle = `For ${recipient} ❤️`;
document.title = originalTitle;

document.addEventListener('visibilitychange', () => {
    document.title = document.hidden ? "Miss you already! 💔" : originalTitle;
});

// DOM Elements
const lockScreen = document.getElementById('lockScreen');
const unlockTimeDisplay = document.getElementById('unlockTimeDisplay');
const countdownTimer = document.getElementById('countdownTimer');
const musicContainer = document.getElementById('musicContainer');
const musicToggle = document.getElementById('musicToggle');
const quizContainer = document.getElementById('quizContainer');
const quizQuestionDisplay = document.getElementById('quizQuestionDisplay');
const quizInput = document.getElementById('quizInput');
const quizSubmitBtn = document.getElementById('quizSubmitBtn');
const quizError = document.getElementById('quizError');
const mainContent = document.getElementById('mainContent');
const slideshowContainer = document.getElementById('slideshowContainer');
const slideshowText = document.getElementById('slideshowText');
const nextSlideBtn = document.getElementById('nextSlideBtn');
const timelineContainer = document.getElementById('timelineContainer');
const timeline = document.getElementById('timeline');
const relationshipTimer = document.getElementById('relationshipTimer');
const timerText = document.getElementById('timerText');
const mainProposalContent = document.getElementById('mainProposalContent');
const envelopeContainer = document.getElementById('envelopeContainer');
const envelope = document.getElementById('envelope');
const noteText = document.getElementById('noteText');
const stickerArea = document.getElementById('stickerArea');
const proposalText = document.getElementById('proposalText');
const successMessage = document.getElementById('successMessage');
const yesBtn = document.getElementById('yesBtn');
const noBtn = document.getElementById('noBtn');
const dateBtns = document.querySelectorAll('.date-btn');
const dateFeedback = document.getElementById('dateFeedback');
const successMode = document.getElementById('successMode');

// Apply custom button text if provided
if (customYesText) yesBtn.textContent = customYesText;
if (customNoText) noBtn.textContent = customNoText;


// --- Lock Screen Logic ---
if (unlockTimeParam) {
    const unlockDate = new Date(unlockTimeParam);
    const now = new Date();
    if (now < unlockDate) {
        lockScreen.classList.remove('hidden');
        unlockTimeDisplay.textContent = unlockDate.toLocaleString();
        setInterval(() => {
            const now = new Date();
            const diff = unlockDate - now;
            if (diff <= 0) location.reload();
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);
            countdownTimer.textContent = `${days}d ${hours}h ${minutes}m ${seconds}s`;
        }, 1000);
    }
}

// --- Background Music Logic ---
let player;
if (musicId) {
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    window.onYouTubeIframeAPIReady = function () {
        player = new YT.Player('musicContainer', {
            height: '0', width: '0', videoId: musicId,
            playerVars: { 'autoplay': 1, 'loop': 1, 'playlist': musicId, 'controls': 0 },
            events: { 'onReady': onPlayerReady }
        });
    };
    function onPlayerReady(event) {
        musicToggle.classList.remove('hidden');
        musicToggle.addEventListener('click', () => {
            if (player.isMuted()) { player.unMute(); musicToggle.textContent = '🎵'; }
            else { player.mute(); musicToggle.textContent = '🔇'; }
        });
        event.target.playVideo();
    }
}

// --- Initialize Proposal ---
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

if (quizQ && quizA) {
    quizContainer.classList.remove('hidden');
    quizQuestionDisplay.textContent = quizQ;
    quizSubmitBtn.addEventListener('click', () => {
        if (quizInput.value.trim().toLowerCase() === quizA.toLowerCase()) {
            if (soundEnabled) playSound('success');
            quizContainer.classList.add('hidden');
            initProposalContent();
            if (player) { player.unMute(); player.playVideo(); }
        } else {
            if (soundEnabled) playSound('error');
            quizError.classList.remove('hidden');
            quizContainer.classList.add('shake');
            setTimeout(() => quizContainer.classList.remove('shake'), 500);
        }
    });
} else {
    document.body.addEventListener('click', () => {
        if (player) { player.unMute(); player.playVideo(); }
    }, { once: true });
    initProposalContent();
}

function initProposalContent() {
    mainContent.classList.remove('hidden');
    if (timelineEvents.length > 0) {
        // Show Timeline First if exists
        renderTimeline();
    } else if (reasons.length > 0) {
        startSlideshow();
    } else {
        showMainProposal();
    }
}

// --- Button Ripple Effect ---
function createRipple(event) {
    const button = event.currentTarget;
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    ripple.classList.add('ripple');

    const prevRipple = button.querySelector('.ripple');
    if (prevRipple) prevRipple.remove();

    button.appendChild(ripple);
}

// Add ripple to all buttons
document.querySelectorAll('.primary-btn, .secondary-btn, .date-btn').forEach(btn => {
    btn.addEventListener('click', createRipple);
});

// --- Timeline Logic ---
function renderTimeline() {
    timelineContainer.classList.remove('hidden');
    mainProposalContent.classList.add('hidden');

    timelineEvents.forEach((evt, index) => {
        const [date, desc] = evt.split(':');
        const item = document.createElement('div');
        item.classList.add('timeline-item');
        // Staggered entry
        item.style.animationDelay = `${0.3 + index * 0.4}s`;
        item.style.opacity = "0";
        item.innerHTML = `
            <div class="timeline-date">${sanitize(date)}</div>
            <div class="timeline-content">${sanitize(desc)}</div>
        `;
        timeline.appendChild(item);
    });

    const nextBtn = document.createElement('button');
    nextBtn.textContent = "Keep Going ❤️";
    nextBtn.className = "primary-btn fade-in-text";
    nextBtn.style.marginTop = "30px";
    nextBtn.style.animationDelay = `${timelineEvents.length * 0.4 + 0.5}s`;
    nextBtn.addEventListener('click', (e) => {
        createRipple(e);
        if (soundEnabled) playSound('pop');
        timelineContainer.classList.add('hidden');
        if (reasons.length > 0) startSlideshow();
        else showMainProposal();
    });
    timelineContainer.appendChild(nextBtn);
}

// --- Slideshow Logic ---
let currentSlide = 0;
function startSlideshow() {
    slideshowContainer.classList.remove('hidden');
    slideshowContainer.classList.add('fade-in-text');
    showSlide(0);
}
function showSlide(index) {
    if (index >= reasons.length) {
        slideshowContainer.classList.add('hidden');
        showMainProposal();
        return;
    }
    slideshowText.textContent = reasons[index];
    slideshowText.classList.remove('fade-in-text');
    void slideshowText.offsetWidth; // Trigger reflow
    slideshowText.classList.add('fade-in-text');
}
nextSlideBtn.addEventListener('click', (e) => {
    createRipple(e);
    if (soundEnabled) playSound('pop');
    currentSlide++;
    setTimeout(() => showSlide(currentSlide), 200);
});

// --- Main Proposal Logic ---
function showMainProposal() {
    mainProposalContent.classList.remove('hidden');

    // Stickers
    initStickers();

    if (note) {
        envelopeContainer.classList.remove('hidden');
        noteText.textContent = note;
        envelope.addEventListener('click', () => {
            if (!envelope.classList.contains('open')) {
                if (soundEnabled) playSound('pop');
                envelope.classList.add('open');
            }
        });
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
    setTimeout(typeWriter, 1000);
}

// --- Sticker Logic ---
function initStickers() {
    const stickers = ['🧸', '❤️', '🌹', '✨', '🎀'];
    stickers.forEach(emoji => {
        const el = document.createElement('div');
        el.textContent = emoji;
        el.classList.add('sticker');
        el.style.left = Math.random() * 80 + 10 + '%';
        el.style.top = Math.random() * 80 + 10 + '%';
        el.onmousedown = dragMouseDown;
        stickerArea.appendChild(el);
    });
}

function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    let pos3 = e.clientX;
    let pos4 = e.clientY;
    const elmnt = e.target;

    document.onmouseup = closeDragElement;
    document.onmousemove = elementDrag;

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        let pos1 = pos3 - e.clientX;
        let pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
        elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
    }
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
yesBtn.addEventListener('click', (e) => {
    createRipple(e);
    if (soundEnabled) playSound('success');

    // Smooth transition
    mainProposalContent.style.transition = "opacity 0.5s ease";
    mainProposalContent.style.opacity = "0";

    setTimeout(() => {
        mainProposalContent.classList.add('hidden');
        successMode.classList.remove('hidden');
        successMode.classList.add('fade-in-text');

        if (customSuccessMsg) {
            successMessage.textContent = customSuccessMsg;
        } else if (recipient) {
            successMessage.textContent = `I knew you'd say Yes! You've made ${sender} the happiest person! ❤️`;
        }

        sendWebhook(`🎉 **SHE SAID YES!** 🎉\nRecipient: ${recipient}\nSender: ${sender}`);

        var duration = 5 * 1000;
        var animationEnd = Date.now() + duration;

        var shapes = ['circle', 'square'];
        if (theme === 'midnight') shapes = ['star'];
        var interval = setInterval(function () {
            var timeLeft = animationEnd - Date.now();
            if (timeLeft <= 0) return clearInterval(interval);
            var particleCount = 50 * (timeLeft / duration);
            confetti({ particleCount: particleCount, startVelocity: 30, spread: 360, origin: { x: Math.random(), y: Math.random() - 0.2 }, shapes: shapes });
        }, 250);
        document.getElementById('datePlanner').classList.remove('hidden');
    }, 500);
});

dateBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        createRipple(e);
        if (soundEnabled) playSound('pop');
        const choice = e.target.getAttribute('data-date');
        dateFeedback.classList.remove('hidden');
        dateFeedback.classList.add('fade-in-text');
        dateFeedback.innerHTML = `🌟 <strong>Perfect Choice!</strong> 🌟<br>Take a screenshot and share it with ${sender}!<br>Plan: ${choice}`;
        dateBtns.forEach(b => {
            b.disabled = true;
            b.style.opacity = "0.5";
        });

        sendWebhook(`📅 **Date Idea Selected:** ${choice}\nBy: ${recipient}`);

        confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 }, colors: ['#ff4d6d', '#ff0054', '#ffffff'] });
    });
});
