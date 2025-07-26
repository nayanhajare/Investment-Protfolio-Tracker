const chartColors = ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", "#f0ad4e", "#5cb85c", "#d9534f"];
let pieChartInstance, lineChartInstance;


auth.onAuthStateChanged(async (user) => {
  
 
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  const userDoc = await db.collection("users").doc(user.uid).get();
  const userData = userDoc.data();
  const email = userData?.email || user.email;
  const role = userData?.role || "user";

  document.getElementById("userEmail").innerHTML = `
    ${email} <span class="badge bg-${role === "admin" ? "danger" : "info"}">${role}</span>
  `;
  document.getElementById(role === "admin" ? "adminSection" : "userSection").style.display = "block";

  loadAssets(user.uid);
  loadDashboardData();
});

document.getElementById("logoutBtn").addEventListener("click", () => {
  auth.signOut().then(() => {
    showToast("Logged out successfully!", "success");
    window.location.href = "login.html";
  });
});
// show and hide spinner
function showSpinner() {
  document.getElementById("loadingSpinner").style.display = "flex";
}
function hideSpinner() {
  document.getElementById("loadingSpinner").style.display = "none";
}

async function loadDashboardData() {
  showSpinner();
  try {
    await new Promise(resolve => setTimeout(resolve, 1500));
  } catch (err) {
    console.error("Error loading dashboard", err);
  } finally {
    hideSpinner();
  }
}

