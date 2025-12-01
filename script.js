document.addEventListener("DOMContentLoaded", () => {
  const generateBtn = document.getElementById("generate-btn");
  const numbersContainer = document.getElementById("numbers-container");

  // 格式化數字，小於 10 則補 0
  const formatNumber = (num) => (num < 10 ? `0${num}` : num);

  // 單一號碼球的拉霸動畫
  const animateBall = (ball, finalNumber, maxNumber) => {
    return new Promise((resolve) => {
      const spinInterval = setInterval(() => {
        const randomNum = Math.floor(Math.random() * maxNumber) + 1;
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
    numbersContainer.innerHTML = ""; // 清空容器
    for (let i = 0; i < 6; i++) {
      const ball = document.createElement("div");
      ball.className = "number-ball";
      numbersContainer.appendChild(ball);
    }
    const specialBall = document.createElement("div");
    specialBall.className = "number-ball special-ball";
    numbersContainer.appendChild(specialBall);
  };

  const generateNumbers = async () => {
    generateBtn.disabled = true; // 動畫開始時禁用按鈕

    // 產生 6 個一般號碼
    const regularNumbers = new Set();
    while (regularNumbers.size < 6) {
      regularNumbers.add(Math.floor(Math.random() * 38) + 1);
    }
    const finalRegularNumbers = Array.from(regularNumbers);

    // 產生 1 個特別號
    const specialNumber = Math.floor(Math.random() * 8) + 1;

    // 選取頁面上已存在的號碼球
    const balls = document.querySelectorAll(".number-ball");

    // 在動畫開始前，移除上一次的 settled 和 pulse 效果
    balls.forEach((ball) => {
      ball.classList.remove("settled");
      ball.style.animation = "none"; // 移除 pulse 動畫
      ball.textContent = ""; // 清空號碼
    });

    // 依序執行動畫
    for (let i = 0; i < finalRegularNumbers.length; i++) {
      await animateBall(balls[i], finalRegularNumbers[i], 38);
      await new Promise((resolve) => setTimeout(resolve, 200)); // 每個號碼球停止後延遲 200ms
    }
    await animateBall(balls[6], specialNumber, 8); // 對特別號執行動畫

    generateBtn.disabled = false; // 動畫結束後啟用按鈕
  };

  generateBtn.addEventListener("click", generateNumbers);

  // 頁面載入時，只顯示空的號碼球
  initializeBalls();
});
