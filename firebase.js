const firebaseConfig = {
  apiKey: "AIzaSyC2-9PeZ_MSJbAWnXTvbgfmpZUxRPLPxtM",
  authDomain: "investment-portfolio-tra-7e9e6.firebaseapp.com",
  databaseURL: "https://investment-portfolio-tra-7e9e6-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "investment-portfolio-tra-7e9e6",
  storageBucket: "investment-portfolio-tra-7e9e6.firebasestorage.app",
  messagingSenderId: "91598517271",
  appId: "1:91598517271:web:4c4c59bfcbc710abf49852",
  measurementId: "G-N2K94M60B1"
};

// Initialize Firebase (compat version)
firebase.initializeApp(firebaseConfig);

// Global references
const auth = firebase.auth();
const db = firebase.firestore();