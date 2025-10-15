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

board.style.display = 'none';
over.style.display = 'none';

function formatCurrency(value) {
    let number = (value || '').replace(/\D/g, '');
    if (!number) return '';
    return number + ',00';
}

function randomNumber(qtd, min = 1, max = cardSize) {
    const numeros = Array.from({ length: max - min + 1 }, (_, i) => i + min);
    for (let i = numeros.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [numeros[i], numeros[j]] = [numeros[j], numeros[i]];
    }
    return numeros.slice(0, qtd);
}

betC.addEventListener('blur', (e) => {
    e.target.value = formatCurrency(e.target.value);
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
    const bet = Number((betC.value || '').replaceAll(',', '')) / 100;
    const minesAmount = Number(minesC.value);
    const minBet = 10;

    if (bet >= minBet && bet <= balance) {
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
        console.log('Bombas:', bombs);
    } else {
        alert('Saldo insuficiente ou valor mínimo não atingido!');
    }
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
        const riskMultiplier = 1 + (currentMines / cardSize) * 3;
        const gain = currentBet * 0.05 * riskMultiplier;
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
/*
Detalhes extra do desenvolvimento

    Tempo de conclusão (Aproximado, e com intervalos):
    - começo: 18:51
    - conclusão: 02:12

    Uso de IA: Baixo, uso moderado no CSS, nenhum no HTML, baixo no JS, como randomNumber() e correções de bugs (over, formatação etc)
    - Projeto simples mas acredito que agregou conhecimento

    Inspiração: como esperado, cassinos online, especificadamente um jogo estilo campo minado

    Projeto para praticar meu aprendizado em JS

    Vou deixar uma demo disponivel no repo

    Desenvolvedor: Matheus Camargo (https://github.com/matheusc9)
*/