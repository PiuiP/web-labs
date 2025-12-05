// Элементы DOM
const startScreen = document.getElementById('start-screen');
const gameScreen = document.getElementById('game-screen');
const resultScreen = document.getElementById('result-screen');
const currentLevelElement = document.getElementById('current-level');
const correctCountElement = document.getElementById('correct-count');
const incorrectCountElement = document.getElementById('incorrect-count');
const questionNumberElement = document.getElementById('question-number');
const questionElement = document.getElementById('question');
const answerInput = document.getElementById('answer-input');
const submitButton = document.getElementById('submit-answer');
const finalResultElement = document.getElementById('final-result');
const restartButton = document.getElementById('restart-game');
const exitButton = document.getElementById('exit-game');
const stopButton = document.getElementById('stop-game');
const nextLevelButton = document.getElementById('next-level');

// Кнопки выбора уровня
const startEasyButton = document.getElementById('start-easy');
const startMediumButton = document.getElementById('start-medium');
const startHardButton = document.getElementById('start-hard');

// Переменные игры
let currentLevel = '';
let correctAnswers = 0;
let incorrectAnswers = 0;
let currentQuestion = 1;
let usedQuestions = [];
let gameActive = false;

// Уровни сложности
const levels = {
    easy: {
        name: 'Начальный',
        operators: ['+', '-', '*', '/']
    },
    medium: {
        name: 'Средний',
        operators: ['+', '-', '*', '/', '>', '<', '=']
    },
    hard: {
        name: 'Продвинутый',
        operators: ['+', '-', '*', '/', '>', '<', '=', '&', '|']
    }
};

// Получить следующий уровень
function getNextLevel(current) {
    const levelOrder = ['easy', 'medium', 'hard'];
    const currentIndex = levelOrder.indexOf(current);
    return levelOrder[currentIndex + 1];
}

// Инициализация игры
function initGame(level) {
    currentLevel = level;
    correctAnswers = 0;
    incorrectAnswers = 0;
    currentQuestion = 1;
    usedQuestions = [];
    gameActive = true;
    
    currentLevelElement.textContent = levels[level].name;
    updateStats();
    showScreen(gameScreen);
    generateQuestion();
    
    // Фокус на поле ввода
    answerInput.focus();
}

// Обновление статистики
function updateStats() {
    correctCountElement.textContent = correctAnswers;
    incorrectCountElement.textContent = incorrectAnswers;
    questionNumberElement.textContent = currentQuestion;
}

// Генерация вопроса
function generateQuestion() {
    let question, answer;
    let attempts = 0;
    
    do {
        attempts++;
        if (attempts > 100) {
            // Если не удалось сгенерировать уникальный вопрос после 100 попыток
            usedQuestions = [];
        }
        
        switch(currentLevel) {
            case 'easy':
                ({question, answer} = generateEasyQuestion());
                break;
            case 'medium':
                ({question, answer} = generateMediumQuestion());
                break;
            case 'hard':
                ({question, answer} = generateHardQuestion());
                break;
        }
    } while (usedQuestions.includes(question) && attempts < 200);
    
    usedQuestions.push(question);
    questionElement.textContent = question;
    answerInput.value = '';
    
    // Сохраняем правильный ответ в data-атрибуте
    questionElement.dataset.correctAnswer = answer;
}

// Генерация вопроса для начального уровня
function generateEasyQuestion() {
    const operators = levels.easy.operators;
    const operator = operators[Math.floor(Math.random() * operators.length)];
    
    let num1, num2, question, answer;
    
    switch(operator) {
        case '+':
            num1 = Math.floor(Math.random() * 50) + 1;
            num2 = Math.floor(Math.random() * 50) + 1;
            question = `${num1} + ${num2}`;
            answer = num1 + num2;
            break;
        case '-':
            num1 = Math.floor(Math.random() * 50) + 1;
            num2 = Math.floor(Math.random() * num1) + 1;
            question = `${num1} - ${num2}`;
            answer = num1 - num2;
            break;
        case '*':
            num1 = Math.floor(Math.random() * 12) + 1;
            num2 = Math.floor(Math.random() * 12) + 1;
            question = `${num1} × ${num2}`;
            answer = num1 * num2;
            break;
        case '/':
            num2 = Math.floor(Math.random() * 10) + 1;
            num1 = num2 * (Math.floor(Math.random() * 10) + 1);
            question = `${num1} ÷ ${num2}`;
            answer = num1 / num2;
            break;
    }
    
    return {question, answer};
}

