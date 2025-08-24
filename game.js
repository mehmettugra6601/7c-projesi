// ======================
// DOM Elemanları
// ======================
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const categoryButtons = document.querySelectorAll('.category');
const gameCards = document.querySelectorAll('.game-card');
const modal = document.getElementById('gameModal');
const modalTitle = document.getElementById('modalTitle');
const gameFrame = document.getElementById('gameFrame');
const gameDescription = document.getElementById('gameDescription');
const closeModalBtn = document.getElementById('closeModal');
const themeToggle = document.getElementById('themeToggle');

// ======================
// LocalStorage Yardımcıları
// ======================
function getFavorites() {
    return JSON.parse(localStorage.getItem('favorites') || '[]');
}
function saveFavorites(favs) {
    localStorage.setItem('favorites', JSON.stringify(favs));
}
function getRatings() {
    return JSON.parse(localStorage.getItem('ratings') || '{}');
}
function saveRatings(ratings) {
    localStorage.setItem('ratings', JSON.stringify(ratings));
}

// ======================
// Favori İşlemleri
// ======================
function toggleFavorite(gameId, event) {
    if (event) event.preventDefault();
    let favs = getFavorites();
    const favBtn = document.querySelector(`.fav-btn[data-game="${gameId}"]`);
    if (favs.includes(gameId)) {
        favs = favs.filter(f => f !== gameId);
        favBtn.classList.remove('active');
        favBtn.innerHTML = '<i class="far fa-heart"></i>';
    } else {
        favs.push(gameId);
        favBtn.classList.add('active');
        favBtn.innerHTML = '<i class="fas fa-heart"></i>';
    }
    saveFavorites(favs);
}

// ======================
// Oyun Puanlama
// ======================
function rateGame(gameId, rating, event) {
    if (event) event.preventDefault();
    const ratings = getRatings();
    ratings[gameId] = rating;
    saveRatings(ratings);
    updateRatings();
}

// ======================
// Oyun Kartlarını Hazırla
// ======================
function setupGameCards() {
    const favorites = getFavorites();
    const ratings = getRatings();
    document.querySelectorAll('.game-card').forEach(card => {
        const gameId = card.dataset.game;

        // Favori butonu
        const favBtn = card.querySelector('.fav-btn');
        if (favBtn) {
            if (favorites.includes(gameId)) {
                favBtn.classList.add('active');
                favBtn.innerHTML = '<i class="fas fa-heart"></i>';
            }
            favBtn.addEventListener('click', (e) => toggleFavorite(gameId, e));
        }

        // Puanlama yıldızları
        const rateLinks = card.querySelectorAll('.rate a');
        rateLinks.forEach((link, index) => link.addEventListener('click', (e) => rateGame(gameId, index + 1, e)));

        // Kart puanını güncelle
        updateCardRating(card, gameId, ratings);

        // Oyna
        const playBtn = card.querySelector('.play-btn');
        playBtn?.addEventListener('click', () => openGame(card));
    });
}

// Kart puanlamasını güncelle
function updateCardRating(card, gameId, ratings) {
    const ratingStars = card.querySelectorAll('.rating i');
    const currentRating = ratings[gameId] || 0;
    if (ratingStars.length) {
        ratingStars.forEach((star, index) => {
            star.className = index < currentRating ? 'fas fa-star' : 'far fa-star';
        });
    }
}

// ======================
// Puanlamaları Güncelle
// ======================
function updateRatings() {
    const ratings = getRatings();
    gameCards.forEach(card => updateCardRating(card, card.dataset.game, ratings));
}

// ======================
// Modal Aç/Kapat - OPTİMİZE EDİLMİŞ
// ======================
function openGame(cardEl) {
    const gameId = cardEl.dataset.game;
    let url = cardEl.dataset.url;
    
    // File protokolü için blob kullan
    if (window.location.protocol === 'file:') {
        // Doğrudan URL kullan, blob ile sorun çıkabilir
        loadGameFrame(url, gameId);
    } else {
        loadGameFrame(url, gameId);
    }
}

