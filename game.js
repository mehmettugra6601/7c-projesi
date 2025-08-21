// game.js
// Karanlık/Aydınlık mod değiştirme
const themeToggle = document.getElementById('themeToggle');
const body = document.body;

// Kullanıcının tercihini kontrol et
if (localStorage.getItem('theme') === 'dark') {
    body.classList.add('dark-mode');
    themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
}

themeToggle.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    if (body.classList.contains('dark-mode')) {
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        localStorage.setItem('theme', 'dark');
    } else {
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        localStorage.setItem('theme', 'light');
    }
});

// Kategori filtreleme
const categories = document.querySelectorAll('.category');
const gameCards = document.querySelectorAll('.game-card');

categories.forEach(category => {
    category.addEventListener('click', () => {
        // Aktif kategoriyi güncelle
        categories.forEach(cat => cat.classList.remove('active'));
        category.classList.add('active');
        
        // Oyunları filtrele
        const selectedCategory = category.getAttribute('data-category');
        
        gameCards.forEach(card => {
            if (selectedCategory === 'all' || card.getAttribute('data-category') === selectedCategory) {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        });
    });
});

// Arama fonksiyonu
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');

searchBtn.addEventListener('click', performSearch);
searchInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
        performSearch();
    }
});

function performSearch() {
    const searchText = searchInput.value.toLowerCase();
    
    gameCards.forEach(card => {
        const title = card.querySelector('.game-title').textContent.toLowerCase();
        const desc = card.querySelector('.game-desc').textContent.toLowerCase();
        
        if (title.includes(searchText) || desc.includes(searchText)) {
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
    });
    
    // Tüm kategorileri göster
    categories.forEach(cat => cat.classList.remove('active'));
    document.querySelector('[data-category="all"]').classList.add('active');
}

// Oyun modal işlemleri
const playButtons = document.querySelectorAll('.play-btn');
const gameModal = document.getElementById('gameModal');
const closeModal = document.getElementById('closeModal');
const gameFrame = document.getElementById('gameFrame');
const modalTitle = document.getElementById('modalTitle');
const gameDescription = document.getElementById('gameDescription');

// Oyun URL'leri
const gameUrls = {
    '2048': 'https://play2048.co/',
    'sudoku': 'https://www.247sudoku.com/',
    'snake': 'https://playsnake.org/',
    'race': 'https://www.crazygames.com/embed/car-racer-3d',
    'chess': 'https://www.chess.com/play/computer',
    'tetris': 'https://tetris.com/play-tetris'
};

// Oyun açıklamaları
const gameDescriptions = {
    '2048': '2048, kaydırma yaparak aynı numaralı blokları birleştirdiğiniz bulmaca tarzı bir oyundur. Her hamlede rastgele 2 veya 4 sayısı belirir. Amaç 2048 bloğunu oluşturmaktır.',
    'sudoku': 'Sudoku, 9×9 boyutlarında bir diyagramda çözülen ve her satırda, her sütunda ve her 3×3′lük karede 1′den 9′a kadar rakamların bir kez yer alması gereken bir bulmacadır.',
    'snake': 'Yılan oyununda amaç, yılanı yön tuşları ile yönlendirerek yiyecekleri toplamak ve yılanın büyümesini sağlamaktır. Yılanın kendi kuyruğuna veya duvara çarpmaması gerekir.',
    'race': 'Araba yarışı oyununda amacınız, diğer yarışçıları geçerek birinci olmak ve parkuru en kısa sürede tamamlamaktır. Dikkatli sürüş ve hızlı refleksler gerektirir.',
    'chess': 'Satranç, iki oyuncu arasında satranç tahtası ve taşları ile oynanan strateji tabanlı bir oyundur. Amacınız rakibin şahını mat etmektir.',
    'tetris': 'Tetris, yukarıdan düşen şekilleri uygun şekilde yerleştirerek tam satırlar oluşturduğunuz efsanevi bir bulmaca oyunudur. Tam satırlar puan kazandırır ve satırları temizler.'
};

// Oyun başlatma
playButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        e.preventDefault();
        const gameName = button.getAttribute('data-game');
        
        // Modal içeriğini güncelle
        modalTitle.textContent = document.querySelector(`.game-card[data-game="${gameName}"] .game-title`).textContent;
        gameDescription.textContent = gameDescriptions[gameName];
        
        // Oyun yükleme
        gameFrame.src = gameUrls[gameName];
        
        // Modalı göster
        gameModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    });
});

// Modalı kapatma
closeModal.addEventListener('click', () => {
    gameModal.style.display = 'none';
    gameFrame.src = '';
    document.body.style.overflow = 'auto';
});

