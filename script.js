(() => {
    'use strict';

    /* ================= HARDENING ================= */
    Object.freeze(Math);
    Object.freeze(Array.prototype);
    Object.freeze(Object);

    /* ================= CONFIG ================= */
    const CARD_SIZE = 25;
    const MIN_BET = 10;
    const MINE_ICON = '💣';
    const GEM_ICON = '💎';
    const BASE_MULTIPLIER = 0.05;

    /* ================= DOM ================= */
    const betC = document.querySelector('#aposta');
    const minesC = document.querySelector('#qtdminas');
    const button = document.querySelector('#startBtn');
    const balanceC = document.querySelector('#saldo');
    const board = document.querySelector('#board');
    const over = document.querySelector('#over');

    /* ================= PRIVATE STATE ================= */
    let _balance = 1000;

    const _state = Object.seal({
        started: false,
        bet: 0,
        mines: 0,
        profit: 0,
        opened: 0,
        bombsHash: null
    });

    /* ================= HELPERS ================= */
    const secureRandom = (min, max) =>
        crypto.getRandomValues(new Uint32Array(1))[0] % (max - min + 1) + min;

    const shuffle = arr => {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = secureRandom(0, i);
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    };

    const hashBombs = bombs =>
        btoa(bombs.join('-') + performance.now()).slice(0, 32);

    const getBalance = () => _balance;

    const setBalance = value => {
        _balance = Math.max(0, Number(value.toFixed(2)));
        balanceC.textContent = _balance.toFixed(2);
    };

    const cheatDetected = () => {
        document.body.innerHTML = `
            <h1 style="color:red;text-align:center;margin-top:40px">
                🚨 Cheat detectado
            </h1>`;
        throw new Error('Cheat detected');
    };

    /* ================= ANTI DOM TAMPERING ================= */
    const observer = new MutationObserver(() => {
        if (Number(balanceC.textContent) !== _balance) {
            cheatDetected();
        }
    });

    observer.observe(balanceC, {
        childList: true,
        characterData: true,
        subtree: true
    });

    /* ================= GAME LOGIC ================= */
    let _bombs = [];

    const generateBombs = qtd => {
        const nums = shuffle([...Array(CARD_SIZE)].map((_, i) => i + 1));
        const bombs = nums.slice(0, qtd);
        _state.bombsHash = hashBombs(bombs);
        return bombs;
    };

    const startGame = () => {
        if (_state.started) return;

        const bet = Number(betC.value);
        const mines = Number(minesC.value);

        if (
            bet < MIN_BET ||
            bet > getBalance() ||
            mines < 1 ||
            mines >= CARD_SIZE
        ) return;

        _state.started = true;
        _state.bet = bet;
        _state.mines = mines;
        _state.profit = 0;
        _state.opened = 0;

        _bombs = generateBombs(mines);

        button.textContent = 'Retirar';
        over.style.display = 'none';
        renderBoard();
    };

    const lose = () => {
        if (!_state.started) cheatDetected();

        _state.started = false;
        setBalance(getBalance() - _state.bet);
        revealBombs();
        showOver('❌ You Lose');
        resetButton();
    };

    const cashOut = () => {
        if (!_state.started) cheatDetected();
        if (_state.opened === 0) return;

        setBalance(getBalance() + _state.profit);
        _state.started = false;
        showOver('🎉 You Won');
        resetButton();
    };

    const cardClick = id => {
        if (!_state.started) return;

        if (_bombs.includes(id)) {
            lose();
            return;
        }

        _state.opened++;
        const risk = Math.pow(1.45, _state.mines);
        _state.profit += _state.bet * BASE_MULTIPLIER * risk;

        button.textContent = `Retirar R$${_state.profit.toFixed(2)}`;
    };

    /* ================= UI ================= */
    const renderBoard = () => {
        board.innerHTML = '';
        for (let i = 1; i <= CARD_SIZE; i++) {
            const card = document.createElement('div');
            card.className = 'card';
            card.textContent = GEM_ICON;
            card.style.color = 'transparent';

            card.addEventListener('click', () => {
                if (card.dataset.opened) return;
                card.dataset.opened = '1';
                card.style.color = 'white';
                cardClick(i);
            });

            board.appendChild(card);
        }
        board.appendChild(over);
        board.style.display = 'grid';
    };

    const revealBombs = () => {
        _bombs.forEach(id => {
            const c = document.querySelector(`.card:nth-child(${id})`);
            if (c) {
                c.textContent = MINE_ICON;
                c.style.color = 'white';
                c.style.background = '#ff4d4d';
            }
        });
    };

    const showOver = msg => {
        over.innerHTML = `<h2>${msg}</h2>`;
        over.style.display = 'flex';
    };

    const resetButton = () => {
        button.textContent = 'Começar';
    };

    /* ================= EVENTS ================= */
    button.addEventListener('click', () => {
        _state.started ? cashOut() : startGame();
    });

    /* ================= INIT ================= */
    setBalance(_balance);

})();
