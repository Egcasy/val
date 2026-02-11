// --- Floating Hearts Background ---
function createHeart() {
    const heart = document.createElement('div');
    heart.classList.add('heart');
    heart.innerHTML = '❤️';
    heart.style.left = Math.random() * 100 + 'vw';
    heart.style.animationDuration = Math.random() * 2 + 3 + 's';
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

// DOM Elements
const creatorMode = document.getElementById('creatorMode');
const proposalMode = document.getElementById('proposalMode');
const successMode = document.getElementById('successMode');
const proposalText = document.getElementById('proposalText');
const successMessage = document.getElementById('successMessage');

// Inputs
const senderInput = document.getElementById('senderName');
const recipientInput = document.getElementById('recipientName');
const createBtn = document.getElementById('createBtn');
const linkOutput = document.getElementById('linkOutput');
const generatedLink = document.getElementById('generatedLink');
const copyBtn = document.getElementById('copyBtn');

// Proposal Buttons
const yesBtn = document.getElementById('yesBtn');
const noBtn = document.getElementById('noBtn');

// Initialize View
if (sender && recipient) {
    // Show Proposal
    creatorMode.classList.add('hidden');
    proposalMode.classList.remove('hidden');
    document.title = `For ${recipient} ❤️`;
    proposalText.innerHTML = `Hi ${recipient},<br>Will you be my Valentine?`;
} else {
    // Show Creator
    creatorMode.classList.remove('hidden');
    proposalMode.classList.add('hidden');
}

// --- Creator Events ---
createBtn.addEventListener('click', () => {
    const sName = senderInput.value.trim();
    const rName = recipientInput.value.trim();

    if (!sName || !rName) {
        alert("Please enter both names!");
        return;
    }

    const baseUrl = window.location.origin + window.location.pathname;
    const fullUrl = `${baseUrl}?from=${encodeURIComponent(sName)}&to=${encodeURIComponent(rName)}`;
    
    generatedLink.value = fullUrl;
    linkOutput.classList.remove('hidden');
    createBtn.textContent = "Link Created! ↓";
});

copyBtn.addEventListener('click', () => {
    generatedLink.select();
    generatedLink.setSelectionRange(0, 99999); // For mobile
    navigator.clipboard.writeText(generatedLink.value);
    copyBtn.textContent = "Copied!";
    setTimeout(() => copyBtn.textContent = "Copy", 2000);
});

// --- Proposal Events ---

// Runaway No Button
const moveNoBtn = () => {
    const container = document.querySelector('.container');
    const containerRect = container.getBoundingClientRect();
    const btnRect = noBtn.getBoundingClientRect();

    // Calculate max boundaries
    const maxX = containerRect.width - btnRect.width;
    const maxY = containerRect.height - btnRect.height;

    const randomX = Math.floor(Math.random() * maxX);
    const randomY = Math.floor(Math.random() * maxY);

    noBtn.style.position = 'absolute';
    noBtn.style.left = randomX + 'px';
    noBtn.style.top = randomY + 'px';
};

noBtn.addEventListener('mouseover', moveNoBtn);
noBtn.addEventListener('touchstart', moveNoBtn); // For mobile

// Say Yes
yesBtn.addEventListener('click', () => {
    proposalMode.classList.add('hidden');
    successMode.classList.remove('hidden');
    
    if (recipient) {
        successMessage.textContent = `Yay! ${sender} will be so happy! ❤️`;
    }

    // Confetti Explosion
    var duration = 5 * 1000;
    var animationEnd = Date.now() + duration;
    var defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min, max) {
      return Math.random() * (max - min) + min;
    }

    var interval = setInterval(function() {
      var timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      var particleCount = 50 * (timeLeft / duration);
      // since particles fall down, start a bit higher than random
      confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
      confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
    }, 250);
});