function loadGameFrame(url, gameId) {
    modalTitle.textContent = cardTitle(gameId);
    gameDescription.textContent = cardDescription(gameId);
    gameFrame.src = url;
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
}

function closeGame() {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
    document.documentElement.style.overflow = 'auto';
    gameFrame.src = 'about:blank';
}

closeModalBtn.addEventListener('click', closeGame);
window.addEventListener('click', e => { if (e.target === modal) closeGame(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeGame(); });

// İframe'den gelen mesajları dinle
window.addEventListener('message', function(e) {
    if (e.data === 'closeGame') {
        closeGame();
    }
});

// İframe yüklendiğinde kontrol bilgisi gönder
gameFrame.addEventListener('load', function() {
    try {
        gameFrame.contentWindow.postMessage('gameLoaded', '*');
    } catch (e) {
        console.log('Frame yükleme hatası:', e);
    }
});

// ======================
// Arama & Kategori
// ======================
function performSearch() {
    const term = searchInput.value.toLowerCase().trim();
    gameCards.forEach(card => {
        const title = card.querySelector('.title').textContent.toLowerCase();
        const desc = card.querySelector('.desc').textContent.toLowerCase();
        const category = card.dataset.category;
        card.style.display = (title.includes(term) || desc.includes(term) || category.includes(term)) ? '' : 'none';
    });
}
searchInput.addEventListener('input', performSearch);
searchBtn.addEventListener('click', performSearch);
searchInput.addEventListener('keypress', e => { if (e.key === 'Enter') performSearch(); });
categoryButtons.forEach(btn => btn.addEventListener('click', () => {
    categoryButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const category = btn.dataset.category;
    gameCards.forEach(card => card.style.display = (category === 'all' || card.dataset.category === category) ? '' : 'none');
}));

// ======================
// Tema Değiştirme
// ======================
function setTheme(theme) {
    if (theme === 'dark') {
        document.body.classList.add('dark-mode');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
        document.body.classList.remove('dark-mode');
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    }
    localStorage.setItem('theme', theme);
}
themeToggle.addEventListener('click', () => setTheme(document.body.classList.contains('dark-mode') ? 'light' : 'dark'));

// ======================
// İlk Yükleme
// ======================
document.addEventListener('DOMContentLoaded', () => {
    setupGameCards();
    updateRatings();
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    // Favorileri işaretle
    getFavorites().forEach(gameId => {
        const favBtn = document.querySelector(`.fav-btn[data-game="${gameId}"]`);
        if (favBtn) { favBtn.classList.add('active'); favBtn.innerHTML = '<i class="fas fa-heart"></i>'; }
    });
});

// ======================
// Yardımcı Başlık/Açıklama
// ======================
function cardTitle(id) {
    switch (id) {
        case 'snake': return 'Yılan Oyunu';
        case 'pong': return 'Pong Oyunu';
        case 'tetris': return 'Mini Tetris';
        case 'flappy': return 'Flappy Kare';
        case 'memory': return 'Eş Kart Bul';
        case 'runner3d': return 'Runner 3D';
        default: return 'Oyun';
    }
}
function cardDescription(id) {
    switch (id) {
        case 'snake': return 'Yemleri topla, büyü ve rekoru kır. Yön tuşları ile oynanır.';
        case 'pong': return 'W/S ile raketini hareket ettir ve savun.';
        case 'tetris': return 'Düşen blokları yerleştir, satırları temizle. Yön tuşları + Yukarı ile döndür.';
        case 'flappy': return 'Zıpla ve engelleri aş; boşluk tuşu ile oynanır.';
        case 'memory': return 'Kartları çevir ve çiftlerini yakala. Fare/dokunmatik ile.';
        case 'runner3d': return 'Boşluk ile zıpla, engellerden kaç. Mobilde Zıpla butonu.';
        default: return 'Eğlenceli mini oyun.';
    }
}