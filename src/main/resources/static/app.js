
let transactions = [];

const navLinks = document.querySelectorAll(".nav-link");
const pageContent = document.querySelector("#page-content");

const pages = {
    Dashboard: `
        <header class="topbar">
            <div>
                <h2>Dashboard</h2>
                <p>Your financial overview at a glance.</p>
            </div>
            <button class="add-button" id="dashboard-add-transaction">
                + Add Transaction
            </button>
        </header>

        <section class="welcome">
            <h2>Welcome back 👋</h2>
            <p>Here's what's happening with your money.</p>
        </section>

        <section class="summary-cards">
            <article class="card balance-card">
                <p>Total Balance</p>
                <h3 id="total-balance">₹0.00</h3>
                <span>Available balance</span>
            </article>
            <article class="card">
                <p>Total Income</p>
                <h3 id="total-income">₹0.00</h3>
                <span>Total recorded income</span>
            </article>
            <article class="card">
                <p>Total Expenses</p>
                <h3 id="total-expenses">₹0.00</h3>
                <span>Total recorded expenses</span>
            </article>
        </section>

        <section class="transactions card">
            <h3>Recent Transactions</h3>
            <div id="recent-transactions"></div>
        </section>
    `,

    Transactions: `
        <header class="topbar">
            <div>
                <h2>Transactions</h2>
                <p>Track where your money goes.</p>
            </div>
        </header>

        <section class="card">
            <h3>Add a Transaction</h3>

            <form id="transaction-form">
                <label for="description">Description</label>
                <input type="text" id="description"
                    placeholder="e.g. College lunch" required>

                <label for="amount">Amount (₹)</label>
                <input type="number" id="amount"
                    placeholder="e.g. 250" min="0.01"
                    step="0.01" required>

                <label for="type">Transaction Type</label>
                <select id="type" required>
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                </select>

                <label for="category">Category</label>
                <select id="category" required>
                    <option value="Food">Food</option>
                    <option value="Transport">Transport</option>
                    <option value="Education">Education</option>
                    <option value="Shopping">Shopping</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Salary">Salary</option>
                    <option value="Other">Other</option>
                </select>

                <button type="submit" class="add-button">
                    Add Transaction
                </button>
            </form>

            <p id="form-message" class="empty-state"></p>
            <div id="transaction-list"></div>
        </section>
    `,

    Budgets: `
        <header class="topbar">
            <div>
                <h2>Budgets</h2>
                <p>Plan your spending and stay on track.</p>
            </div>
        </header>

        <section class="card">
            <h3>Your Monthly Budget</h3>
            <p class="empty-state">
                Budget management is coming soon.
            </p>
        </section>
    `,

    Reports: `
        <header class="topbar">
            <div>
                <h2>Reports</h2>
                <p>Understand your financial habits.</p>
            </div>
        </header>

        <section class="card">
            <h3>Spending Reports</h3>
            <p class="empty-state">
                Detailed reports and charts are coming soon.
            </p>
        </section>
    `,

    Settings: `
        <header class="topbar">
            <div>
                <h2>Settings</h2>
                <p>Manage your SpendPal preferences.</p>
            </div>
        </header>

        <section class="card">
            <h3>Preferences</h3>
            <p class="empty-state">
                Account settings are coming soon.
            </p>
        </section>
    `
};

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

function formatMoney(amount) {
    return "₹" + Number(amount).toFixed(2);
}

function renderTransactionCards(target) {
    if (!target) return;

    if (transactions.length === 0) {
        target.innerHTML =
            '<p class="empty-state">No transactions yet. Add your first one!</p>';
        return;
    }

    target.innerHTML = [...transactions].reverse().map(transaction => `
        <div class="card" style="margin-top: 12px;">
            <strong>${escapeHTML(transaction.description)}</strong>
            <p>
                ${escapeHTML(transaction.category)}
                · ${escapeHTML(transaction.type)}
            </p>
            <h3>
                ${transaction.type === "income" ? "+" : "-"}${formatMoney(transaction.amount)}
            </h3>
        </div>
    `).join("");
}