async function addAsset() {
  const user = auth.currentUser;
  if (!user) return;

  const nameInput = document.getElementById("assetName");
  const quantityInput = document.getElementById("quantity");
  const priceInput = document.getElementById("price");

  const name = nameInput.value.trim().toLowerCase().replace(/\s+/g, "-");
  const quantity = parseFloat(quantityInput.value);
  let price = parseFloat(priceInput.value);

  if (!name || isNaN(quantity)) {
    showToast("Please enter a valid asset name and quantity.");
    return;
  }
  // duplication of asset
  const existingAssets = await db.collection("users").doc(user.uid).collection("assets").where("name", "==", name).get();
  if (!existingAssets.empty) {
    showToast("Asset already exists. Edit it instead.");
    return;
  }

  if (!price) {
    try {
      const liveName = getCoinGeckoId(name);
      const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${liveName}&vs_currencies=inr`);
      const data = await response.json();
      price = data[liveName]?.inr;
      if (!price) throw new Error();
    } catch {
      showToast("Failed to fetch price. Please enter manually.");
      return;
    }
  }

  db.collection("users").doc(user.uid).collection("assets").add({
    name,
    quantity,
    price,
    initialPrice: price,
    // 
    dateAdded: firebase.firestore.FieldValue.serverTimestamp()
  }).then(() => {
    showToast("Asset added!", "success");
    loadAssets(user.uid);
    nameInput.value = "";
    quantityInput.value = "";
    priceInput.value = "";
  }).catch(err => {
    console.error("Error adding asset:", err);
    showToast(err.message, "error");
  });
}
// load assets for the pie chat and line chart
function loadAssets(uid) {
  db.collection("users").doc(uid).collection("assets").get().then(snapshot => {
    const container = document.getElementById("assetsContainer");
    container.innerHTML = "";

    let totalValue = 0;
    let pieLabels = [], pieData = [], lineLabels = [], lineData = [];
    const assets = [];

    const sorted = snapshot.docs.sort((a, b) => {
      const valA = a.data().price * a.data().quantity;
      const valB = b.data().price * b.data().quantity;
      return valB - valA;
    });

    if (sorted.length === 0) {
      container.innerHTML = "<p class='text-center text-muted'>No assets yet. Add your first one!</p>";
    }

    sorted.forEach(doc => {
      const asset = doc.data();
      assets.push({
        amount: asset.quantity,
        buyPrice: asset.initialPrice,
        currentPrice: asset.price
      });

      const gainLoss = asset.initialPrice
        ? ((asset.price - asset.initialPrice) / asset.initialPrice) * 100
        : 0;
      const gainLossClass = gainLoss >= 0 ? "text-success" : "text-danger";
      const assetValue = asset.quantity * asset.price;
      totalValue += assetValue;

      pieLabels.push(asset.name);
      pieData.push(assetValue);
      lineLabels.push(asset.name);
      lineData.push(asset.price);

      const div = document.createElement("div");
      div.className = "card p-3 mb-2";
      div.innerHTML = `
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <strong>${asset.name.charAt(0).toUpperCase() + asset.name.slice(1)}</strong><br>
            Price: ₹${asset.price} <br>
            Gain/Loss: <span class="${gainLossClass}">${gainLoss >= 0 ? '+' : ''}${gainLoss.toFixed(2)}%</span> <br>
            Total: ₹${assetValue.toFixed(2)}
          </div>
          <div>
            <button class="btn btn-sm btn-primary me-2" onclick="editAsset('${doc.id}', ${asset.quantity}, ${asset.price})">Edit</button>
            <button class="btn btn-sm btn-danger" onclick="deleteAsset('${doc.id}')">Delete</button>
          </div>
        </div>
      `;
      container.appendChild(div);
    });

    renderCharts(pieLabels, pieData, lineLabels, lineData);
    document.getElementById("totalValueDisplay").innerText = `Total Portfolio Value: ₹${totalValue.toFixed(2)}`;
    updatePortfolioSummary(assets);
  });
}
// total ivested -- current value -- net gain/loss
function updatePortfolioSummary(assets) {
  let totalInvested = 0;
  let currentValue = 0;

  assets.forEach(asset => {
    const amount = asset.amount || 0;
    const buyPrice = typeof asset.buyPrice === "number" ? asset.buyPrice : 0;
    const currentPrice = typeof asset.currentPrice === "number" ? asset.currentPrice : 0;

    totalInvested += amount * buyPrice;
    currentValue += amount * currentPrice;
  });

  const net = currentValue - totalInvested;
  const percent = totalInvested === 0 ? 0 : (net / totalInvested) * 100;

  document.getElementById("totalInvested").textContent = `₹${totalInvested.toFixed(2)}`;
  document.getElementById("currentValue").textContent = `₹${currentValue.toFixed(2)}`;

  const gainLossEl = document.getElementById("netGainLoss");
  gainLossEl.textContent = `₹${net.toFixed(2)} (${percent.toFixed(2)}%)`;
// color for gain and loss
  gainLossEl.classList.remove("green", "red", "neutral");
  if (percent > 0) gainLossEl.classList.add("green");
  else if (percent < 0) gainLossEl.classList.add("red");
  else gainLossEl.classList.add("neutral");
}

// edit asset
function editAsset(id, quantity, price) {
  document.getElementById("editAssetId").value = id;
  document.getElementById("editQuantity").value = quantity;
  document.getElementById("editPrice").value = price;
  document.getElementById("editAssetModal").classList.remove("hidden");
}
// edit inside save button
async function saveEditAsset() {
  const uid = auth.currentUser?.uid;
  const id = document.getElementById("editAssetId").value;
  const quantity = parseFloat(document.getElementById("editQuantity").value);
  const price = parseFloat(document.getElementById("editPrice").value);

  if (!uid || !id || isNaN(quantity) || isNaN(price)) {
    showToast("Please fill valid details.");
    return;
  }

  try {
    await db.collection("users").doc(uid).collection("assets").doc(id).update({ quantity, price });
    showToast("Asset updated.", "success");
    closeEditModal();
    loadAssets(uid);
  } catch (err) {
    console.error(err);
    showToast(err.message, "error");
  }
}
// edit inside close button
function closeEditModal() {
  document.getElementById("editAssetModal").classList.add("hidden");
  document.getElementById("editAssetId").value = "";
  document.getElementById("editQuantity").value = "";
  document.getElementById("editPrice").value = "";
}
// delete asset
function deleteAsset(docId) {
  const uid = auth.currentUser.uid;
  if (!uid) return;

  if (confirm("Are you sure you want to delete this asset?")) {
    db.collection("users").doc(uid).collection("assets").doc(docId).delete()
      .then(() => {
        showToast("Asset deleted.", "success");
        loadAssets(uid);
      }).catch((err) => {
        console.error("Error deleting asset:", err);
        showToast(err.message, "error");
      });
  }
}
// refresh prices
async function refreshAllPrices() {
  const uid = auth.currentUser.uid;
  if (!uid) return;

  const assetsRef = db.collection("users").doc(uid).collection("assets");
  const snapshot = await assetsRef.get();
  const updates = [], names = [];

  snapshot.forEach(doc => {
    const asset = doc.data();
    const coinId = getCoinGeckoId(asset.name);
    names.push(coinId);
    updates.push({ id: doc.id, coinId });
  });

  showSpinner();
  try {
    const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${names.join(",")}&vs_currencies=inr`);
    const priceData = await response.json();

    const batch = db.batch();
    updates.forEach(item => {
      const newPrice = priceData[item.coinId]?.inr;
      if (newPrice) {
        const docRef = assetsRef.doc(item.id);
        batch.update(docRef, { price: newPrice });
      }
    });

    await batch.commit();
    showToast("Prices refreshed!", "success");
    loadAssets(uid);
  } catch (error) {
    console.error("Failed to refresh prices:", error);
    showToast("Error refreshing prices.", "error");
  } finally {
    hideSpinner();
  }
}
// render charts
// Pie chart and line chart rendering
function renderCharts(pieLabels, pieData, lineLabels, lineData) {
  if (pieChartInstance) pieChartInstance.destroy();
  if (lineChartInstance) lineChartInstance.destroy();

  if (!document.getElementById("pieChart") || !document.getElementById("lineChart")) return;

  pieChartInstance = new Chart(document.getElementById("pieChart"), {
    type: "pie",
    data: {
      labels: pieLabels,
      datasets: [{ data: pieData, backgroundColor: chartColors }]
    },
    options: { animation: { duration: 1000, easing: "easeOutQuart" } }
  });

  lineChartInstance = new Chart(document.getElementById("lineChart"), {
    type: "line",
    data: {
      labels: lineLabels,
      datasets: [{
        label: "Asset Prices",
        data: lineData,
        borderColor: "#36A2EB",
        fill: false
      }]
    },
    options: { animation: { duration: 1000, easing: "easeOutCubic" } }
  });
}

