const betC = document.querySelector('#aposta');
const minesC = document.querySelector('#qtdminas');
const button = document.querySelector('#startBtn');
const balanceC = document.querySelector('#saldo');
const board = document.querySelector('#board');
const over = document.querySelector('#over');

const cardSize = 25;
const mineIcon = '💣';
const gemIcon = '💎';

let bombs = [];
let gameStarted = false;
let profit = 0;
let currentBet = 0;
let currentMines = 0;
let cardsOpened = 0;

let rewardMultiplier = 0.05;

board.style.display = 'none';
over.style.display = 'none';

/* ======== NOVA LÓGICA DO INPUT DE APOSTA ======== */
// Apaga o valor ao clicar
betC.addEventListener('focus', (e) => {
    e.target.value = '';
});

betC.addEventListener('focus', (e) => {
    if (parseFloat(e.target.value) === 0) {
        e.target.value = '';
    }
});

betC.addEventListener('blur', (e) => {
    let value = parseFloat(e.target.value);
    if (isNaN(value) || value <= 0) {
        e.target.value = 0;
    } else {
        e.target.value = value.toFixed(2);
    }
});

button.addEventListener('click', () => {
    if (gameStarted) {
        cashOut();
    } else {
        startGame();
    }
});

function startGame() {
    const balance = Number(balanceC.innerHTML);
    const bet = parseFloat((betC.value || '0').replace(',', '.'));
    const minesAmount = Number(minesC.value);
    const minBet = 10;

    if (bet >= minBet && bet <= balance && minesAmount > 0) {
        currentBet = bet;
        currentMines = minesAmount;
        bombs = randomNumber(minesAmount);

        profit = 0;
        cardsOpened = 0;
        gameStarted = true;
        button.textContent = 'Retirar';
        over.style.display = 'none';
        updateBoard();

        board.style.display = 'grid';
        //console.log('Bombs:', bombs);
    } else if (bet > balance) {
        alert('Saldo insuficiente!');
    } else if (minesAmount < 1) {
        minesC.value = 1;
    } else {
        alert('[ERROR] Valores inválidos!');
    }
}

function randomNumber(qtd, min = 1, max = cardSize) {
    const numeros = Array.from({ length: max - min + 1 }, (_, i) => i + min);
    for (let i = numeros.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [numeros[i], numeros[j]] = [numeros[j], numeros[i]];
    }
    return numeros.slice(0, qtd);
}

function updateBoard() {
    const overlay = over;
    board.innerHTML = '';
    for (let i = 1; i <= cardSize; i++) createCard(i);
    board.appendChild(overlay);
}

function createCard(id) {
    const card = document.createElement('div');
    card.className = 'card';
    card.id = id;
    card.textContent = gemIcon;
    card.style.color = 'transparent';
    card.dataset.revealed = 'false';

    card.addEventListener('click', () => {
        if (gameStarted) cardClick(id);
    });

    board.appendChild(card);
}

function cardClick(id) {
    const card = document.getElementById(String(id));
    if (!card || card.dataset.revealed === 'true') return;

    card.dataset.revealed = 'true';
    card.style.color = 'white';

    if (bombs.includes(Number(id))) {
        card.textContent = mineIcon;
        lose();
    } else {
        const riskMultiplier = Math.pow(1.5, currentMines);
        const gain = currentBet * rewardMultiplier * riskMultiplier;
        profit += gain;
        cardsOpened += 1;

        card.textContent = gemIcon;

        button.textContent = `Retirar R$${profit.toFixed(2).replace('.', ',')}`;
    }
}

function lose() {
    gameStarted = false;

    const balance = Number(balanceC.innerHTML);
    balanceC.innerHTML = (balance - currentBet).toFixed(2);

    profit = 0;
    button.textContent = 'Recomeçar';

    showOver('❌ You Lose');

    bombs.forEach(id => {
        const card = document.getElementById(String(id));
        if (card) {
            card.textContent = mineIcon;
            card.style.color = 'white';
            card.style.background = '#ff4d4d';
        }
    });
}

function cashOut() {
    if (cardsOpened === 0) {
        alert('Você ainda não acertou nenhum card!');
        return;
    }

    const balance = Number(balanceC.innerHTML);
    balanceC.innerHTML = (balance + profit).toFixed(2);

    profit = 0;
    gameStarted = false;
    button.textContent = 'Começar';
    showOver('🎉 You Won');
}

function showOver(message) {
    over.innerHTML = `<h2>${message}</h2>`;
    over.style.display = 'flex';
}

function cheat(level = 1) {
    // function for noobs :)
    if (level == 2) {
        balanceC.innerHTML = '9999999999999999999.00';
        return
    }
    const balance = Number(balanceC.innerHTML)
    const bet = document.querySelector('#aposta')

    bet.value = (balance - 1)
    minesC.value = 24

    startGame()

    for (let x = 1; x <= cardSize; x++) {
        if (!bombs.includes(x)) {
            cardClick(x);
        }
    }

    if (gameStarted) {
        cashOut();
    }
}


/*
Detalhes extra do desenvolvimento

    Tempo de conclusão (Aproximado, e com intervalos):
    - começo: 18:51
    - conclusão: 02:12

    Uso de IA: Baixo, uso moderado no CSS, nenhum no HTML, baixo no JS, como randomNumber() e correções de bugs (over, formatação etc)

    Inspiração: como esperado, cassinos online, especificadamente um jogo estilo campo minado

    Projeto para praticar meu aprendizado em JS

    Vou deixar uma demo disponivel no repo

    Desenvolvedor: Matheus Camargo (https://github.com/matheusc9)
*/