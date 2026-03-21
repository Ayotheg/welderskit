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
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Generating PDF...';
    submitBtn.disabled = true;

    const formData = new FormData(e.target);
    const invoiceData = prepareInvoiceData(formData);
    const fileName = `${invoiceData.header || 'Invoice'}-${invoiceData.number}.pdf`;

    try {
        console.log("Sending data to backend:", invoiceData);
        showStatus('⏳ Contacting Cloud API...', 'info');

        // Call Backend API (Flask)
        const response = await fetch("https://invoice-backend-lh01.onrender.com/api/invoice", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(invoiceData),
            signal: AbortSignal.timeout(15000) // 15s timeout for Render cold starts
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Status ${response.status}: ${errorText}`);
        }

        const blob = await response.blob();
        if (blob.size < 100) throw new Error("Received empty/invalid PDF blob.");
        
        downloadPDF(blob, fileName);
        saveToHistory(invoiceData, fileName);
        showStatus('✅ PDF Downloaded!', 'success');

    } catch (error) {
        console.warn('Cloud API failed, using Local Backup:', error.message);
        showStatus('🔄 Cloud busy. Generating Local PDF...', 'info');
        
        try {
            await generateLocalPDF(invoiceData, fileName);
            saveToHistory(invoiceData, fileName);
            showStatus('✅ Local PDF Downloaded!', 'success');
        } catch (localError) {
            console.error('Final failure:', localError);
            showStatus('❌ Error: Could not generate PDF. Please screenshot your entries.', 'error');
        }
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// -------------------- Local PDF Generation --------------------
async function generateLocalPDF(data, fileName) {
    const element = document.getElementById('invoice-printable');
    
    // Inject Data
    document.getElementById('tpl-type').innerText = data.header || "INVOICE";
    document.getElementById('tpl-number').innerText = data.number;
    document.getElementById('tpl-date').innerText = data.date || new Date().toLocaleDateString();
    document.getElementById('tpl-from').innerText = data.from;
    document.getElementById('tpl-to').innerText = data.to.split('\n')[0];
    document.getElementById('tpl-to-addr').innerText = data.to.split('\n').slice(1).join('\n');
    document.getElementById('tpl-notes').innerText = data.notes || "";
    
    // Calculate Total
    const total = data.items.reduce((sum, item) => sum + (item.quantity * item.unit_cost), 0);
    document.getElementById('tpl-total').innerText = total.toLocaleString();

    const itemsTbody = document.getElementById('tpl-items');
    itemsTbody.innerHTML = data.items.map(item => `
        <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 12px;">${item.name}</td>
            <td style="padding: 12px; text-align: center;">${item.quantity}</td>
            <td style="padding: 12px; text-align: right;">₦${item.unit_cost.toLocaleString()}</td>
            <td style="padding: 12px; text-align: right; font-weight: 500;">₦${(item.quantity * item.unit_cost).toLocaleString()}</td>
        </tr>
    `).join('');

    // Ensure it is VISIBLE but off-screen
    element.style.position = 'absolute';
    element.style.left = '-10000px';
    element.style.display = 'block';

    const opt = {
        margin: 0.5,
        filename: fileName,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, logging: false },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    try {
        // Wait a tiny bit for DOM to render
        await new Promise(r => setTimeout(r, 100));
        await html2pdf().set(opt).from(element).save();
    } finally {
        element.style.display = 'none';
    }
}

// -------------------- Prepare Invoice Data (Compatible with invoice-generator.com) --------------------
function prepareInvoiceData(formData) {
    const items = Array.from(document.querySelectorAll("#items .item")).map(item => ({
        name: item.querySelector("[name=description]").value.trim(),
        quantity: parseFloat(item.querySelector("[name=quantity]").value) || 0,
        unit_cost: parseFloat(item.querySelector("[name=price]").value) || 0
    }));

    // Data structure EXACTLY for invoice-generator.com
    return {
        from: formData.get("businessName") || "Professional Welder",
        to: formData.get("customerName") + (formData.get("customerAddress") ? ("\n" + formData.get("customerAddress")) : ""),
        number: Math.floor(Math.random() * 900000) + 100000,
        date: new Date().toLocaleDateString('en-US'),
        items: items,
        currency: "NGN",
        header: formData.get("type") || "Invoice",
        notes: formData.get("notes") || "Generated by Welder's Kit",
        terms: "Payment on delivery/completion"
    };
}

// -------------------- History & PDF Utils --------------------
function saveToHistory(data, fileName) {
    const total = data.items.reduce((sum, item) => sum + (item.quantity * item.unit_cost), 0);
    const invoiceRecord = {
        id: Date.now(),
        date: new Date().toISOString(),
        customer: data.to.split('\n')[0],
        total: total,
        fileName: fileName
    };
    invoiceHistory.unshift(invoiceRecord);
    localStorage.setItem('welderInvoices', JSON.stringify(invoiceHistory));
}

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

function showStatus(message, type) {
    const statusBox = document.getElementById("apiStatus");
    if (!statusBox) return;
    statusBox.style.display = "block";
    statusBox.textContent = message;
    const colors = {
        'success': '#dcfce7',
        'error': '#fee2e2',
        'info': '#e0f2fe'
    };
    statusBox.style.backgroundColor = colors[type] || '#fff';
    statusBox.style.color = type === 'error' ? '#991b1b' : (type === 'success' ? '#166534' : '#0369a1');
    if (type !== 'info') setTimeout(() => { statusBox.style.display = "none"; }, 5000);
}
