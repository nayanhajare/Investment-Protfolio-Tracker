
# 💼 Investment Portfolio Tracker

## 🚀 Introduction
The Investment Portfolio Tracker is a full-featured web application that allows users to track, manage, and analyze their investment assets in real time. It supports live asset price updates via API, user/admin roles, beautiful charts, dark mode, and personalized asset tracking — all in one intuitive dashboard.

## Netlify Link
https://nayan-investmentportfoliotracker.netlify.app/dashboard.html

## 📦 Project Type
**Fullstack Web Application**  
- Frontend: HTML, CSS, JavaScript  
- Backend: Firebase Firestore & Authentication  
- External API: CoinGecko for live asset prices

## 🔗 Deployed App
- **Frontend**: https://nayan-investmentportfoliotracker.netlify.app/dashboard.html
- **Firebase Auth**: https://console.firebase.google.com/u/0/project/investment-portfolio-tra-7e9e6/authentication/users
- **Database**: https://console.firebase.google.com/u/0/project/investment-portfolio-tra-7e9e6/overview

## 📁 Directory Structure
```
investment-portfolio-tracker/
├── index.html
├── login.html
├── signup.html
├── style/
│   ├── style.css
│   └── auth.css
├── script/
│   ├── dashboard.js
│   ├── login.js
│   └── signup.js
├── firebase.js
├── assets/
│   └── icons, images, etc.
```

## 🎥 Video Walkthroughs
- **App Features**: 

- **Codebase Overview**: 

https://docs.google.com/document/d/1MCyzOuMQ0MOu1TGfzMOcb3b6ZAKTTdIeknAwlZhy0V0/edit?usp=sharing

 Project Based Question Overview : https://youtu.be/zG8cfowsKz8

project Overview and Features 🚀 : https://youtu.be/dJkFRNyM0uk

Investment Portfolio Website Walkthrough 🚀: https://youtu.be/SmppTg4KIpE

## ✨ Features
- 🔐 Firebase Auth (Login, Signup, Logout)
- 📊 Live Asset Price Tracking via CoinGecko API
- 🗃️ Firestore Database Integration
- 📈 Interactive Chart.js Visualizations
- 💡 Dark Mode with Persistent Toggle
- ✏️ Add/Edit/Delete Assets with Custom Modal
- 🔎 Real-time Search + Auto Suggestions
- 📥 CSV Export of Asset Data
- 📉 Profit/Loss Summary with Live Color Coding
- 📱 Fully Responsive Layout with Smooth Animations
- ⚠️ Toast Notifications for Actions
- ❌ Duplicate Asset Prevention
- 🕓 Asset Timestamping (Date Added)

## 🧠 Design Decisions & Assumptions
- Used Firebase for quick authentication and cloud-based data storage.
- Role-based UI rendering: admin and user see different panels.
- Assumed asset names are available through CoinGecko for auto-suggestion.
- Responsive mobile-first layout with minimal libraries for fast load times.

## ⚙️ Installation & Getting Started
To run the app locally:

```bash
git clone https://github.com/your-repo/investment-portfolio-tracker.git
cd investment-portfolio-tracker
# Open index.html in your browser or use Live Server (VS Code extension)
```

To connect Firebase:
1. Create a Firebase project.
2. Enable **Authentication** (Email/Password).
3. Create a Firestore database.
4. Copy Firebase config into `firebase.js`.

```js
// firebase.js
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  ...
};
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
```

## 👨‍💻 Usage
- **Signup/Login** with email and password.
- Add your assets with quantity and price.
- View auto-calculated gain/loss, current value, and charts.
- Admins can see additional analytics and user stats.
- Use the sidebar to navigate through pages.
- Toggle dark mode via the moon icon.

## 🔑 Credentials (for testing)
```bash
Admin: nayanhajare2108@gmail.com / password: 123456
User: fi@gmail.com / password: 123456
```

## 🌐 APIs Used
- [CoinGecko API](https://www.coingecko.com/en/api) — For fetching live asset prices and suggestions.

## 📡 API Endpoints (if applicable)
_N/A — Firebase handles backend operations._

## 🛠 Technology Stack
- **HTML5**, **CSS3**, **JavaScript (ES6)**
- **Firebase Auth & Firestore**
- **Chart.js**
- **CoinGecko API**
- **Font Awesome & Material Icons**

---

### 🧹 Future Improvements
- Add Two-Factor Authentication
- Add Monthly/Yearly analytics in Reports
- Support for different currency conversions
- Pagination or infinite scroll in asset list
