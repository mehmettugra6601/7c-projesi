// ======================
// DOM Elemanları
// ======================
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const categoryButtons = document.querySelectorAll('.category');
const gameCards = document.querySelectorAll('.game-card');
const modal = document.getElementById('gameModal');
const modalTitle = document.getElementById('modalTitle');
const gameContainer = document.getElementById('gameContainer');
const gameDescription = document.getElementById('gameDescription');
const closeModalBtn = document.getElementById('closeModal');
const themeToggle = document.getElementById('themeToggle');

// Dokunmatik kontroller
const touchControls = document.getElementById('touchControls');
const directionControls = document.getElementById('directionControls');
let activeGame = null;
let isTouchDevice = false;
let currentGameInstance = null;

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

    gameCards.forEach(card => {
        const gameId = card.dataset.game;

        // Favori butonu
        const favBtn = card.querySelector('.fav-btn');
        if (favBtn) {
            if (favorites.includes(gameId)) {
                favBtn.classList.add('active');
                favBtn.innerHTML = '<i class="fas fa-heart"></i>';
            }
            
            favBtn.addEventListener('click', (e) => {
                toggleFavorite(gameId, e);
            });
        }

        // Puanlama güncelleme
        updateCardRating(card, gameId, ratings);
        
        // Puanlama yıldızları
        const rateLinks = card.querySelectorAll('.rate a');
        rateLinks.forEach((link, index) => {
            link.addEventListener('click', (e) => {
                rateGame(gameId, index + 1, e);
            });
        });

        // Oyna butonu
        const playBtn = card.querySelector('.play-btn');
        if (playBtn) {
            playBtn.addEventListener('click', () => openGame(gameId));
        }
    });
}

// Kart puanlamasını güncelle
function updateCardRating(card, gameId, ratings) {
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
}

// ======================
// Puanlamaları Güncelle
// ======================
function updateRatings() {
    const ratings = getRatings();
    gameCards.forEach(card => {
        const gameId = card.dataset.game;
        updateCardRating(card, gameId, ratings);
    });
}

// ======================
// Dokunmatik Cihaz Kontrolü
// ======================
function checkTouchDevice() {
    isTouchDevice = (('ontouchstart' in window) || 
                    (navigator.maxTouchPoints > 0) || 
                    (navigator.msMaxTouchPoints > 0));
    return isTouchDevice;
}

// ======================
// Oyun Tipine Göre Kontrolleri Göster
// ======================
function showControlsForGame(gameId) {
    if (!checkTouchDevice()) return;
    
    // Önce tüm kontrolleri gizle
    touchControls.classList.remove('visible');
    directionControls.classList.remove('visible');
    
    // Oyun tipine göre kontrolleri göster
    switch(gameId) {
        case 'snake':
            directionControls.classList.add('visible');
            break;
        case 'pong':
            document.getElementById('jumpBtn').style.display = 'none';
            document.getElementById('actionBtn').style.display = 'none';
            touchControls.classList.add('visible');
            break;
        case 'flappy':
            document.getElementById('leftBtn').style.display = 'none';
            document.getElementById('rightBtn').style.display = 'none';
            document.getElementById('actionBtn').style.display = 'none';
            document.getElementById('jumpBtn').style.display = 'block';
            touchControls.classList.add('visible');
            break;
        case 'tetris':
            directionControls.classList.add('visible');
            document.getElementById('actionBtn').style.display = 'block';
            document.getElementById('jumpBtn').style.display = 'none';
            touchControls.classList.add('visible');
            break;
        case 'memory':
            // Hafıza oyunu için kontroller gerekmez
            break;
        default:
            // Varsayılan olarak hiçbir kontrol gösterme
    }
    
    activeGame = gameId;
}

