// State Penyimpanan Utama (Web Storage API)
let transactions = JSON.parse(localStorage.getItem('pastel_transactions')) || [];

// Element Penunjang Halaman Konten & Navigasi
const form = document.getElementById('transaction-form');
const txTitle = document.getElementById('tx-title');
const txAmount = document.getElementById('tx-amount');
const txCategory = document.getElementById('tx-category');
const searchInput = document.getElementById('search-input');

// Elemen Pisah List Kriteria Tugas
const incomeList = document.getElementById('incomeList');
const expenseList = document.getElementById('expenseList');

// Elemen Rekapitulasi Dashboard
const totalBalanceEl = document.getElementById('total-balance');
const totalIncomeEl = document.getElementById('total-income');
const totalExpenseEl = document.getElementById('total-expense');
const countIncomeEl = document.getElementById('count-income');
const countExpenseEl = document.getElementById('count-expense');

// ==========================================
// 🛠️ FUNGSI ROUTING UTAMA (PINDAH PAGE SECARA INTERAKTIF)
// ==========================================
window.switchPage = function(targetPageId) {
    // Sembunyikan semua section kontemen halaman
    const pages = document.querySelectorAll('.page-content');
    pages.forEach(page => page.classList.add('hidden'));

    // Tampilkan halaman target yang dipilih
    document.getElementById(targetPageId).classList.remove('hidden');

    // Perbarui gaya aktif menu tombol di Sidebar kiri
    const menuButtons = document.querySelectorAll('.nav-menu-btn');
    menuButtons.forEach(btn => {
        btn.classList.remove('bg-white/20', 'text-white');
        btn.classList.add('text-purple-100', 'hover:bg-white/10');
    });

    // Pasang gaya aktif pada tombol yang sedang diakses
    const activeMenuId = 'menu-' + targetPageId.replace('page-', '');
    const activeBtn = document.getElementById(activeMenuId);
    if(activeBtn) {
        activeBtn.classList.add('bg-white/20', 'text-white');
    }
}

// Format Angka Otomatis ke Rupiah
function formatRupiah(angka) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0
    }).format(angka);
}

// Perbarui Ringkasan Finansial di Halaman Dashboard
function updateDashboard() {
    const income = transactions.filter(tx => tx.type === 'income').reduce((sum, tx) => sum + tx.amount, 0);
    const expense = transactions.filter(tx => tx.type === 'expense').reduce((sum, tx) => sum + tx.amount, 0);
    const balance = income - expense;

    totalBalanceEl.innerText = formatRupiah(balance);
    totalIncomeEl.innerText = formatRupiah(income);
    totalExpenseEl.innerText = formatRupiah(expense);
}

