<!DOCTYPE html>
<html>
<head>
    <title>Snake Oyunu</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            background: #0a0a2a;
            font-family: Arial, sans-serif;
            overflow: hidden;
        }
        canvas {
            border: 2px solid #fff;
            background: #000;
        }
        .score {
            position: absolute;
            top: 10px;
            left: 10px;
            color: white;
            font-size: 20px;
        }
        .game-over {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: white;
            font-size: 30px;
            text-align: center;
            display: none;
        }
        .restart {
            margin-top: 20px;
            padding: 10px 20px;
            background: #4CAF50;
            border: none;
            color: white;
            font-size: 18px;
            cursor: pointer;
            border-radius: 5px;
        }
    </style>
</head>
<body>
    <div class="score">Skor: <span id="score">0</span></div>
    <canvas id="gameCanvas" width="400" height="400"></canvas>
    <div class="game-over" id="gameOver">
        Oyun Bitti!<br>
        <span id="finalScore">0</span> puan<br>
        <button class="restart" onclick="restartGame()">Yeniden Başlat</button>
    </div>

    <script>
        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        const scoreElement = document.getElementById('score');
        const gameOverElement = document.getElementById('gameOver');
        const finalScoreElement = document.getElementById('finalScore');
        
        const gridSize = 20;
        const tileCount = canvas.width / gridSize;
        
        let snake = [];
        let food = {};
        let dx = 0;
        let dy = 0;
        let score = 0;
        let gameSpeed = 10;
        let gameRunning = false;
        
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
            scoreElement.textContent = score;
            gameOverElement.style.display = 'none';
            
            gameLoop();
        }
        
        // Oyun döngüsü
        function gameLoop() {
            if (!gameRunning) return;
            
            setTimeout(() => {
                clearCanvas();
                moveSnake();
                drawSnake();
                drawFood();
                checkCollision();
                gameLoop();
            }, 1000 / gameSpeed);
        }
        
        // Tuş olaylarını dinle
        document.addEventListener('keydown', (e) => {
            if (!gameRunning) return;
            
            switch(e.key) {
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
        });
        
        // Dokunmatik kontroller için klavye olaylarını dinle
        document.addEventListener('keydown', handleKeyEvent);
        document.addEventListener('keyup', handleKeyEvent);
        
        function handleKeyEvent(e) {
            // Ana sayfadaki kontrollerin çalışması için olayı durdurma
            e.stopPropagation();
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
                scoreElement.textContent = score;
                placeFood();
                
                // Her 50 puanda hızlan
                if (score % 50 === 0) {
                    gameSpeed += 2;
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
            finalScoreElement.textContent = score;
            gameOverElement.style.display = 'block';
        }
        
        // Oyunu yeniden başlat
        function restartGame() {
            gameSpeed = 10;
            startGame();
        }
        
        // Sayfa yüklendiğinde oyunu başlat
        window.onload = startGame;
    </script>
</body>
</html>