function updateDashboardTotals() {
    const income = transactions
        .filter(transaction => transaction.type === "income")
        .reduce((total, transaction) =>
            total + Number(transaction.amount), 0);

    const expenses = transactions
        .filter(transaction => transaction.type === "expense")
        .reduce((total, transaction) =>
            total + Number(transaction.amount), 0);

    const balance = income - expenses;

    const balanceElement = document.querySelector("#total-balance");
    const incomeElement = document.querySelector("#total-income");
    const expensesElement = document.querySelector("#total-expenses");

    if (balanceElement) balanceElement.textContent = formatMoney(balance);
    if (incomeElement) incomeElement.textContent = formatMoney(income);
    if (expensesElement) expensesElement.textContent = formatMoney(expenses);

    renderTransactionCards(
        document.querySelector("#recent-transactions")
    );
}

function showPage(pageName) {
    if (!pages[pageName]) {
        console.error("Page not found:", pageName);
        return;
    }

    pageContent.innerHTML = pages[pageName];

    if (pageName === "Dashboard") {
        updateDashboardTotals();
    }

    if (pageName === "Transactions") {
        renderTransactionCards(
            document.querySelector("#transaction-list")
        );
    }
}

// Navigation
navLinks.forEach(link => {
    link.addEventListener("click", event => {
        event.preventDefault();

        const text = link.textContent.trim().toLowerCase();
        const pageName = Object.keys(pages).find(name =>
            text.includes(name.toLowerCase())
        );

        if (!pageName) {
            console.error("Could not identify navigation page:", text);
            return;
        }

        navLinks.forEach(item => item.classList.remove("active"));
        link.classList.add("active");

        showPage(pageName);
    });
});

// Dashboard shortcut
document.addEventListener("click", event => {
    if (event.target.closest("#dashboard-add-transaction")) {
        const transactionsLink = [...navLinks].find(link =>
            link.textContent.trim().toLowerCase().includes("transactions")
        );

        if (transactionsLink) transactionsLink.click();
    }
});

// Load saved transactions from Spring Boot / MySQL
async function loadTransactions() {
    try {
        const response = await fetch("/api/transactions");

        if (!response.ok) {
            throw new Error("Server returned " + response.status);
        }

        transactions = await response.json();

        const activeLink = document.querySelector(".nav-link.active");
        const activeText = activeLink
            ? activeLink.textContent.trim().toLowerCase()
            : "dashboard";

        const activePage = Object.keys(pages).find(name =>
            activeText.includes(name.toLowerCase())
        ) || "Dashboard";

        showPage(activePage);
    } catch (error) {
        console.error("Could not load transactions:", error);
    }
}

// Save new transactions to Spring Boot / MySQL
document.addEventListener("submit", async event => {
    if (event.target.id !== "transaction-form") return;

    event.preventDefault();

    const form = event.target;
    const description = document.querySelector("#description").value.trim();
    const amount = Number(document.querySelector("#amount").value);
    const type = document.querySelector("#type").value;
    const category = document.querySelector("#category").value;
    const message = document.querySelector("#form-message");

    if (!description || !Number.isFinite(amount) || amount <= 0) {
        message.textContent = "Enter a description and a valid amount.";
        return;
    }

    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    message.textContent = "Saving transaction...";

    try {
        const response = await fetch("/api/transactions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                description,
                amount,
                type,
                category
            })
        });

        if (!response.ok) {
            throw new Error("Server returned " + response.status);
        }

        const savedTransaction = await response.json();
        transactions.push(savedTransaction);

        form.reset();
        message.textContent = "Transaction saved successfully!";

        renderTransactionCards(
            document.querySelector("#transaction-list")
        );

        updateDashboardTotals();
    } catch (error) {
        console.error("Transaction save failed:", error);
        message.textContent =
            "Couldn't save transaction. Check Spring Boot and MySQL.";
    } finally {
        submitButton.disabled = false;
    }
});

// Start the app
showPage("Dashboard");
loadTransactions();
