document.addEventListener("DOMContentLoaded", () => {
  // 將變數宣告移到更廣的作用域，以便在載入後賦值
  let generateBtn = null;
  let numbersContainer = null;
  const pageContent = document.getElementById("page-content");
  const navbarNav = document.querySelector(".navbar-nav");
  let bingoStarsSelect = null;
  let superballCheckbox = null;

  // 遊戲規則庫
  const gameRules = {
    "power-lottery.html": {
      regularBalls: 6,
      regularMax: 38,
      specialBalls: 1,
      specialMax: 8,
      allowDuplicates: false,
    },
    "lotto-649.html": {
      regularBalls: 6,
      regularMax: 49,
      specialBalls: 1,
      specialMax: 49,
      allowDuplicates: false,
    },
    "daily-cash-539.html": {
      regularBalls: 5,
      regularMax: 39,
      specialBalls: 0,
      specialMax: 0,
      allowDuplicates: false,
    },
    "3-star.html": {
      regularBalls: 3,
      regularMax: 9,
      specialBalls: 0,
      specialMax: 0,
      allowDuplicates: true,
      minNum: 0,
    },
    "4-star.html": {
      regularBalls: 4,
      regularMax: 9,
      specialBalls: 0,
      specialMax: 0,
      allowDuplicates: true,
      minNum: 0,
    },
    "bingo-bingo.html": {
      regularBalls: 10, // Max stars
      regularMax: 80,
      specialBalls: 0, // Handled separately
      allowDuplicates: false,
      minNum: 1,
    },
    // 其他遊戲暫用預設規則
    default: {
      regularBalls: 6,
      regularMax: 49,
      specialBalls: 1,
      specialMax: 49,
      allowDuplicates: false,
    },
  };

  let currentGame = "power-lottery.html"; // 預設遊戲

  // 格式化數字，小於 10 則補 0
  const formatNumber = (num) => (num < 10 ? `0${num}` : num);

  // 單一號碼球的拉霸動畫
  const animateBall = (ball, finalNumber, maxNumber) => {
    return new Promise((resolve) => {
      const spinInterval = setInterval(() => {
        const min = gameRules[currentGame]?.minNum ?? 1;
        const randomNum =
          Math.floor(Math.random() * (maxNumber - min + 1)) + min;
        ball.textContent = formatNumber(randomNum);
      }, 50); // 每 50 毫秒變換一次數字

      setTimeout(() => {
        clearInterval(spinInterval);
        ball.textContent = formatNumber(finalNumber);
        ball.classList.add("settled"); // 添加一個 class 來觸發 CSS 動畫
        resolve();
      }, 1000); // 轉動 1 秒後停止
    });
  };

  // 初始化函式，在頁面上建立空的號碼球
  const initializeBalls = () => {
    let rules = gameRules[currentGame] || gameRules.default;
    let ballCount = rules.regularBalls;

    // BINGO BINGO 的球數由下拉選單決定
    if (currentGame === "bingo-bingo.html" && bingoStarsSelect) {
      ballCount = parseInt(bingoStarsSelect.value, 10);
    }

    numbersContainer.innerHTML = ""; // 清空容器
    for (let i = 0; i < ballCount; i++) {
      const ball = document.createElement("div");
      ball.className = "number-ball";
      numbersContainer.appendChild(ball);
    }

    // 其他遊戲的特別號
    for (let i = 0; i < rules.specialBalls; i++) {
      const specialBall = document.createElement("div");
      specialBall.className = "number-ball special-ball";
      numbersContainer.appendChild(specialBall);
    }
  };

  const generateNumbers = async () => {
    let rules = gameRules[currentGame] || gameRules.default;
    const min = rules.minNum ?? 1;
    let ballCount = rules.regularBalls;

    generateBtn.disabled = true; // 動畫開始時禁用按鈕
    if (superballCheckbox) superballCheckbox.disabled = true;

    // BINGO BINGO 的球數由下拉選單決定
    if (currentGame === "bingo-bingo.html" && bingoStarsSelect) {
      ballCount = parseInt(bingoStarsSelect.value, 10);
      initializeBalls(); // 根據新的星數重新產生球
    }

    // 產生一般號碼
    const regularNumbers = rules.allowDuplicates ? [] : new Set();
    while (
      (rules.allowDuplicates && regularNumbers.length < ballCount) ||
      (!rules.allowDuplicates && regularNumbers.size < ballCount)
    ) {
      const num =
        Math.floor(Math.random() * (rules.regularMax - min + 1)) + min;
      if (rules.allowDuplicates) {
        regularNumbers.push(num);
      } else {
        regularNumbers.add(num);
      }
    }
    const finalRegularNumbers = Array.from(regularNumbers);

    // 產生特別號
    const finalSpecialNumbers = [];
    for (let i = 0; i < rules.specialBalls; i++) {
      let specialNum;
      do {
        specialNum =
          Math.floor(Math.random() * (rules.specialMax - min + 1)) + min;
      } while (!rules.allowDuplicates && regularNumbers.has(specialNum)); // 確保特別號不與一般號碼重複
      finalSpecialNumbers.push(specialNum);
    }

    // 選取頁面上已存在的號碼球
    const balls = document.querySelectorAll(".number-ball");

    // 在動畫開始前，移除上一次的 settled 和 pulse 效果
    document
      .querySelectorAll("#numbers-container .number-ball")
      .forEach((ball) => {
        ball.classList.remove("settled");
        ball.style.animation = "none"; // 移除 pulse 動畫
        ball.textContent = ""; // 清空號碼
      });

    // 依序執行動畫
    for (let i = 0; i < finalRegularNumbers.length; i++) {
      await animateBall(balls[i], finalRegularNumbers[i], rules.regularMax);
      await new Promise((resolve) => setTimeout(resolve, 200)); // 每個號碼球停止後延遲 200ms
    }
    for (let i = 0; i < finalSpecialNumbers.length; i++) {
      const ballIndex = finalRegularNumbers.length + i;
      await animateBall(
        balls[ballIndex],
        finalSpecialNumbers[i],
        rules.specialMax
      );
      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    // 如果 BINGO BINGO 的超級獎號被勾選，則開出
    if (currentGame === "bingo-bingo.html" && superballCheckbox?.checked) {
      const superballContainer = document.getElementById("numbers-container");
      const superball = document.createElement("div");
      superball.className = "number-ball special-ball";
      superballContainer.appendChild(superball);

      const finalNumber =
        Math.floor(Math.random() * rules.regularMax) + rules.minNum;
      await animateBall(superball, finalNumber, rules.regularMax);
    }

    generateBtn.disabled = false; // 動畫結束後啟用按鈕
    if (superballCheckbox) superballCheckbox.disabled = false;
  };

  // 載入並初始化遊戲頁面
  const loadGame = async (page) => {
    try {
      currentGame = page.split("/").pop(); // 更新當前遊戲
      // 清除舊的 BINGO BINGO 特殊元素事件監聽器
      bingoStarsSelect = null;
      superballCheckbox = null;

      const response = await fetch(page);
      if (!response.ok) throw new Error("頁面載入失敗");
      const html = await response.text();
      pageContent.innerHTML = html;

      // 重新獲取 DOM 元素並綁定事件
      generateBtn = document.getElementById("generate-btn");
      numbersContainer = document.getElementById("numbers-container");

      // BINGO BINGO 的特殊處理
      bingoStarsSelect = document.getElementById("bingo-stars-select");
      superballCheckbox = document.getElementById("superball-checkbox");

      if (generateBtn && numbersContainer) {
        generateBtn.addEventListener("click", generateNumbers);
        initializeBalls();

        if (bingoStarsSelect) {
          bingoStarsSelect.addEventListener("change", initializeBalls);
        }
      }
    } catch (error) {
      pageContent.innerHTML = `<div class="alert alert-danger">${error.message}</div>`;
    }
  };

  // --- Path Correction for GitHub Pages ---
  const getBasePath = () => {
    const host = window.location.hostname;
    if (host.includes("github.io")) {
      // For GitHub Pages, the path is /<repository-name>/
      const path = window.location.pathname;
      return path.substring(0, path.lastIndexOf("/") + 1);
    }
    return "/"; // For local development or custom domains
  };
  const basePath = getBasePath();

  // 處理導覽列點擊事件
  navbarNav.addEventListener("click", (e) => {
    // 確保點擊的是一個 nav-link
    if (e.target && e.target.classList.contains("nav-link")) {
      e.preventDefault(); // 防止連結跳轉

      // 更新 active 狀態
      const currentActive = navbarNav.querySelector(".active");
      if (currentActive) {
        currentActive.classList.remove("active");
      }
      e.target.classList.add("active");

      // 載入對應的遊戲頁面
      const page = e.target.dataset.page;
      if (page) {
        loadGame(`${basePath}pages/${page}`);
      }
    }
  });

  // 頁面載入時，預設載入威力彩遊戲
  loadGame(`${basePath}pages/power-lottery.html`);
});
