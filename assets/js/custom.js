document.addEventListener("DOMContentLoaded", () => {

  // Slideriai
  const sliders = [
    { slider: "slider1", value: "slider1-value" },
    { slider: "slider2", value: "slider2-value" },
    { slider: "slider3", value: "slider3-value" }
  ];

  sliders.forEach(s => {
    const slider = document.getElementById(s.slider);
    const output = document.getElementById(s.value);

    if (slider && output) {
      output.textContent = slider.value;
      slider.addEventListener("input", () => {
        output.textContent = slider.value;
      });
    }
  });

  // Regex
  const nameRegex = /^[A-Za-zÀ-ž\s'-]{2,}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^\+370-6-\d{3}-\d{4}$/;

  // Forma
  const form = document.getElementById("contactForm");
  const successMessage = document.getElementById("form-success");
  const submitBtn = document.getElementById("submitBtn");

  // Funkcija tikrinti formą realiu laiku
  function validateFormLive() {
    const firstName = document.getElementById("first_name").value;
    const lastName = document.getElementById("last_name").value;
    const email = document.getElementById("email").value;
    const phone = document.getElementById("phone").value;

    const valid =
      nameRegex.test(firstName) &&
      nameRegex.test(lastName) &&
      emailRegex.test(email) &&
      phoneRegex.test(phone);

    if (valid) {
      submitBtn.disabled = false;
      submitBtn.classList.remove("disabled-btn");
    } else {
      submitBtn.disabled = true;
      submitBtn.classList.add("disabled-btn");
    }
  }

  // Tikrinimas realiu laiku
  document.querySelectorAll("#first_name, #last_name, #email, #phone").forEach(input => {
    input.addEventListener("input", validateFormLive);
  });

  // Formos siuntimas
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    // Jei mygtukas neaktyvus — neatlikti submit
    if (submitBtn.disabled) return;

    const firstName = document.getElementById("first_name");
    const lastName = document.getElementById("last_name");
    const email = document.getElementById("email");
    const phone = document.getElementById("phone");
    const address = document.getElementById("address");

    // paslepti klaidas
    document.querySelectorAll("small").forEach(el => el.classList.add("d-none"));

    let isValid = true;

    if (!nameRegex.test(firstName.value)) {
      document.getElementById("error-firstname").classList.remove("d-none");
      isValid = false;
    }
    if (!nameRegex.test(lastName.value)) {
      document.getElementById("error-lastname").classList.remove("d-none");
      isValid = false;
    }
    if (!emailRegex.test(email.value)) {
      document.getElementById("error-email").classList.remove("d-none");
      isValid = false;
    }
    if (!phoneRegex.test(phone.value)) {
      document.getElementById("error-phone").classList.remove("d-none");
      isValid = false;
    }

    if (!isValid) return;

    // Apskaičiuoti vidurkį
    const q1 = Number(document.getElementById("slider1").value);
    const q2 = Number(document.getElementById("slider2").value);
    const q3 = Number(document.getElementById("slider3").value);
    const average = ((q1 + q2 + q3) / 3).toFixed(1);

    console.log("Formos duomenys:");
    console.log(`Vardas: ${firstName.value}`);
    console.log(`Pavardė: ${lastName.value}`);
    console.log(`El. paštas: ${email.value}`);
    console.log(`Telefonas: ${phone.value}`);
    console.log(`Adresas: ${address.value}`);
    console.log(`Vidurkis: ${average}`);

    successMessage.classList.remove("d-none");

    form.reset();

    sliders.forEach(s => {
      const slider = document.getElementById(s.slider);
      const output = document.getElementById(s.value);
      slider.value = 5;
      output.textContent = 5;
    });

    // Išjungiam mygtuką po reset
    submitBtn.disabled = true;
    submitBtn.classList.add("disabled-btn");
  });

});

// Telefonas — formatavimas
const phoneInput = document.getElementById("phone");

if (phoneInput) {
  phoneInput.addEventListener("focus", function () {
    if (phoneInput.value.trim() === "") {
      phoneInput.value = "+370-6-";
    }
  });

  phoneInput.addEventListener("input", function () {
    let raw = phoneInput.value.replace(/\D/g, "");

    if (raw.length < 4) {
      phoneInput.value = "";
      return;
    }

    if (!raw.startsWith("3706")) {
      raw = "3706";
    }

    raw = raw.substring(0, 11);

    let formatted = "+370-6";

    if (raw.length > 4) formatted += "-" + raw.substring(4, 7);
    if (raw.length > 7) formatted += "-" + raw.substring(7, 11);

    phoneInput.value = formatted;

  });

  phoneInput.addEventListener("keydown", function (e) {
    if (
      phoneInput.value.startsWith("+370-6-") &&
      phoneInput.selectionStart <= 7 &&
      (e.key === "Backspace" || e.key === "Delete")
    ) {
      e.preventDefault();
    }
  });

  phoneInput.addEventListener("blur", function () {
    if (phoneInput.value === "+370-6-") {
      phoneInput.value = "";
    }
  });
}

