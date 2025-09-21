// public/js/main.js

document.addEventListener("DOMContentLoaded", () => {
  // --- Dark Mode Toggle Logic ---
  const htmlTag = document.documentElement;
  const toggleBtn = document.getElementById("darkModeToggle");

  let theme = localStorage.getItem("theme") || "light";
  applyTheme(theme);

  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      theme = theme === "light" ? "dark" : "light";
      localStorage.setItem("theme", theme);
      applyTheme(theme);
    });
  }

  function applyTheme(mode) {
    htmlTag.setAttribute("data-bs-theme", mode);
    document.body.classList.toggle("dark", mode === "dark");
    if (toggleBtn) {
      toggleBtn.innerText = (mode === "light") ? "🌙" : "☀️";
    }
  }

  // --- Logout Button Logic (เพิ่มส่วนนี้เข้ามา) ---
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault(); // ป้องกันไม่ให้ลิงก์ทำงานทันที

      Swal.fire({
        title: 'ต้องการออกจากระบบ?',
        text: "คุณจะต้องเข้าสู่ระบบใหม่อีกครั้ง",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'ใช่, ออกจากระบบ',
        cancelButtonText: 'ยกเลิก'
      }).then((result) => {
        if (result.isConfirmed) {
          // ถ้ายืนยัน ให้ไปที่ route logout
          window.location.href = '/auth/logout';
        }
      });
    });
  }
});