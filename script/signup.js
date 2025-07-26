document.getElementById("signupForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const pass = document.getElementById("password").value;
    const role = document.getElementById("role").value;
  
    try {
      const res = await auth.createUserWithEmailAndPassword(email, pass);
      await db.collection("users").doc(res.user.uid).set({ email, role });
      alert("Signup successful!");
      window.location.href = "login.html";
    } catch (err) {
      alert(err.message);
    }
  });
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

  // await db.collection("users").doc(user.uid).set({
  //   email: user.email,
  //   role: "user"
  // }, { merge: true });