// ----------------------------
// ATMINIMO ŽAIDIMAS
// ----------------------------
const icons = ["🔥", "⭐", "🍀", "🎵", "🎮", "⚡"];

let gameBoard = document.getElementById("game-board");
let movesText = document.getElementById("moves");
let matchesText = document.getElementById("matches");
let winMessage = document.getElementById("win-message");
let timerText = document.getElementById("timer");
let bestEasyText = document.getElementById("best-easy");
let bestHardText = document.getElementById("best-hard");

let firstCard = null;
let secondCard = null;
let lockBoard = false;
let moves = 0;
let matches = 0;

let timerInterval = null;
let secondsPassed = 0;

document.getElementById("startBtn").addEventListener("click", startGame);
document.getElementById("resetBtn").addEventListener("click", startGame);
document.getElementById("difficulty").addEventListener("change", startGame);

// ----------------------------
// LOCALSTORAGE – geriausių rezultatų įkėlimas
// ----------------------------
function loadBestScores() {
    const bestEasy = localStorage.getItem("best-easy");
    const bestHard = localStorage.getItem("best-hard");

    bestEasyText.textContent = bestEasy ? bestEasy + " ėjimų" : "–";
    bestHardText.textContent = bestHard ? bestHard + " ėjimų" : "–";
}

loadBestScores();

// ----------------------------
// LAIKMATIS
// ----------------------------
function startTimer() {
    clearInterval(timerInterval);
    secondsPassed = 0;
    timerText.textContent = "00:00";

    timerInterval = setInterval(() => {
        secondsPassed++;
        timerText.textContent = formatTime(secondsPassed);
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
}

function formatTime(sec) {
    let m = Math.floor(sec / 60);
    let s = sec % 60;
    return (m < 10 ? "0" : "") + m + ":" + (s < 10 ? "0" : "") + s;
}

// ----------------------------
// START / RESET
// ----------------------------
function startGame() {
    const difficulty = document.getElementById("difficulty").value;

    moves = 0;
    matches = 0;
    movesText.textContent = moves;
    matchesText.textContent = matches;
    winMessage.textContent = "";
    timerText.textContent = "00:00";
    stopTimer();

    let pairs = [...icons, ...icons];

    if (difficulty === "easy") {
        pairs = pairs.slice(0, 12);
        gameBoard.style.gridTemplateColumns = "repeat(4, 100px)";
    } else {
        pairs = [...icons, ...icons, ...icons, ...icons].slice(0, 24);
        gameBoard.style.gridTemplateColumns = "repeat(6, 100px)";
    }

    gameBoard.innerHTML = "";
    pairs = shuffle(pairs);

    pairs.forEach(icon => {
        const card = document.createElement("div");
        card.classList.add("card");
        card.dataset.icon = icon;
        card.textContent = "?";

        card.addEventListener("click", flipCard);
        gameBoard.appendChild(card);
    });

    startTimer();
}

function shuffle(array) {
    return array.sort(() => Math.random() - 0.5);
}

// ----------------------------
// KORTELIŲ LOGIKA
// ----------------------------
function flipCard() {
    if (lockBoard) return;
    if (this.classList.contains("flipped")) return;

    this.classList.add("flipped");
    this.textContent = this.dataset.icon;

    if (!firstCard) {
        firstCard = this;
        return;
    }

    secondCard = this;
    moves++;
    movesText.textContent = moves;
    checkMatch();
}

function checkMatch() {
    if (firstCard.dataset.icon === secondCard.dataset.icon) {
        firstCard.classList.add("matched");
        secondCard.classList.add("matched");

        matches++;
        matchesText.textContent = matches;

        resetTurn();

        if (document.querySelectorAll(".matched").length === document.querySelectorAll(".card").length) {
            stopTimer();
            winMessage.textContent = "🎉 Laimėjote!";
            saveBestScore();
        }
    } else {
        lockBoard = true;
        setTimeout(() => {
            firstCard.classList.remove("flipped");
            secondCard.classList.remove("flipped");
            firstCard.textContent = "?";
            secondCard.textContent = "?";
            resetTurn();
        }, 1000);
    }
}

function resetTurn() {
    firstCard = null;
    secondCard = null;
    lockBoard = false;
}

// ----------------------------
// LOCALSTORAGE – rezultatų saugojimas
// ----------------------------
function saveBestScore() {
    const difficulty = document.getElementById("difficulty").value;
    
    const key = difficulty === "easy" ? "best-easy" : "best-hard";
    const currentBest = localStorage.getItem(key);

    if (!currentBest || moves < currentBest) {
        localStorage.setItem(key, moves);
        loadBestScores();
    }
}


