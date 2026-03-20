// ==================== INVOICE HANDLER ====================

// Initialize Invoice History
let invoiceHistory = JSON.parse(localStorage.getItem('welderInvoices')) || [];

// -------------------- Event Listeners --------------------
document.addEventListener('DOMContentLoaded', () => {
    const invoiceForm = document.getElementById("invoiceForm");
    if (invoiceForm) {
        invoiceForm.addEventListener("submit", handleFormSubmit);
    }

    const addItemBtn = document.getElementById("addItem");
    if (addItemBtn) {
        addItemBtn.addEventListener("click", addItem);
    }
});

// -------------------- Add/Remove Items --------------------
function addItem() {
    const itemsContainer = document.getElementById("items");
    const newItem = document.createElement("div");
    newItem.className = "item";
    newItem.innerHTML = `
        <input type="text" name="description" placeholder="Material (e.g. 3'' Pipe)" required>
        <div class="item-details">
            <input type="number" name="quantity" placeholder="Qty" min="1" required>
            <input type="number" name="price" placeholder="Price (₦)" min="0" step="0.01" required>
            <button type="button" class="remove-item" onclick="removeItem(this)">
                <i class="bi bi-trash"></i>
            </button>
        </div>
    `;
    itemsContainer.appendChild(newItem);
}

function removeItem(button) {
    const item = button.closest('.item');
    const allItems = document.querySelectorAll('#items .item');
    if (allItems.length > 1) {
        item.remove();
    } else {
        alert("At least one item is required.");
    }
}

// -------------------- Form Submit --------------------
async function handleFormSubmit(e) {
    e.preventDefault();

    const submitBtn = document.querySelector('.generate-btn');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Generating...';
    submitBtn.disabled = true;

    try {
        const formData = new FormData(e.target);
        const invoiceData = prepareInvoiceData(formData);

        // Call Backend API
        const response = await fetch("https://invoice-backend-lh01.onrender.com/api/invoice", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(invoiceData)
        });

        if (!response.ok) throw new Error("API error: " + response.status);

        const blob = await response.blob();
        const fileName = `${invoiceData.type}-${invoiceData.number}.pdf`;

        // Download the PDF
        downloadPDF(blob, fileName);

        // Save to Local History
        const invoiceRecord = {
            id: Date.now(),
            date: new Date().toISOString(),
            customerName: formData.get("customerName"),
            businessName: formData.get("businessName"),
            type: invoiceData.type,
            total: invoiceData.total,
            fileName: fileName,
            status: 'success'
        };

        invoiceHistory.unshift(invoiceRecord);
        localStorage.setItem('welderInvoices', JSON.stringify(invoiceHistory));

        showStatus('✅ Invoice generated successfully!', 'success');
        // Optional: e.target.reset();

    } catch (error) {
        console.error('Error generating invoice:', error);
        showStatus('❌ Failed to generate invoice. Please try again.', 'error');
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// -------------------- Prepare Invoice Data --------------------
function prepareInvoiceData(formData) {
    const items = Array.from(document.querySelectorAll("#items .item")).map(item => ({
        name: item.querySelector("[name=description]").value.trim(),
        quantity: parseInt(item.querySelector("[name=quantity]").value) || 0,
        unit_cost: parseFloat(item.querySelector("[name=price]").value) || 0
    }));

    const total = items.reduce((sum, item) => sum + (item.quantity * item.unit_cost), 0);

    return {
        from: formData.get("businessName") || "Welder's Kit User",
        to: formData.get("customerName") + "\n" + (formData.get("customerAddress") || ""),
        logo: "https://ayotheg.github.io/welderskit/img/logo.png", // Fallback logo
        number: Math.floor(Math.random() * 899999) + 100000,
        currency: "NGN",
        date: new Date().toLocaleDateString(),
        payment_terms: "Direct Payment",
        items: items,
        fields: {
            tax: "%",
            discounts: true,
            shipping: true
        },
        notes: formData.get("notes") || "Thanks for your business!",
        type: formData.get("type")
    };
}

// -------------------- PDF Download --------------------
function downloadPDF(pdfBlob, fileName) {
    const url = URL.createObjectURL(pdfBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
}

// -------------------- Status Messages --------------------
function showStatus(message, type) {
    const statusBox = document.getElementById("apiStatus");
    if (statusBox) {
        statusBox.style.display = "block";
        statusBox.textContent = message;
        statusBox.className = `api-status status-${type}`;
        
        setTimeout(() => {
            statusBox.style.display = "none";
        }, 5000);
    } else {
        alert(message);
    }
}

function switchTab(tabId) {
    // Current layout only has one tab, but kept for compatibility
    console.log("Switching to tab:", tabId);
}
