// ======================
// Oyun URL'leri
// ======================
const gameUrls = {
    'snake': 'games/snake.html',
    'pong': 'games/pong.html',
    'tetris': 'games/tetris.html',
    'flappy': 'games/flappy.html',
    'memory': 'games/memory.html'
};

// ======================
// DOM Elemanları
// ======================
const searchInput = document.getElementById('searchInput'); // ID düzeltildi
const searchBtn = document.getElementById('searchBtn'); // Arama butonu eklendi
const categoryButtons = document.querySelectorAll('.category');
const gameCards = document.querySelectorAll('.game-card');
const modal = document.getElementById('gameModal');
const modalTitle = document.getElementById('modalTitle');
const gameFrame = document.getElementById('gameFrame');
const gameDescription = document.getElementById('gameDescription'); // Açıklama için eklendi
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
function toggleFavorite(gameId) {
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
function rateGame(gameId, rating) {
    event.preventDefault();
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

    gameCards.forEach(card => {
        const gameId = card.dataset.game;

        // Favori butonu
        const favBtn = card.querySelector('.fav-btn');
        if (favBtn) {
            if (favorites.includes(gameId)) {
                favBtn.classList.add('active');
                favBtn.innerHTML = '<i class="fas fa-heart"></i>';
            }
        }

        // Puanlama güncelleme
        const ratingStars = card.querySelectorAll('.rating i');
        const currentRating = ratings[gameId] || 0;
        
        if (ratingStars.length) {
            ratingStars.forEach((star, index) => {
                if (index < currentRating) {
                    star.className = 'fas fa-star';
                } else {
                    star.className = 'far fa-star';
                }
            });
        }

        // Oyna butonu
        const playBtn = card.querySelector('.play-btn');
        if (playBtn) {
            playBtn.addEventListener('click', () => openGame(gameId));
        }
    });
}

// ======================
// Puanlamaları Güncelle
// ======================
function updateRatings() {
    const ratings = getRatings();
    gameCards.forEach(card => {
        const gameId = card.dataset.game;
        const ratingStars = card.querySelectorAll('.rating i');
        const currentRating = ratings[gameId] || 0;
        
        if (ratingStars.length) {
            ratingStars.forEach((star, index) => {
                if (index < currentRating) {
                    star.className = 'fas fa-star';
                } else {
                    star.className = 'far fa-star';
                }
            });
        }
    });
}

// ======================
// Modal Aç/Kapat
// ======================
function openGame(gameId) {
    if (!gameUrls[gameId]) return;
    modalTitle.textContent = cardTitle(gameId);
    gameDescription.textContent = cardDescription(gameId);
    gameFrame.src = gameUrls[gameId];
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden'; // Sayfa kaydırmayı engelle
}

function closeGame() {
    modal.style.display = 'none';
    gameFrame.src = '';
    document.body.style.overflow = 'auto'; // Sayfa kaydırmayı geri aç
}

closeModalBtn.addEventListener('click', closeGame);
window.addEventListener('click', e => {
    if (e.target === modal) closeGame();
});

// ESC tuşu ile modalı kapat
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeGame();
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
        
        if (title.includes(term) || desc.includes(term) || category.includes(term)) {
            card.style.display = '';
        } else {
            card.style.display = 'none';
        }
    });
}

searchInput.addEventListener('input', performSearch);
searchBtn.addEventListener('click', performSearch);

// Enter tuşu ile arama
searchInput.addEventListener('keypress', e => {
    if (e.key === 'Enter') performSearch();
});

categoryButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        categoryButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const category = btn.dataset.category;
        
        gameCards.forEach(card => {
            if (category === 'all' || card.dataset.category === category) {
                card.style.display = '';
            } else {
                card.style.display = 'none';
            }
        });
    });
});

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

themeToggle.addEventListener('click', () => {
    const dark = document.body.classList.contains('dark-mode');
    setTheme(dark ? 'light' : 'dark');
});

// İlk yükleme
document.addEventListener('DOMContentLoaded', () => {
    setupGameCards();
    updateRatings();

    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    
    // Favorileri yükle
    const favorites = getFavorites();
    favorites.forEach(gameId => {
        const favBtn = document.querySelector(`.fav-btn[data-game="${gameId}"]`);
        if (favBtn) {
            favBtn.classList.add('active');
            favBtn.innerHTML = '<i class="fas fa-heart"></i>';
        }
    });
});

// ======================
// Yardımcı Fonksiyonlar
// ======================
function cardTitle(id) {
    switch (id) {
        case 'snake': return 'Yılan Oyunu';
        case 'pong': return 'Pong Oyunu';
        case 'tetris': return 'Mini Tetris';
        case 'flappy': return 'Flappy Kare';
        case 'memory': return 'Eş Kart Bul';
        default: return 'Oyun';
    }
}

function cardDescription(id) {
    switch (id) {
        case 'snake': return 'Yemleri topla, büyü ve rekoru kır.';
        case 'pong': return 'W/S ile raketini hareket ettir ve savun.';
        case 'tetris': return 'Düşen blokları yerleştir, satırları temizle.';
        case 'flappy': return 'Zıpla ve engelleri aş; duvara çarpma.';
        case 'memory': return 'Kartları çevir ve çiftlerini yakala.';
        default: return 'Eğlenceli mini oyun.';
    }
}