function filterAssets() {
  const query = document.getElementById("searchInput").value.toLowerCase();
  const cards = document.querySelectorAll("#assetsContainer .card");

  cards.forEach(card => {
    const text = card.innerText.toLowerCase();
    card.style.display = text.includes(query) ? "block" : "none";
  });
}

function getCoinGeckoId(name) {
  const map = {
    bitcoin: "bitcoin",
    ethereum: "ethereum",
    solana: "solana",
    dogecoin: "dogecoin",
    cardano: "cardano",
    ripple: "ripple",
    polkadot: "polkadot",
    litecoin: "litecoin"
  };
  return map[name.toLowerCase()] || name.toLowerCase().replace(/\s+/g, "-");
}

// Dark mode toggle persistence
const toggle = document.getElementById("darkToggle");
toggle.addEventListener("change", () => {
  document.body.classList.toggle("dark-mode", toggle.checked);
  localStorage.setItem("darkMode", toggle.checked);
});

window.addEventListener("DOMContentLoaded", () => {
  const darkPref = localStorage.getItem("darkMode") === "true";
  toggle.checked = darkPref;
  document.body.classList.toggle("dark-mode", darkPref);
});

// export CSV functionality
document.getElementById("exportCsvBtn").addEventListener("click", exportCSV);
function exportCSV() {
  const uid = auth.currentUser?.uid;
  if (!uid) return;

  db.collection("users").doc(uid).collection("assets").get().then(snapshot => {
    let csv = "Name,Quantity,Price,Initial Price,Gain/Loss %,Total Value,Date Added\n";
    let totalInvested = 0;
    let totalCurrent = 0;

    snapshot.forEach(doc => {
      const d = doc.data();
      const gainLoss = d.initialPrice
        ? ((d.price - d.initialPrice) / d.initialPrice) * 100
        : 0;
      const totalValue = d.quantity * d.price;
      const invested = d.quantity * d.initialPrice;
      const date = d.dateAdded?.toDate().toLocaleString() || "N/A";

      totalCurrent += totalValue;
      totalInvested += invested;

      csv += `${d.name},${d.quantity},${d.price},${d.initialPrice},${gainLoss.toFixed(2)}%,${totalValue.toFixed(2)},${date}\n`;
    });

    csv += "\nTotal Invested," + totalInvested.toFixed(2) + "\n";
    csv += "Total Current Value," + totalCurrent.toFixed(2) + "\n";
    csv += "Net Gain/Loss," + ((totalCurrent - totalInvested).toFixed(2)) + ` (${totalInvested === 0 ? 0 : ((totalCurrent - totalInvested) / totalInvested * 100).toFixed(2)}%)`;

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "portfolio.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });
}

const assetNameInput = document.getElementById("assetName");
const suggestionsContainer = document.getElementById("suggestions");

let coinList = [];

// Fetch coin list from CoinGecko
async function fetchCoinList() {
  try {
    const response = await fetch("https://api.coingecko.com/api/v3/coins/list");
    const data = await response.json();
    coinList = data;
  } catch (error) {
    console.error("Error fetching coin list:", error);
  }
}

// Filter and show suggestions
assetNameInput.addEventListener("input", () => {
  const query = assetNameInput.value.toLowerCase();
  suggestionsContainer.innerHTML = "";

  if (query.length < 2) {
    suggestionsContainer.style.display = "none";
    return;
  }

  const filtered = coinList.filter(coin =>
    coin.name.toLowerCase().includes(query) || coin.symbol.toLowerCase().includes(query)
  ).slice(0, 5); // Limit to 5 suggestions

  if (filtered.length === 0) {
    suggestionsContainer.style.display = "none";
    return;
  }

  filtered.forEach(coin => {
    const div = document.createElement("div");
    div.classList.add("suggestion-item");
    div.textContent = `${coin.name} (${coin.symbol.toUpperCase()})`;
    div.addEventListener("click", () => {
      assetNameInput.value = coin.name;
      suggestionsContainer.innerHTML = "";
      suggestionsContainer.style.display = "none";
    });
    suggestionsContainer.appendChild(div);
  });

  suggestionsContainer.style.display = "block";
});

// Close suggestions on outside click
document.addEventListener("click", (e) => {
  if (!suggestionsContainer.contains(e.target) && e.target !== assetNameInput) {
    suggestionsContainer.style.display = "none";
  }
});

// Call on load
fetchCoinList();


// toast notification
function showToast(message, type = "success") {
  const toast = document.createElement("div");
  toast.classList.add("toast", type);
  toast.textContent = message;

  const container = document.getElementById("toastContainer");
  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000); // 3 seconds
}



