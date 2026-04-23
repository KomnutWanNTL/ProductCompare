const STORAGE_KEY = "product-compare-simple-rows-v1";
const MIN_ROWS = 2;

const rowsContainer = document.getElementById("rowsContainer");
const resultsContainer = document.getElementById("resultsContainer");
const errorMessage = document.getElementById("errorMessage");
const addRowBtn = document.getElementById("addRowBtn");
const removeRowBtn = document.getElementById("removeRowBtn");
const clearScreenBtn = document.getElementById("clearScreenBtn");

let rows = loadRows();

renderAll();

addRowBtn.addEventListener("click", () => {
    rows.push(createRow());
    renderAll();

    const last = rows[rows.length - 1];
    const input = document.querySelector(`[data-id="${last.id}"][data-field="name"]`);
    if (input) {
        input.focus();
    }
});

removeRowBtn.addEventListener("click", () => {
    if (rows.length <= MIN_ROWS) {
        return;
    }

    rows = rows.slice(0, -1);
    renderAll();
});

clearScreenBtn.addEventListener("click", () => {
    rows = [createRow(), createRow()];
    renderAll();

    const input = document.querySelector('[data-field="name"]');
    if (input) {
        input.focus();
    }
});

rowsContainer.addEventListener("input", (event) => {
    const input = event.target;
    if (!(input instanceof HTMLInputElement)) {
        return;
    }

    const id = String(input.dataset.id || "");
    const field = String(input.dataset.field || "");
    if (!id || !field) {
        return;
    }

    rows = rows.map((row) => {
        if (row.id !== id) {
            return row;
        }

        return {
            ...row,
            [field]: input.value,
        };
    });

    persistRows();
    renderResults();
    renderErrorHint();
});

function createRow() {
    return {
        id: crypto.randomUUID(),
        name: "",
        amount: "",
        price: "",
    };
}

function renderAll() {
    renderRows();
    renderResults();
    renderErrorHint();
    persistRows();
}

function renderRows() {
    const header = `
        <div class="row-header" aria-hidden="true">
            <span>ชื่อ</span>
            <span>ปริมาณ</span>
            <span>ราคา</span>
        </div>
    `;

    const body = rows
        .map((row) => {
            return `
                <article class="item-row">
                    <div class="row-fields">
                        <div class="field">
                            <input
                                id="name-${row.id}"
                                type="text"
                                inputmode="text"
                                aria-label="ชื่อสินค้า"
                                placeholder="เช่น นม"
                                data-id="${row.id}"
                                data-field="name"
                                value="${escapeHtml(row.name)}"
                            />
                        </div>

                        <div class="field">
                            <input
                                id="amount-${row.id}"
                                type="number"
                                inputmode="decimal"
                                aria-label="ปริมาณ"
                                min="0.01"
                                step="0.01"
                                placeholder="1200"
                                data-id="${row.id}"
                                data-field="amount"
                                value="${escapeHtml(row.amount)}"
                            />
                        </div>

                        <div class="field">
                            <input
                                id="price-${row.id}"
                                type="number"
                                inputmode="decimal"
                                aria-label="ราคา"
                                min="0.01"
                                step="0.01"
                                placeholder="45"
                                data-id="${row.id}"
                                data-field="price"
                                value="${escapeHtml(row.price)}"
                            />
                        </div>
                    </div>
                </article>
            `;
        })
        .join("");

    rowsContainer.innerHTML = `${header}${body}`;

    removeRowBtn.disabled = rows.length <= MIN_ROWS;
}

function getValidRows() {
    return rows
        .map((row) => {
            const name = String(row.name || "").trim();
            const amount = Number(row.amount);
            const price = Number(row.price);

            if (!name || !Number.isFinite(amount) || !Number.isFinite(price) || amount <= 0 || price <= 0) {
                return null;
            }

            return {
                id: row.id,
                name,
                amount,
                price,
                unitPrice: price / amount,
            };
        })
        .filter(Boolean)
        .sort((a, b) => a.unitPrice - b.unitPrice);
}