// Генерация вопроса для среднего уровня
function generateMediumQuestion() {
    // 70% шанс получить арифметический вопрос, 30% - вопрос на сравнение
    if (Math.random() < 0.7) {
        return generateEasyQuestion();
    }
    
    const operators = ['>', '<', '='];
    const operator = operators[Math.floor(Math.random() * operators.length)];
    
    const num1 = Math.floor(Math.random() * 100) + 1;
    const num2 = Math.floor(Math.random() * 100) + 1;
    
    let question = `${num1} ${operator} ${num2}`;
    let answer;
    
    switch(operator) {
        case '>':
            answer = num1 > num2 ? 'да' : 'нет';
            break;
        case '<':
            answer = num1 < num2 ? 'да' : 'нет';
            break;
        case '=':
            answer = num1 === num2 ? 'да' : 'нет';
            break;
    }
    
    return {question, answer};
}

// Генерация вопроса для продвинутого уровня
function generateHardQuestion() {
    // 50% шанс получить арифметический/сравнительный вопрос, 30% - логический, 20% - двоичный
    const rand = Math.random();
    
    if (rand < 0.5) {
        return generateMediumQuestion();
    } else if (rand < 0.8) {
        // Логический вопрос
        const operators = ['&', '|'];
        const operator = operators[Math.floor(Math.random() * operators.length)];
        
        const bool1 = Math.random() < 0.5;
        const bool2 = Math.random() < 0.5;
        
        let question = `${bool1} ${operator === '&' ? 'И' : 'ИЛИ'} ${bool2}`;
        let answer;
        
        if (operator === '&') {
            answer = bool1 && bool2 ? 'да' : 'нет';
        } else {
            answer = bool1 || bool2 ? 'да' : 'нет';
        }
        
        return {question, answer};
    } else {
        // Двоичный вопрос
        const num = Math.floor(Math.random() * 16); // Число от 0 до 15
        const binary = num.toString(2).padStart(4, '0');
        
        const question = `Переведите ${binary} в десятичную систему`;
        const answer = num.toString();
        
        return {question, answer};
    }
}

// Проверка ответа
function checkAnswer() {
    if (!gameActive) return;
    
    const userAnswer = answerInput.value.trim().toLowerCase();
    const correctAnswer = questionElement.dataset.correctAnswer.toString().toLowerCase();
    
    if (userAnswer === correctAnswer) {
        correctAnswers++;
    } else {
        incorrectAnswers++;
    }
    
    updateStats();
    currentQuestion++;
    
    if (currentQuestion > 10) {
        endGame();
    } else {
        generateQuestion();
    }
}

// Завершение игры
function endGame() {
    gameActive = false;
    const successRate = (correctAnswers / 10) * 100;
    
    let message = `Вы ответили правильно на ${correctAnswers} из 10 вопросов (${successRate}%). `;
    
    if (successRate >= 80) {
        const nextLevel = getNextLevel(currentLevel);
        if (nextLevel) {
            message += "Поздравляем! Вы можете перейти на следующий уровень!";
            nextLevelButton.classList.remove('hidden');
            nextLevelButton.onclick = () => initGame(nextLevel);
        } else {
            message += "Поздравляем! Вы прошли все уровни игры!";
            nextLevelButton.classList.add('hidden');
        }
    } else {
        message += "К сожалению, вы не прошли на следующий уровень. Попробуйте еще раз!";
        nextLevelButton.classList.add('hidden');
    }
    
    finalResultElement.textContent = message;
    showScreen(resultScreen);
}

// Остановка игры
function stopGame() {
    gameActive = false;
    const message = `Игра остановлена. Вы ответили правильно на ${correctAnswers} из ${currentQuestion - 1} вопросов.`;
    finalResultElement.textContent = message;
    nextLevelButton.classList.add('hidden');
    showScreen(resultScreen);
}

// Показать определенный экран
function showScreen(screen) {
    startScreen.classList.add('hidden');
    gameScreen.classList.add('hidden');
    resultScreen.classList.add('hidden');
    
    screen.classList.remove('hidden');
}

// Обработчики событий
startEasyButton.addEventListener('click', () => initGame('easy'));
startMediumButton.addEventListener('click', () => initGame('medium'));
startHardButton.addEventListener('click', () => initGame('hard'));

submitButton.addEventListener('click', checkAnswer);

answerInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        checkAnswer();
    }
});

stopButton.addEventListener('click', stopGame);

restartButton.addEventListener('click', () => {
    showScreen(startScreen);
});

exitButton.addEventListener('click', () => {
    showScreen(startScreen);
});