// Modal dışına tıklanınca kapat
gameModal.addEventListener('click', (e) => {
    if (e.target === gameModal) {
        gameModal.style.display = 'none';
        gameFrame.src = '';
        document.body.style.overflow = 'auto';
    }
});

// Oyun kartlarına hover efekti
gameCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
        if (window.matchMedia("(hover: hover)").matches) {
            card.style.transform = 'translateY(-5px) scale(1.02)';
            card.style.boxShadow = '0 12px 20px rgba(0, 0, 0, 0.15)';
        }
    });
    
    card.addEventListener('mouseleave', () => {
        if (window.matchMedia("(hover: hover)").matches) {
            card.style.transform = 'translateY(0) scale(1)';
            card.style.boxShadow = 'var(--shadow)';
        }
    });
    
    // Touch devices için optimizasyon
    card.addEventListener('touchstart', () => {
        card.style.transform = 'translateY(-5px) scale(1.02)';
        card.style.boxShadow = '0 12px 20px rgba(0, 0, 0, 0.15)';
    });
    
    card.addEventListener('touchend', () => {
        setTimeout(() => {
            card.style.transform = 'translateY(0) scale(1)';
            card.style.boxShadow = 'var(--shadow)';
        }, 150);
    });
});

// Sayfa yüklendiğinde animasyon
document.addEventListener('DOMContentLoaded', () => {
    document.body.classList.add('loaded');
    
    // Oyun kartlarına sıralı görünme efekti
    gameCards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
    });
});

// Oyun puanlama sistemi
function rateGame(gameId, rating) {
    if (!localStorage.getItem(`rated_${gameId}`)) {
        localStorage.setItem(`rated_${gameId}`, rating);
        
        // Mevcut puanı güncelle
        const currentRating = localStorage.getItem(`rating_${gameId}`) || 0;
        const currentCount = localStorage.getItem(`rating_count_${gameId}`) || 0;
        
        const newRating = ((currentRating * currentCount) + rating) / (currentCount + 1);
        
        localStorage.setItem(`rating_${gameId}`, newRating);
        localStorage.setItem(`rating_count_${gameId}`, currentCount + 1);
        
        // Puanı göster
        updateRatingDisplay(gameId, newRating);
        
        alert('Oyunu puanladığınız için teşekkürler!');
    } else {
        alert('Bu oyunu zaten puanladınız!');
    }
}

function updateRatingDisplay(gameId, rating) {
    const ratingElement = document.querySelector(`.game-card[data-game="${gameId}"] .game-rating`);
    if (ratingElement) {
        ratingElement.innerHTML = '';
        
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        
        for (let i = 0; i < 5; i++) {
            if (i < fullStars) {
                ratingElement.innerHTML += '<i class="fas fa-star"></i>';
            } else if (i === fullStars && hasHalfStar) {
                ratingElement.innerHTML += '<i class="fas fa-star-half-alt"></i>';
            } else {
                ratingElement.innerHTML += '<i class="far fa-star"></i>';
            }
        }
    }
}

// Sayfa yüklendiğinde puanları güncelle
window.addEventListener('load', () => {
    gameCards.forEach(card => {
        const gameId = card.getAttribute('data-game');
        const rating = localStorage.getItem(`rating_${gameId}`);
        if (rating) {
            updateRatingDisplay(gameId, parseFloat(rating));
        }
    });
});

// Favori oyunlar sistemi
function toggleFavorite(gameId) {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    const index = favorites.indexOf(gameId);
    
    if (index === -1) {
        favorites.push(gameId);
        alert('Oyun favorilere eklendi!');
    } else {
        favorites.splice(index, 1);
        alert('Oyun favorilerden kaldırıldı!');
    }
    
    localStorage.setItem('favorites', JSON.stringify(favorites));
    updateFavoriteIndicators();
}

function updateFavoriteIndicators() {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    
    gameCards.forEach(card => {
        const gameId = card.getAttribute('data-game');
        const favoriteBtn = card.querySelector('.favorite-btn');
        
        if (favoriteBtn) {
            if (favorites.includes(gameId)) {
                favoriteBtn.innerHTML = '<i class="fas fa-heart"></i>';
                favoriteBtn.style.color = '#fd79a8';
            } else {
                favoriteBtn.innerHTML = '<i class="far fa-heart"></i>';
                favoriteBtn.style.color = '';
            }
        }
    });
}

// Sayfa yüklendiğinde favori göstergelerini güncelle
document.addEventListener('DOMContentLoaded', updateFavoriteIndicators);