function renderResults() {
    const validRows = getValidRows();

    if (!validRows.length) {
        resultsContainer.innerHTML = '<p class="result-empty">กรอกข้อมูลอย่างน้อย 1 รายการเพื่อเริ่มคำนวณ</p>';
        return;
    }

    const first = validRows[0];
    const second = validRows[1] || null;

    const firstCard = `
        <article class="result-card rank-1">
            <span class="result-badge">อันดับ 1 ถูกที่สุด</span>
            <h3 class="result-name">${escapeHtml(first.name)}</h3>
            <p class="result-meta">ราคา ${formatCurrency(first.price)} | ปริมาณ ${formatNumber(first.amount)}</p>
            <p class="result-unit">${formatCurrency(first.unitPrice)} / หน่วย</p>
        </article>
    `;

    if (!second) {
        resultsContainer.innerHTML = `${firstCard}<p class="result-empty">ต้องมีอย่างน้อย 2 รายการเพื่อเปรียบเทียบ</p>`;
        return;
    }

    const diffPerPack = Math.max(0, (second.unitPrice - first.unitPrice) * second.amount);
    const diffPercent = first.unitPrice > 0 ? ((second.unitPrice - first.unitPrice) / first.unitPrice) * 100 : 0;

    const secondCard = `
        <article class="result-card rank-2">
            <span class="result-badge">อันดับ 2</span>
            <h3 class="result-name">${escapeHtml(second.name)}</h3>
            <p class="result-meta">ราคา ${formatCurrency(second.price)} | ปริมาณ ${formatNumber(second.amount)}</p>
            <p class="result-unit">${formatCurrency(second.unitPrice)} / หน่วย</p>
            <p class="result-diff">แพงกว่า ${formatCurrency(diffPerPack)} ต่อแพ็ก (${formatNumber(diffPercent)}%)</p>
        </article>
    `;

    resultsContainer.innerHTML = `${firstCard}${secondCard}`;
}

function renderErrorHint() {
    const invalidRows = rows.filter((row) => {
        const hasAnyValue = String(row.name || "").trim() || String(row.amount || "").trim() || String(row.price || "").trim();
        if (!hasAnyValue) {
            return false;
        }

        const amount = Number(row.amount);
        const price = Number(row.price);
        return !String(row.name || "").trim() || !Number.isFinite(amount) || !Number.isFinite(price) || amount <= 0 || price <= 0;
    });

    if (!invalidRows.length) {
        errorMessage.hidden = true;
        errorMessage.textContent = "";
        return;
    }

    errorMessage.hidden = false;
    errorMessage.textContent = "บางรายการยังไม่ครบ: ชื่อ, ปริมาณ (>0), ราคา (>0)";
}

function loadRows() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        const parsed = raw ? JSON.parse(raw) : [];

        if (!Array.isArray(parsed)) {
            return [createRow(), createRow()];
        }

        const normalized = parsed
            .filter((item) => item && typeof item === "object")
            .map((item) => ({
                id: String(item.id || crypto.randomUUID()),
                name: String(item.name || ""),
                amount: String(item.amount || ""),
                price: String(item.price || ""),
            }));

        while (normalized.length < MIN_ROWS) {
            normalized.push(createRow());
        }

        return normalized;
    } catch {
        return [createRow(), createRow()];
    }
}

function persistRows() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
}

function formatCurrency(value) {
    return new Intl.NumberFormat("th-TH", {
        style: "currency",
        currency: "THB",
        maximumFractionDigits: 2,
    }).format(value);
}

function formatNumber(value) {
    return new Intl.NumberFormat("th-TH", {
        maximumFractionDigits: 2,
    }).format(value);
}

function escapeHtml(value) {
    const map = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
    };

    return String(value).replace(/[&<>"']/g, (char) => map[char]);
}
