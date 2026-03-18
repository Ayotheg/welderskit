// ==================== INVOICE HANDLER ====================


// -------------------- Form Submit --------------------
document.getElementById("invoiceForm").addEventListener("submit", handleFormSubmit);

async function handleFormSubmit(e) {
  e.preventDefault();

  const submitBtn = document.querySelector('.generate-btn');
  const originalText = submitBtn.textContent;
  submitBtn.textContent = 'Generating...';
  submitBtn.classList.add('loading');

  try {
    const formData = new FormData(e.target);
    const invoiceData = prepareInvoiceData(formData);

    // ✅ Call your Flask backend instead of html2pdf
    const response = await fetch("https://invoice-backend-lh01.onrender.com/api/invoice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(invoiceData)
    });

    if (!response.ok) throw new Error("Backend error: " + response.status);

    // Get PDF blob
    const blob = await response.blob();
    const fileName = `${invoiceData.type}-${invoiceData.number}.pdf`;

    // Download the PDF
    downloadPDF(blob, fileName);

    // Save invoice metadata to localStorage
    const invoiceRecord = {
      id: Date.now(),
      date: new Date().toISOString(),
      customerName: formData.get("name"),
      type: invoiceData.type,
      total: invoiceData.total,
      fileName: fileName,
      status: 'success',
      data: invoiceData
    };

    invoiceHistory.unshift(invoiceRecord);
    localStorage.setItem('welderInvoices', JSON.stringify(invoiceHistory));

    showStatus('✅ Invoice generated and saved to history.', 'success');
    e.target.reset();

  } catch (error) {
    console.error('Error generating invoice:', error);
    showStatus('❌ Error: ' + error.message, 'error');
  } finally {
    submitBtn.textContent = originalText;
    submitBtn.classList.remove('loading');
  }
}

// -------------------- Prepare Invoice Data --------------------
function prepareInvoiceData(formData) {
  const items = Array.from(document.querySelectorAll("#items .item")).map(item => ({
    name: item.querySelector("[name=description]").value.trim(),
    quantity: parseInt(item.querySelector("[name=quantity]").value),
    unit_cost: parseFloat(item.querySelector("[name=price]").value)
  }));

  const total = items.reduce((sum, item) => sum + (item.quantity * item.unit_cost), 0);

  return {
    from: "Welder Business",
    to: formData.get("name") + "\n" + formData.get("address"),
    number: Math.floor(Math.random() * 10000) + 1000,
    currency: "NGN",
    date: new Date().toLocaleDateString(),
    payment_terms: "Due on receipt",
    items: items,
    total: total,
    fields: { tax: "%", discounts: true, shipping: true },
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
  let statusBox = document.getElementById("statusBox");
  if (!statusBox) {
    statusBox = document.createElement("div");
    statusBox.id = "statusBox";
    document.body.appendChild(statusBox);
  }
  statusBox.textContent = message;
  statusBox.className = `status ${type}`;
}
