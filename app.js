const STORAGE_KEY = "product-compare-items-v2";

const form = document.getElementById("compareForm");
const tbody = document.getElementById("resultBody");
const summary = document.getElementById("summary");
const clearBtn = document.getElementById("clearBtn");
const sampleBtn = document.getElementById("sampleBtn");
const searchInput = document.getElementById("searchInput");
const emptyTemplate = document.getElementById("emptyTemplate");

let items = loadItems();
let keyword = "";

if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("./service-worker.js").catch(() => {
            // Ignore registration error; app still works without offline mode.
        });
    });
}

render();

form.addEventListener("submit", (event) => {
    event.preventDefault();

    const payload = new FormData(form);
    const amount = Number(payload.get("amount"));
    const price = Number(payload.get("price"));

    const newItem = {
        id: crypto.randomUUID(),
        product: String(payload.get("product")).trim(),
        price,
        amount,
        unitPrice: Number((price / amount).toFixed(4)),
        createdAt: Date.now(),
    };

    if (!newItem.product || !Number.isFinite(newItem.price) || newItem.price <= 0 || !Number.isFinite(newItem.amount) || newItem.amount <= 0) {
        alert("กรอกข้อมูล ชื่อสินค้า ราคา และปริมาณ ให้ถูกต้อง");
        return;
    }

    items.unshift(newItem);
    persist();
    form.reset();
    render();
});

clearBtn.addEventListener("click", () => {
    if (!items.length) {
        return;
    }

    const ok = confirm("ต้องการล้างรายการทั้งหมดใช่ไหม?");
    if (!ok) {
        return;
    }

    items = [];
    persist();
    render();
});

sampleBtn.addEventListener("click", () => {
    const sample = [
        makeSample("น้ำดื่ม", 16, 1500),
        makeSample("น้ำดื่ม", 14, 1200),
        makeSample("น้ำดื่ม", 25, 2000),
        makeSample("ข้าวสาร", 145, 5),
        makeSample("ข้าวสาร", 121, 4),
    ];

    items = [...sample, ...items];
    persist();
    render();
});

searchInput.addEventListener("input", (event) => {
    keyword = String(event.target.value || "").trim().toLowerCase();
    render();
});

function makeSample(product, price, amount) {
    return {
        id: crypto.randomUUID(),
        product,
        price,
        amount,
        unitPrice: Number((price / amount).toFixed(4)),
        createdAt: Date.now(),
    };
}

function render() {
    const viewItems = items.filter((item) => {
        if (!keyword) {
            return true;
        }

        const text = `${item.product}`.toLowerCase();
        return text.includes(keyword);
    });

    if (!viewItems.length) {
        tbody.innerHTML = emptyTemplate.innerHTML;
        summary.textContent = "เพิ่มข้อมูลอย่างน้อย 2 รายการเพื่อเปรียบเทียบความคุ้มค่า";
        return;
    }

    const bestItem = viewItems.reduce((best, item) => {
        if (!best || item.unitPrice < best.unitPrice) {
            return item;
        }
        return best;
    }, null);

    const minUnitPrice = bestItem ? bestItem.unitPrice : 0;

    const rows = [...viewItems].sort((a, b) => {
        return a.unitPrice - b.unitPrice;
    });

    tbody.innerHTML = rows
        .map((item) => {
            const diffPerPack = Math.max(0, (item.unitPrice - minUnitPrice) * item.amount);
            const isBest = Boolean(bestItem && item.id === bestItem.id);

            return `
        <tr>
          <td>
            <strong>${escapeHtml(item.product)}</strong>
          </td>
          <td>${formatCurrency(item.price)}</td>
                    <td>${formatQuantity(item.amount)}</td>
                    <td class="price-unit">${formatCurrency(item.unitPrice)} / หน่วยที่กรอก</td>
          <td>
            ${isBest
                    ? `<span class="status-badge status-best">คุ้มสุด</span>`
                    : `<span class="status-badge status-over">แพงกว่าประมาณ ${formatCurrency(diffPerPack)}</span>`
                }
          </td>
          <td>
            <button class="delete-btn" type="button" data-id="${item.id}">ลบ</button>
          </td>
        </tr>
      `;
        })
        .join("");

    tbody.querySelectorAll("button[data-id]").forEach((button) => {
        button.addEventListener("click", () => {
            const { id } = button.dataset;
            items = items.filter((item) => item.id !== id);
            persist();
            render();
        });
    });

    summary.textContent = `ทั้งหมด ${viewItems.length} รายการ | คุ้มสุด ${formatCurrency(minUnitPrice)} ต่อหน่วยที่กรอก | อัปเดตล่าสุด ${new Date().toLocaleTimeString("th-TH")}`;
}

function persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function loadItems() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function formatCurrency(value) {
    return new Intl.NumberFormat("th-TH", {
        style: "currency",
        currency: "THB",
        maximumFractionDigits: 2,
    }).format(value);
}

function formatQuantity(amount) {
    return new Intl.NumberFormat("th-TH", {
        maximumFractionDigits: 2,
    }).format(amount);
}

function escapeHtml(text) {
    const map = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
    };

    return String(text).replace(/[&<>"']/g, (m) => map[m]);
}
