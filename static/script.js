const slides = document.querySelectorAll(".slide");
const progressBar = document.getElementById('progress-bar');
const loadingSlide = document.getElementById("loading-slide");

let current = 0;
let app, ticketId, ticketData; // firebase

function saveField(id) {
  const el = document.getElementById(id);
  el.addEventListener("input", () => {
    localStorage.setItem(id, el.value);
  });
  const stored = localStorage.getItem(id);
  if (stored !== null) el.value = stored;
}

const fields = ["today", "tomorrow"];
fields.forEach(saveField);

function showError(message, input) {
  let errorMessage = document.createElement("div");
  errorMessage.classList.add("error-message");
  errorMessage.textContent = message;
  if (input.closest('.phone-group')) {
    input.closest('.phone-group').insertAdjacentElement("afterend", errorMessage);
  } else {
    input.insertAdjacentElement("afterend", errorMessage);
  }
  input.classList.add("error");
  setTimeout(() => errorMessage.classList.add("show"), 10);
}

function clearErrors() {
  document.querySelectorAll(".error-message").forEach(el => el.remove());
  document.querySelectorAll(".error").forEach(el => el.classList.remove("error"));
}

function validateSlide(index) {
  const inputs = slides[index].querySelectorAll("input, select");
  clearErrors();
  for (let input of inputs) {
    if (!input.value) {
      showError("This field is required", input);
      return false;
    }
  }
  return true;
}

function showSlide(nextIndex, animate = true) {
  if ((nextIndex < 0 || nextIndex >= slides.length || nextIndex === current) && animate) return;

  const progress = ((nextIndex) / (slides.length - 2)) * 100;
  progressBar.style.width = `${progress}%`;

  const direction = nextIndex > current ? 'forward' : 'backward';

  slides.forEach(slide => {
    slide.classList.remove("active", "out-left", "in-right", "out-right", "in-left");
    slide.style.zIndex = 0;
  });

  const currentSlide = slides[current];
  const nextSlide = slides[nextIndex];

  if (animate) {
    if (direction === 'forward') {
      currentSlide.classList.add("out-left");
      nextSlide.classList.add("in-right");
    } else {
      currentSlide.classList.add("out-right");

      for (let i = nextIndex - 1; i >= 0; i--) {
        slides[i].classList.add("out-left");
      }
    }
  }

  nextSlide.classList.add("active");
  nextSlide.style.zIndex = 2;
  current = nextIndex;

  if (animate) {
    localStorage.setItem("currentSlide", current);
  }
}

function next() {
  if (!validateSlide(current)) return;
  showSlide(current + 1);
}

function back() {
  showSlide(current - 1);
}

function calculate() {
  if (!validateSlide(current)) return;
  const todayState = document.getElementById("today").value === "0";
  const today = new Date();
  const tomorrow = new Date(document.getElementById("tomorrow").value);
  const ampmState = (((tomorrow.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)).toFixed() % 2) === 0;

  let ampm;

  if (ampmState) {
    ampm = todayState ? "AM" : "PM";
  } else {
    ampm = todayState ? "PM" : "AM";
  }

  const result = `Ah eh lakan 7aykoon nharek ${ampm} yom ${tomorrow.getDate()}/${tomorrow.getMonth()}!`;
  document.getElementById("result").innerText = result;
  localStorage.setItem("result", result)
  next();
}

function setButtonLoading(isLoading) {
  const btn = document.getElementById("submitBtn");
  const text = btn.querySelector(".btn-text");
  const loader = btn.querySelector(".btn-loader");

  btn.disabled = isLoading;
  text.style.visibility = isLoading ? "hidden" : "visible";
  loader.hidden = !isLoading;
}

async function restart() {
  setButtonLoading(true);
  localStorage.clear();

  setTimeout(() => {
    showSlide(0);
    setButtonLoading(false);
  }, 500);
}

// Restore slide on page load
window.addEventListener("DOMContentLoaded", async () => {
  document.getElementById("result").innerText = localStorage.getItem("result");
  showSlide(0, false); // show loader

  let savedSlide = Math.max(parseInt(localStorage.getItem("currentSlide")) || 0, 1);
  console.log(savedSlide);

  if (savedSlide >= 0 && savedSlide < slides.length) {
    showSlide(savedSlide, false);

    for (let i = savedSlide - 1; i >= 0; i--) {
      slides[i].classList.add("out-left");
    }
  }
});