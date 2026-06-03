let transactions = JSON.parse(localStorage.getItem('pastel_transactions')) || [];

const form = document.getElementById('transaction-form');
const txTitle = document.getElementById('tx-title');
const txAmount = document.getElementById('tx-amount');
const txCategory = document.getElementById('tx-category');
const transactionList = document.getElementById('transaction-list');
const filterCategory = document.getElementById('filter-category');

const totalBalanceEl = document.getElementById('total-balance');
const totalIncomeEl = document.getElementById('total-income');
const totalExpenseEl = document.getElementById('total-expense');

function formatRupiah(angka) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0
    }).format(angka);
}

function updateDashboard() {
    const income = transactions
        .filter(tx => tx.type === 'income')
        .reduce((sum, tx) => sum + tx.amount, 0);

    // Diperbaiki dari versi sebelumnya agar tidak crash
    const expense = transactions
        .filter(tx => tx.type === 'expense')
        .reduce((sum, tx) => sum + tx.amount, 0);

    const balance = income - expense;

    totalBalanceEl.innerText = formatRupiah(balance);
    totalIncomeEl.innerText = formatRupiah(income);
    totalExpenseEl.innerText = formatRupiah(expense);
}

function renderTransactions(filter = 'all') {
    transactionList.innerHTML = '';

    const filteredTransactions = filter === 'all' 
        ? transactions 
        : transactions.filter(tx => tx.category === filter);

    if (filteredTransactions.length === 0) {
        transactionList.innerHTML = `
            <div class="text-center py-8 bg-white rounded-2xl border border-dashed border-slate-200 text-slate-400 text-sm">
                🌸 Belum ada catatan transaksi untuk kategori ini.
            </div>
        `;
        return;
    }

    filteredTransactions.slice().reverse().forEach(tx => {
        const card = document.createElement('div');
        card.className = `transaction-card bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between transition-all hover:shadow-md mb-3`;

        const badgeColor = tx.type === 'income' ? 'bg-[#E8F5E9] text-[#2E7D32]' : 'bg-[#FFEBEE] text-[#C62828]';
        const sign = tx.type === 'income' ? '+' : '-';

        card.innerHTML = `
            <div class="flex items-center gap-3">
                <div class="px-2.5 py-1 rounded-xl text-xs font-semibold ${badgeColor}">
                    ${tx.category}
                </div>
                <div>
                    <h4 class="font-semibold text-sm text-slate-700">${tx.title}</h4>
                    <span class="text-[10px] text-slate-400">${tx.date}</span>
                </div>
            </div>
            <div class="flex items-center gap-4">
                <span class="font-bold text-sm ${tx.type === 'income' ? 'text-green-600' : 'text-red-500'}">
                    ${sign} ${formatRupiah(tx.amount)}
                </span>
                <button onclick="deleteTransaction(${tx.id})" class="text-slate-300 hover:text-red-400 transition-colors p-1 text-sm" title="Hapus">
                    🗑️
                </button>
            </div>
        `;
        transactionList.appendChild(card);
    });
}

form.addEventListener('submit', (e) => {
    e.preventDefault();

    const selectedType = document.querySelector('input[name="tx-type"]:checked').value;
    
    const newTransaction = {
        id: Date.now(), 
        title: txTitle.value.trim(),
        amount: parseFloat(txAmount.value),
        type: selectedType,
        category: txCategory.value,
        date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
    };

    transactions.push(newTransaction);
    
    saveData();
    
    form.reset();
    document.querySelector('input[value="income"]').checked = true;
});

window.deleteTransaction = function(id) {
    transactions = transactions.filter(tx => tx.id !== id);
    saveData();
}

filterCategory.addEventListener('change', (e) => {
    renderTransactions(e.target.value);
});

function saveData() {
    localStorage.setItem('pastel_transactions', JSON.stringify(transactions));
    updateDashboard();
    renderTransactions(filterCategory.value);
}

updateDashboard();
renderTransactions();