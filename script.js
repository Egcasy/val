// --- Custom Cursor ---
const cursor = document.querySelector('.custom-cursor');

document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';

    // Parallax Effect on Hearts
    const hearts = document.querySelectorAll('.heart');
    hearts.forEach(heart => {
        const speed = heart.getAttribute('data-speed') || 1;
        const x = (window.innerWidth - e.clientX * speed) / 100;
        const y = (window.innerHeight - e.clientY * speed) / 100;
        heart.style.transform = `translate(${x}px, ${y}px)`;
    });
});

document.addEventListener('mousedown', () => cursor.classList.add('click'));
document.addEventListener('mouseup', () => cursor.classList.remove('click'));

// --- Floating Hearts Background ---
function createHeart() {
    const heart = document.createElement('div');
    heart.classList.add('heart');
    heart.innerHTML = '❤️';
    heart.style.left = Math.random() * 100 + 'vw';
    heart.style.animationDuration = Math.random() * 2 + 3 + 's';
    heart.setAttribute('data-speed', Math.random() * 5 + 1); // For parallax
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
// Reasons are encoded as a single string split by "|"
const reasons = params.get('reasons') ? params.get('reasons').split('|') : [];

// Apply Theme
document.body.className = theme;

// DOM Elements
const creatorMode = document.getElementById('creatorMode');
const proposalMode = document.getElementById('proposalMode');
const successMode = document.getElementById('successMode');
const mainContainer = document.getElementById('mainContainer');

const slideshowContainer = document.getElementById('slideshowContainer');
const slideshowText = document.getElementById('slideshowText');
const nextSlideBtn = document.getElementById('nextSlideBtn');

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
const createBtn = document.getElementById('createBtn');
const linkOutput = document.getElementById('linkOutput');
const generatedLink = document.getElementById('generatedLink');
const copyBtn = document.getElementById('copyBtn');

// Proposal Buttons
const yesBtn = document.getElementById('yesBtn');
const noBtn = document.getElementById('noBtn');

// Date Planner
const dateBtns = document.querySelectorAll('.date-btn');
const dateFeedback = document.getElementById('dateFeedback');

// Initialize View
if (sender && recipient) {
    // Show Proposal Flow
    creatorMode.classList.add('hidden');
    proposalMode.classList.remove('hidden');
    document.title = `For ${recipient} ❤️`;

    // Start with Slideshow if reasons exist
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

    // Collect non-empty reasons
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
        // End of slideshow
        slideshowContainer.classList.add('hidden');
        showMainProposal();
        return;
    }
    slideshowText.textContent = reasons[index];
}

nextSlideBtn.addEventListener('click', () => {
    currentSlide++;
    showSlide(currentSlide);
});

// --- Main Proposal Logic ---
function showMainProposal() {
    mainProposalContent.classList.remove('hidden');

    // Show Note if exists
    if (note) {
        noteContainer.classList.remove('hidden');
        noteText.textContent = note;
    }

    // Typing Effect for Question
    const question = `Hi ${recipient}, will you be my Valentine?`;
    let i = 0;
    proposalText.textContent = "";
    proposalText.classList.add('typing-cursor');

    function typeWriter() {
        if (i < question.length) {
            proposalText.textContent += question.charAt(i);
            i++;
            setTimeout(typeWriter, 50); // Typing speed
        } else {
            proposalText.classList.remove('typing-cursor');
        }
    }
    typeWriter();
}

// --- "No" Button Logic ---
const noTexts = ["Are you sure?", "Really?", "Think again!", "Last chance!", "Pretty please?", "I'll give you chocolate!", "Don't do this!", "Breaking my heart 💔"];
let noCount = 0;

const moveNoBtn = () => {
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

    // Change text randomly
    const randomText = noTexts[Math.floor(Math.random() * noTexts.length)];
    noBtn.textContent = randomText;
    noBtn.style.minWidth = "150px"; /* Ensure text fits */
};

noBtn.addEventListener('mouseover', moveNoBtn);
noBtn.addEventListener('touchstart', moveNoBtn);

// --- "Yes" Button Logic ---
yesBtn.addEventListener('click', () => {
    proposalMode.classList.add('hidden');
    successMode.classList.remove('hidden');

    if (recipient) {
        successMessage.textContent = `Yay! ${sender} will be so happy! ❤️`;
    }

    // Confetti - Emoji Rain
    var duration = 5 * 1000;
    var animationEnd = Date.now() + duration;

    // Emoji mapping based on theme could be added, but standard hearts works well
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

    // Show date planner
    document.getElementById('datePlanner').classList.remove('hidden');
});

// --- Date Planner ---
dateBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        const choice = e.target.getAttribute('data-date');
        dateFeedback.classList.remove('hidden');
        dateFeedback.textContent = `Great choice! Take a screenshot and send it to ${sender}: ${choice}`;

        // Disable buttons
        dateBtns.forEach(b => b.disabled = true);

        // More confetti just for fun
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });
    });
});