// ======================
// Dokunmatik Kontrol Olayları
// ======================
function setupTouchControls() {
    if (!checkTouchDevice()) return;
    
    // Kontrol düğmeleri
    const controlButtons = [
        { id: 'leftBtn', key: 'ArrowLeft' },
        { id: 'rightBtn', key: 'ArrowRight' },
        { id: 'upBtn', key: 'ArrowUp' },
        { id: 'downBtn', key: 'ArrowDown' },
        { id: 'actionBtn', key: ' ' }, // Space
        { id: 'jumpBtn', key: ' ' }, // Space
        { id: 'leftDirBtn', key: 'ArrowLeft' },
        { id: 'rightDirBtn', key: 'ArrowRight' },
        { id: 'centerBtn', key: ' ' } // Space
    ];
    
    controlButtons.forEach(button => {
        const element = document.getElementById(button.id);
        if (element) {
            // Basma olayı
            element.addEventListener('touchstart', (e) => {
                e.preventDefault();
                simulateKeyEvent(button.key, 'keydown');
            });
            
            // Bırakma olayı
            element.addEventListener('touchend', (e) => {
                e.preventDefault();
                simulateKeyEvent(button.key, 'keyup');
            });
            
            // İptal olayı (parmak kaydırma vb.)
            element.addEventListener('touchcancel', (e) => {
                e.preventDefault();
                simulateKeyEvent(button.key, 'keyup');
            });
        }
    });
}

// ======================
// Klavye Olayı Simülasyonu
// ======================
function simulateKeyEvent(key, type) {
    if (!currentGameInstance) return;
    
    try {
        const event = new KeyboardEvent(type, {
            key: key,
            bubbles: true
        });
        
        window.dispatchEvent(event);
        
        // Oyun özel klavye olayları
        if (currentGameInstance.handleKeyEvent) {
            currentGameInstance.handleKeyEvent(key, type);
        }
    } catch (e) {
        console.log("Klavye simülasyon hatası:", e);
    }
}

// ======================
// Oyunları Yükle
// ======================
function loadGame(gameId) {
    // Önceki oyunu temizle
    if (currentGameInstance && currentGameInstance.destroy) {
        currentGameInstance.destroy();
    }
    gameContainer.innerHTML = '';
    currentGameInstance = null;
    
    // Yeni oyunu yükle
    switch(gameId) {
        case 'snake':
            currentGameInstance = createSnakeGame();
            break;
        case 'pong':
            currentGameInstance = createPongGame();
            break;
        case 'tetris':
            currentGameInstance = createTetrisGame();
            break;
        case 'flappy':
            currentGameInstance = createFlappyGame();
            break;
        case 'memory':
            currentGameInstance = createMemoryGame();
            break;
        default:
            gameContainer.innerHTML = '<div style="padding: 20px; text-align: center;">Oyun bulunamadı.</div>';
    }
}

// ======================
// Modal Aç/Kapat
// ======================
function openGame(gameId) {
    modalTitle.textContent = cardTitle(gameId);
    gameDescription.textContent = cardDescription(gameId);
    
    // Oyunu yükle
    loadGame(gameId);
    
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    
    // Dokunmatik kontrolleri ayarla
    showControlsForGame(gameId);
}

