document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const pass = document.getElementById("password").value;
  
    try {
      const res = await auth.signInWithEmailAndPassword(email, pass);
      const userDoc = await db.collection("users").doc(res.user.uid).get();
      const role = userDoc.exists ? userDoc.data().role : "user";
  
      localStorage.setItem("userRole", role);
      window.location.href = "dashboard.html";
    } catch (err) {
      alert(err.message);
    }
  });

  if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark-mode");
  }
  const toggle = document.getElementById('darkToggle');
  toggle.addEventListener('change', () => {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('auth-dark-mode', document.body.classList.contains('dark-mode'));
  });

  // Load dark mode state on refresh
  window.addEventListener('DOMContentLoaded', () => {
    const darkPref = localStorage.getItem('auth-dark-mode') === 'true';
    if (darkPref) {
      document.body.classList.add('dark-mode');
      toggle.checked = true;
    }
  });



  