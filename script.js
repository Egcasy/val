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
    heart.setAttribute('data-speed', Math.random() * 5 + 1);
    document.querySelector('.background-hearts').appendChild(heart);

    setTimeout(() => {
        heart.remove();
    }, 5000);
}

setInterval(createHeart, 300);

// --- Creator Logic ---
const themeSelector = document.getElementById('themeSelector');
const customThemeSection = document.getElementById('customThemeSection');

// Show/hide custom theme section
themeSelector.addEventListener('change', (e) => {
    document.body.className = e.target.value;

    if (e.target.value === 'custom') {
        customThemeSection.classList.remove('hidden');
        applyCustomThemePreview();
    } else {
        customThemeSection.classList.add('hidden');
    }
});

// Live preview for custom theme
const customPrimary = document.getElementById('customPrimary');
const customSecondary = document.getElementById('customSecondary');
const customGradientStart = document.getElementById('customGradientStart');
const customGradientEnd = document.getElementById('customGradientEnd');

function applyCustomThemePreview() {
    document.documentElement.style.setProperty('--primary-color', customPrimary.value);
    document.documentElement.style.setProperty('--secondary-color', customSecondary.value);
    const gradient = `linear-gradient(135deg, ${customGradientStart.value} 0%, ${customGradientEnd.value} 100%)`;
    document.documentElement.style.setProperty('--bg-gradient', gradient);
}

[customPrimary, customSecondary, customGradientStart, customGradientEnd].forEach(input => {
    input.addEventListener('input', applyCustomThemePreview);
});

// Inputs
const senderInput = document.getElementById('senderName');
const recipientInput = document.getElementById('recipientName');
const loveNoteInput = document.getElementById('loveNote');
const reasonInputs = document.querySelectorAll('.reason-input');
const startDateInput = document.getElementById('startDate');
const unlockInput = document.getElementById('unlockTime');
const expiryInput = document.getElementById('expiryTime');
const oneTimeCheck = document.getElementById('oneTimeOpen');
const soundCheck = document.getElementById('enableSound');
const quizQuestionInput = document.getElementById('quizQuestion');
const quizAnswerInput = document.getElementById('quizAnswer');
const musicUrlInput = document.getElementById('musicUrl');
const customYesInput = document.getElementById('customYesText');
const customNoInput = document.getElementById('customNoText');
const customSuccessInput = document.getElementById('customSuccessMsg');
const createBtn = document.getElementById('createBtn');
const linkOutput = document.getElementById('linkOutput');
const generatedLink = document.getElementById('generatedLink');
const copyBtn = document.getElementById('copyBtn');

createBtn.addEventListener('click', () => {
    const sName = senderInput.value.trim();
    const rName = recipientInput.value.trim();
    const sTheme = themeSelector.value;
    const sNote = loveNoteInput.value.trim();
    const sStart = startDateInput.value;
    const sUnlock = unlockInput.value;
    const sExpiry = expiryInput.value;
    const sOneTime = oneTimeCheck.checked;
    const sSound = soundCheck.checked;

    const sQuizQ = quizQuestionInput.value.trim();
    const sQuizA = quizAnswerInput.value.trim();
    const sMusicUrl = musicUrlInput.value.trim();
    const sWebhook = document.getElementById('webhookUrl').value.trim();
    const sYesText = customYesInput.value.trim();
    const sNoText = customNoInput.value.trim();
    const sSuccessMsg = customSuccessInput.value.trim();

    let sMusicId = '';
    if (sMusicUrl) {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&\?]*).*/;
        const match = sMusicUrl.match(regExp);
        if (match && match[2].length == 11) {
            sMusicId = match[2];
        }
    }

    const sReasons = Array.from(reasonInputs)
        .map(input => input.value.trim())
        .filter(val => val !== "")
        .join('|');

    const timelineDates = document.querySelectorAll('.timeline-date-in');
    const timelineDescs = document.querySelectorAll('.timeline-desc-in');
    let sTimeline = [];
    timelineDates.forEach((dateInput, index) => {
        const date = dateInput.value.trim();
        const desc = timelineDescs[index].value.trim();
        if (date && desc) {
            sTimeline.push(`${date}:${desc}`);
        }
    });

    if (!sName || !rName) {
        alert("Please enter both names!");
        return;
    }

    // POINT TO PROPOSAL.HTML
    const baseUrl = window.location.origin + window.location.pathname.replace('index.html', '').replace(/\/$/, '') + '/proposal.html';

    let fullUrl = `${baseUrl}?from=${encodeURIComponent(sName)}&to=${encodeURIComponent(rName)}&theme=${sTheme}`;

    // Custom theme colors
    if (sTheme === 'custom') {
        fullUrl += `&cp=${encodeURIComponent(customPrimary.value)}`;
        fullUrl += `&cs=${encodeURIComponent(customSecondary.value)}`;
        fullUrl += `&cg1=${encodeURIComponent(customGradientStart.value)}`;
        fullUrl += `&cg2=${encodeURIComponent(customGradientEnd.value)}`;
    }

    if (sNote) fullUrl += `&note=${encodeURIComponent(sNote)}`;
    if (sReasons) fullUrl += `&reasons=${encodeURIComponent(sReasons)}`;
    if (sTimeline.length > 0) fullUrl += `&timeline=${encodeURIComponent(sTimeline.join('|'))}`;
    if (sStart) fullUrl += `&startDate=${encodeURIComponent(sStart)}`;
    if (sWebhook) fullUrl += `&webhook=${encodeURIComponent(sWebhook)}`;
    if (sUnlock) fullUrl += `&unlock=${encodeURIComponent(sUnlock)}`;
    if (sExpiry) fullUrl += `&expiry=${encodeURIComponent(sExpiry)}`;
    if (sOneTime) fullUrl += `&oneTime=true`;
    if (sSound) fullUrl += `&sound=true`;
    if (sQuizQ && sQuizA) {
        fullUrl += `&quizQ=${encodeURIComponent(sQuizQ)}&quizA=${encodeURIComponent(sQuizA)}`;
    }
    if (sMusicId) fullUrl += `&music=${encodeURIComponent(sMusicId)}`;
    if (sYesText) fullUrl += `&yesText=${encodeURIComponent(sYesText)}`;
    if (sNoText) fullUrl += `&noText=${encodeURIComponent(sNoText)}`;
    if (sSuccessMsg) fullUrl += `&successMsg=${encodeURIComponent(sSuccessMsg)}`;

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