function closeGame() {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
    
    // Oyunu temizle
    if (currentGameInstance && currentGameInstance.destroy) {
        currentGameInstance.destroy();
    }
    gameContainer.innerHTML = '';
    currentGameInstance = null;
    
    // Dokunmatik kontrolleri gizle
    touchControls.classList.remove('visible');
    directionControls.classList.remove('visible');
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

// ======================
// İlk Yükleme
// ======================
document.addEventListener('DOMContentLoaded', () => {
    setupGameCards();
    updateRatings();
    setupTouchControls();

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
        case 'snake': return 'Yemleri topla, büyü ve rekoru kır. Yön tuşları ile oynanır.';
        case 'pong': return 'W/S ile raketini hareket ettir ve savun.';
        case 'tetris': return 'Düşen blokları yerleştir, satırları temizle. Yön tuşları ile oynanır.';
        case 'flappy': return 'Zıpla ve engelleri aş; duvara çarpma. Boşluk tuşu ile oynanır.';
        case 'memory': return 'Kartları çevir ve çiftlerini yakala. Fare ile tıklayarak oynanır.';
        default: return 'Eğlenceli mini oyun.';
    }
}

// ======================
// OYUN KODLARI
// ======================

// 1. Yılan Oyunu
function createSnakeGame() {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 400;
    canvas.style.display = 'block';
    canvas.style.margin = '0 auto';
    canvas.style.background = '#000';
    gameContainer.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    const gridSize = 20;
    const tileCount = canvas.width / gridSize;
    
    let snake = [];
    let food = {};
    let dx = 0;
    let dy = 0;
    let score = 0;
    let gameSpeed = 10;
    let gameRunning = false;
    let gameInterval;
    
    // Yılanı başlat
    function initSnake() {
        snake = [
            {x: 10, y: 10},
            {x: 9, y: 10},
            {x: 8, y: 10}
        ];
    }
    
    // Yemi yerleştir
    function placeFood() {
        food = {
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount)
        };
        
        // Yemi yılanın üzerine yerleştirmemek için kontrol
        for (let part of snake) {
            if (part.x === food.x && part.y === food.y) {
                return placeFood();
            }
        }
    }
    
    // Oyunu başlat
    function startGame() {
        initSnake();
        placeFood();
        dx = 1;
        dy = 0;
        score = 0;
        gameRunning = true;
        
        if (gameInterval) clearInterval(gameInterval);
        gameInterval = setInterval(gameLoop, 1000 / gameSpeed);
    }
    
    // Oyun döngüsü
    function gameLoop() {
        if (!gameRunning) return;
        
        clearCanvas();
        moveSnake();
        drawSnake();
        drawFood();
        checkCollision();
    }
    
    // Tuş olaylarını dinle
    function handleKeyEvent(key, type) {
        if (type !== 'keydown' || !gameRunning) return;
        
        switch(key) {
            case 'ArrowLeft':
                if (dx === 0) {
                    dx = -1;
                    dy = 0;
                }
                break;
            case 'ArrowUp':
                if (dy === 0) {
                    dx = 0;
                    dy = -1;
                }
                break;
            case 'ArrowRight':
                if (dx === 0) {
                    dx = 1;
                    dy = 0;
                }
                break;
            case 'ArrowDown':
                if (dy === 0) {
                    dx = 0;
                    dy = 1;
                }
                break;
        }
    }
    
    // Canvas'ı temizle
    function clearCanvas() {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    // Yılanı hareket ettir
    function moveSnake() {
        const head = {x: snake[0].x + dx, y: snake[0].y + dy};
        snake.unshift(head);
        
        // Yem yendi mi?
        if (head.x === food.x && head.y === food.y) {
            score += 10;
            placeFood();
            
            // Her 50 puanda hızlan
            if (score % 50 === 0) {
                gameSpeed += 2;
                clearInterval(gameInterval);
                gameInterval = setInterval(gameLoop, 1000 / gameSpeed);
            }
        } else {
            snake.pop();
        }
    }
    
    // Yılanı çiz
    function drawSnake() {
        snake.forEach((part, index) => {
            ctx.fillStyle = index === 0 ? '#4CAF50' : '#8BC34A';
            ctx.fillRect(part.x * gridSize, part.y * gridSize, gridSize, gridSize);
            
            ctx.strokeStyle = '#000';
            ctx.strokeRect(part.x * gridSize, part.y * gridSize, gridSize, gridSize);
        });
    }
    
    // Yemi çiz
    function drawFood() {
        ctx.fillStyle = '#FF5252';
        ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize, gridSize);
    }
    
    // Çarpışma kontrolü
    function checkCollision() {
        const head = snake[0];
        
        // Duvara çarpma
        if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
            gameOver();
            return;
        }
        
        // Kendine çarpma
        for (let i = 1; i < snake.length; i++) {
            if (head.x === snake[i].x && head.y === snake[i].y) {
                gameOver();
                return;
            }
        }
    }
    
    // Oyun bitti
    function gameOver() {
        gameRunning = false;
        clearInterval(gameInterval);
        
        const gameOverDiv = document.createElement('div');
        gameOverDiv.style.position = 'absolute';
        gameOverDiv.style.top = '50%';
        gameOverDiv.style.left = '50%';
        gameOverDiv.style.transform = 'translate(-50%, -50%)';
        gameOverDiv.style.background = 'rgba(0, 0, 0, 0.8)';
        gameOverDiv.style.color = 'white';
        gameOverDiv.style.padding = '20px';
        gameOverDiv.style.borderRadius = '10px';
        gameOverDiv.style.textAlign = 'center';
        gameOverDiv.innerHTML = `
            <h2>Oyun Bitti!</h2>
            <p>Skor: ${score}</p>
            <button style="padding: 10px 20px; background: #4CAF50; border: none; color: white; border-radius: 5px; cursor: pointer;" onclick="this.parentElement.remove(); startGame();">Yeniden Başlat</button>
        `;
        
        gameContainer.appendChild(gameOverDiv);
    }
    
    // Oyunu temizle
    function destroy() {
        if (gameInterval) clearInterval(gameInterval);
        gameRunning = false;
    }
    
    // Oyunu başlat
    startGame();
    
    return {
        handleKeyEvent,
        destroy
    };
}