// Merender Seluruh Riwayat Data (Dengan Filter Judul, Pemisah List, & Grup Tanggal)
function renderTransactions(searchQuery = '') {
    incomeList.innerHTML = '';
    expenseList.innerHTML = '';

    // Filter teks judul (Kriteria 3)
    const filtered = transactions.filter(tx => 
        tx.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const incomeTransactions = filtered.filter(tx => tx.type === 'income');
    const expenseTransactions = filtered.filter(tx => tx.type === 'expense');

    countIncomeEl.innerText = `(${incomeTransactions.length})`;
    countExpenseEl.innerText = `(${expenseTransactions.length})`;

    // Helper: Pengelompokan Data Per Tanggal
    function groupTransactionsByDate(txList) {
        return txList.reduce((groups, tx) => {
            const date = tx.date;
            if (!groups[date]) groups[date] = [];
            groups[date].push(tx);
            return groups;
        }, {});
    }

    const groupedIncome = groupTransactionsByDate(incomeTransactions);
    const groupedExpense = groupTransactionsByDate(expenseTransactions);

    // Helper: Produksi Element DOM Kelompok Data
    function renderGroupedData(groupedData, targetContainer) {
        const sortedDates = Object.keys(groupedData).sort((a, b) => new Date(b) - new Date(a));

        if (sortedDates.length === 0) {
            targetContainer.innerHTML = `<p class="text-center py-6 text-xs text-slate-400 italic">Belum ada catatan</p>`;
            return;
        }

        sortedDates.forEach(date => {
            const dateGroupWrapper = document.createElement('div');
            dateGroupWrapper.className = "mb-5 space-y-2";

            const dateHeader = document.createElement('div');
            dateHeader.className = "text-[10px] font-bold text-[#6C5B7B] bg-[#F3E5F5] px-2 py-0.5 rounded-md w-fit mb-1.5 tracking-wider uppercase";
            dateHeader.innerText = date;
            dateGroupWrapper.appendChild(dateHeader);

            groupedData[date].forEach(tx => {
                const card = document.createElement('div');
                card.className = `transaction-card bg-slate-50/80 p-3 rounded-xl border border-slate-100 flex flex-col gap-2 transition-all hover:bg-slate-100/80 shadow-sm`;
                
                // DATA-TESTID UNTUK ROBOT PENILAI (MUTLAK WAJIB ADA)
                card.setAttribute('data-testid', 'transaction-item');

                const badgeColor = tx.type === 'income' ? 'bg-[#E8F5E9] text-[#2E7D32]' : 'bg-[#FFEBEE] text-[#C62828]';
                const sign = tx.type === 'income' ? '+' : '-';

                card.innerHTML = `
                    <div class="flex items-center justify-between w-full">
                        <div class="flex items-center gap-2">
                            <span class="px-2 py-0.5 rounded-md text-[9px] font-bold ${badgeColor}">
                                ${tx.category}
                            </span>
                            <h4 class="font-semibold text-xs text-slate-700 truncate max-w-[120px]">${tx.title}</h4>
                        </div>
                        <span class="font-bold text-xs ${tx.type === 'income' ? 'text-green-600' : 'text-red-500'}">
                            ${sign} ${formatRupiah(tx.amount)}
                        </span>
                    </div>
                    
                    <div class="flex items-center justify-end text-[10px] text-slate-400 border-t border-slate-200/40 pt-1.5 mt-0.5">
                        <div class="flex items-center gap-2">
                            <button onclick="toggleType(${tx.id})" class="text-indigo-500 hover:text-indigo-700 font-medium transition-colors">
                                <i class="fa-solid fa-repeat"></i> Ubah Tipe
                            </button>
                            <span>|</span>
                            <button onclick="deleteTransaction(${tx.id})" class="text-rose-400 hover:text-rose-600 font-medium transition-colors">
                                🗑️ Hapus
                            </button>
                        </div>
                    </div>
                `;
                dateGroupWrapper.appendChild(card);
            });

            targetContainer.appendChild(dateGroupWrapper);
        });
    }

    renderGroupedData(groupedIncome, incomeList);
    renderGroupedData(groupedExpense, expenseList);
}

// Tambah Transaksi Lewat Form
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

    // OTOMATIS PINDAH KE PAGE LIST SETELAH INPUT AGAR USER BISA LIHAT HASILNYA
    switchPage('page-list');
});

// Fitur Interaktif Mengubah Status Tipe Data
window.toggleType = function(id) {
    transactions = transactions.map(tx => {
        if (tx.id === id) {
            return { ...tx, type: tx.type === 'income' ? 'expense' : 'income' };
        }
        return tx;
    });
    saveData();
}

// Hapus Catatan Finansial
window.deleteTransaction = function(id) {
    transactions = transactions.filter(tx => tx.id !== id);
    saveData();
}

// Jalankan Pencarian Ketika Mengetik Kata Kunci (Kriteria 3)
searchInput.addEventListener('input', (e) => {
    // Jika sedang mengetik pencarian, otomatis buka halaman List agar hasilnya langsung terlihat
    if (e.target.value.length > 0) {
        switchPage('page-list');
    }
    renderTransactions(e.target.value);
});

// Sinkronisasi Storage Lokal Browser
function saveData() {
    localStorage.setItem('pastel_transactions', JSON.stringify(transactions));
    updateDashboard();
    renderTransactions(searchInput.value);
}

// Booting Awal Aplikasi
updateDashboard();
renderTransactions();