// 2. Flappy Oyunu (Basit versiyon)
function createFlappyGame() {
    const container = document.createElement('div');
    container.style.textAlign = 'center';
    gameContainer.appendChild(container);
    
    const canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 480;
    canvas.style.background = '#70c5ce';
    container.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    let bird = { x: 50, y: 150, radius: 15, velocity: 0 };
    let gravity = 0.5;
    let pipes = [];
    let score = 0;
    let gameRunning = true;
    let gameInterval;
    
    function gameLoop() {
        if (!gameRunning) return;
        
        // Temizle
        ctx.fillStyle = '#70c5ce';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Yerçekimi
        bird.velocity += gravity;
        bird.y += bird.velocity;
        
        // Boruları oluştur
        if (frames % 100 === 0) {
            pipes.push({
                x: canvas.width,
                y: 0,
                width: 50,
                height: Math.random() * 200 + 50,
                gap: 150
            });
        }
        
        // Boruları çiz ve hareket ettir
        for (let i = 0; i < pipes.length; i++) {
            let pipe = pipes[i];
            
            // Üst boru
            ctx.fillStyle = '#75c35e';
            ctx.fillRect(pipe.x, pipe.y, pipe.width, pipe.height);
            
            // Alt boru
            ctx.fillRect(pipe.x, pipe.height + pipe.gap, pipe.width, canvas.height - pipe.height - pipe.gap);
            
            // Boruyu hareket ettir
            pipe.x -= 2;
            
            // Skor kontrolü
            if (pipe.x + pipe.width < bird.x && !pipe.passed) {
                score++;
                pipe.passed = true;
            }
            
            // Çarpışma kontrolü
            if (
                bird.x + bird.radius > pipe.x && 
                bird.x - bird.radius < pipe.x + pipe.width && 
                (bird.y - bird.radius < pipe.height || bird.y + bird.radius > pipe.height + pipe.gap)
            ) {
                gameOver();
            }
            
            // Ekrandan çıkan boruları kaldır
            if (pipe.x + pipe.width < 0) {
                pipes.splice(i, 1);
                i--;
            }
        }
        
        // Kuşu çiz
        ctx.fillStyle = '#f8d568';
        ctx.beginPath();
        ctx.arc(bird.x, bird.y, bird.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Zemin
        ctx.fillStyle = '#ded895';
        ctx.fillRect(0, canvas.height - 20, canvas.width, 20);
        
        // Skor
        ctx.fillStyle = '#fff';
        ctx.font = '20px Arial';
        ctx.fillText('Skor: ' + score, 10, 30);
        
        // Sınır kontrolü
        if (bird.y + bird.radius > canvas.height - 20 || bird.y - bird.radius < 0) {
            gameOver();
        }
        
        frames++;
    }
    
    function handleKeyEvent(key, type) {
        if (type === 'keydown' && key === ' ' && gameRunning) {
            bird.velocity = -8;
        }
    }
    
    function gameOver() {
        gameRunning = false;
        clearInterval(gameInterval);
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#fff';
        ctx.font = '30px Arial';
        ctx.fillText('Oyun Bitti!', canvas.width / 2 - 80, canvas.height / 2 - 30);
        ctx.font = '20px Arial';
        ctx.fillText('Skor: ' + score, canvas.width / 2 - 30, canvas.height / 2 + 10);
        
        const restartBtn = document.createElement('button');
        restartBtn.textContent = 'Yeniden Başlat';
        restartBtn.style.marginTop = '20px';
        restartBtn.style.padding = '10px 20px';
        restartBtn.style.background = '#4CAF50';
        restartBtn.style.color = 'white';
        restartBtn.style.border = 'none';
        restartBtn.style.borderRadius = '5px';
        restartBtn.style.cursor = 'pointer';
        restartBtn.onclick = () => {
            container.innerHTML = '';
            gameContainer.appendChild(canvas);
            createFlappyGame();
        };
        
        container.appendChild(restartBtn);
    }
    
    function destroy() {
        clearInterval(gameInterval);
        gameRunning = false;
    }
    
    let frames = 0;
    gameInterval = setInterval(gameLoop, 1000 / 60);
    
    return {
        handleKeyEvent,
        destroy
    };
}

// Diğer oyunlar için benzer şablonlar eklenebilir
function createPongGame() {
    const gameDiv = document.createElement('div');
    gameDiv.innerHTML = `
        <div style="text-align: center; padding: 20px;">
            <h2>Pong Oyunu</h2>
            <p>W ve S tuşları ile raketini hareket ettir.</p>
            <p>Bu örnek bir oyundur. Gerçek Pong oyunu kodunu ekleyebilirsiniz.</p>
            <canvas id="pongCanvas" width="400" height="300" style="background: #000; display: block; margin: 0 auto;"></canvas>
        </div>
    `;
    gameContainer.appendChild(gameDiv);
    
    // Basit bir Pong oyunu için temel kod buraya eklenebilir
    
    return {
        handleKeyEvent: function(key, type) {
            // Pong için klavye kontrolleri
        },
        destroy: function() {
            // Temizlik kodları
        }
    };
}

function createTetrisGame() {
    const gameDiv = document.createElement('div');
    gameDiv.innerHTML = `
        <div style="text-align: center; padding: 20px;">
            <h2>Tetris Oyunu</h2>
            <p>Yön tuşları ile blokları hareket ettir ve döndür.</p>
            <p>Bu örnek bir oyundur. Gerçek Tetris oyunu kodunu ekleyebilirsiniz.</p>
            <canvas id="tetrisCanvas" width="300" height="600" style="background: #000; display: block; margin: 0 auto;"></canvas>
        </div>
    `;
    gameContainer.appendChild(gameDiv);
    
    // Basit bir Tetris oyunu için temel kod buraya eklenebilir
    
    return {
        handleKeyEvent: function(key, type) {
            // Tetris için klavye kontrolleri
        },
        destroy: function() {
            // Temizlik kodları
        }
    };
}

function createMemoryGame() {
    const gameDiv = document.createElement('div');
    gameDiv.innerHTML = `
        <div style="text-align: center; padding: 20px;">
            <h2>Hafıza Oyunu</h2>
            <p>Kartları eşleştirmeye çalış.</p>
            <div id="memoryBoard" style="display: grid; grid-template-columns: repeat(4, 100px); gap: 10px; justify-content: center; margin: 20px auto;"></div>
        </div>
    `;
    gameContainer.appendChild(gameDiv);
    
    // Basit bir hafıza oyunu için temel kod buraya eklenebilir
    const memoryBoard = document.getElementById('memoryBoard');
    const cards = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    
    // Kartları karıştır
    cards.sort(() => Math.random() - 0.5);
    
    // Kartları oluştur
    cards.forEach((card, index) => {
        const cardElement = document.createElement('div');
        cardElement.className = 'memory-card';
        cardElement.style.width = '100px';
        cardElement.style.height = '100px';
        cardElement.style.background = '#4f46e5';
        cardElement.style.color = 'white';
        cardElement.style.display = 'flex';
        cardElement.style.alignItems = 'center';
        cardElement.style.justifyContent = 'center';
        cardElement.style.fontSize = '24px';
        cardElement.style.cursor = 'pointer';
        cardElement.style.borderRadius = '8px';
        cardElement.dataset.value = card;
        cardElement.dataset.index = index;
        cardElement.textContent = '?';
        
        cardElement.addEventListener('click', function() {
            this.textContent = this.dataset.value;
            this.style.background = '#10b981';
            
            // Eşleşme kontrolü buraya eklenebilir
        });
        
        memoryBoard.appendChild(cardElement);
    });
    
    return {
        handleKeyEvent: function() {
            // Hafıza oyunu için klavye kontrolleri gerekmez
        },
        destroy: function() {
            // Temizlik kodları
        }
    };
}