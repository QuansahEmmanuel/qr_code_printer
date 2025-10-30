// iziToast helpers
const error_message = (message) => {
  iziToast.error({
    title: "Error",
    message: message,
    position: "topRight",
  });
};

const success_message = (message) => {
  iziToast.success({
    title: "Success",
    message: message,
    position: "topRight",
  });
};

// Global variables
let formatted_bin;
let list_of_qrCodes = [];

// Main function
function addBin() {
  const input = document.getElementById("input");
  let user_bin_number = input.value.trim();

  // Remove everything except numbers
  user_bin_number = user_bin_number.replace(/\D/g, "");

  if (user_bin_number === "") {
    error_message("Bin Number is Required!");
    return;
  }

  // Format BIN
  formatted_bin = "BIN" + user_bin_number;

  // Add BIN to list
  list_of_qrCodes.push(formatted_bin);

  // Show success
  success_message(`${formatted_bin} added successfully!`);

  // Re-render list
  renderBarcodes();

  // Clear input
  input.value = "";
  input.focus();
}

// Render QR codes
function renderBarcodes() {
  const qrList = document.getElementById("qrList");
  qrList.innerHTML = ""; // clear before re-render

  // Show empty state if no barcodes
  if (list_of_qrCodes.length === 0) {
    const emptyState = document.createElement("div");
    emptyState.className = "text-center py-12 text-gray-500 w-full";
    emptyState.innerHTML = `
      <svg class="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
      </svg>
      <p class="text-lg font-medium">No barcodes yet</p>
      <p class="text-sm mt-1">Add a BIN number to generate barcodes</p>
    `;
    qrList.appendChild(emptyState);
    return;
  }

  list_of_qrCodes.forEach((bin, index) => {
    const wrapper = document.createElement("div");
    wrapper.className = "flex flex-col justify-center items-center";

    const card = document.createElement("div");
    card.className =
      "bg-white py-4 md:w-80 px-2 md:px-0 shadow flex flex-col items-center border";

    const label = document.createElement("p");
    label.textContent = `BIN - ${bin}`;
    label.className = "text-sm font-medium text-gray-700 mb-2";

    const qrContainer = document.createElement("div");
    qrContainer.className =
      "w-32 h-28 bg-gray-200 flex items-center justify-center mb-3";
    qrContainer.id = `qr-${index}`;

    // Generate QR
    new QRCode(qrContainer, {
      text: bin,
      width: 124,
      height: 120,
    });

    card.appendChild(label);
    card.appendChild(qrContainer);
    wrapper.appendChild(card);

    // Remove button
    const removeBtn = document.createElement("button");
    removeBtn.className =
      "flex items-center gap-2 mt-3 bg-red-500 hover:bg-red-600 text-white text-sm font-medium px-4 py-1 rounded-md transition";
    removeBtn.innerHTML = `<img src="/icons/mdi-light--delete.png" class="h-5"> Remove`;
    removeBtn.onclick = () => removeBin(index);
    wrapper.appendChild(removeBtn);

    qrList.appendChild(wrapper);
  });
}

// Remove specific BIN
function removeBin(index) {
  list_of_qrCodes.splice(index, 1);
  renderBarcodes();
  success_message("Bin removed successfully!");
}

// Print all QR codes
function printAll() {
  if (list_of_qrCodes.length === 0) {
    error_message("No QR codes to print!");
    return;
  }

  // Generate print content with QR codes as base64 images
  let printHTML = "";

  list_of_qrCodes.forEach((bin, index) => {
    const qrContainer = document.getElementById(`qr-${index}`);
    const canvas = qrContainer.querySelector("canvas");

    if (canvas) {
      const imgData = canvas.toDataURL("image/png");
      printHTML += `
        <div class="qr-item">
          <p class="bin-label">BIN - ${bin}</p>
          <img src="${imgData}" alt="${bin}">
        </div>
      `;
    }
  });

  // Create a hidden print container
  const printContainer = document.createElement("div");
  printContainer.id = "print-container";
  printContainer.innerHTML = printHTML;
  document.body.appendChild(printContainer);

  // Add print styles (exact label look)
  const style = document.createElement("style");
  style.id = "print-styles";
  style.textContent = `
    @media print {
      body > *:not(#print-container) {
        display: none !important;
      }

      #print-container {
        display: block !important;
        text-align: center;
        padding: 0;
        margin: 0;
      }

      .qr-item {
        display: inline-block;
        width: 200px;
        height: 140px;
        border: 2px solid #000;
        background: #fff;
        padding: 6px 8px;
        margin: 8px;
        text-align: center;
        vertical-align: top;
        page-break-inside: avoid;
      }

      .bin-label {
        font-size: 13px;
        text-align: center;
        margin: 0 auto;
        letter-spacing: 0.4px;
        padding-bottom:6px
      }

      .qr-item img {
        width: 100px;
        height: 100px;
        display: block;
        margin: 0 auto;
        padding-bottom:10px
        
      }
    }

    #print-container {
      display: none;
    }
  `;
  document.head.appendChild(style);

  // Trigger print
  window.print();

  // Clean up after print dialog closes
  setTimeout(() => {
    document.body.removeChild(printContainer);
    document.head.removeChild(style);
  }, 100);
}

// 🧹 Clear all QR codes (DaisyUI version)
function clearAll() {
  if (list_of_qrCodes.length === 0) {
    error_message("There are no barcodes to clear!");
    return;
  }

  const modal = document.getElementById("clearAllModal");
  const confirmBtn = document.getElementById("confirmClearBtn");

  // Open modal
  modal.showModal();

  // Handle confirm click
  confirmBtn.onclick = () => {
    list_of_qrCodes = [];
    renderBarcodes();
    success_message("All barcodes cleared successfully!");
    modal.close();
  };
}

// Handle Add button click
document.getElementById("add_bin_button").addEventListener("click", addBin);

// Handle Enter key
document.getElementById("input").addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    e.preventDefault();
    addBin();
  }
});

// Handle Print and Clear buttons
const printButton = document.querySelector(".bg-green-600");
const clearButton = document.querySelector(".bg-red-500");

if (printButton) printButton.addEventListener("click", printAll);
if (clearButton) clearButton.addEventListener("click", clearAll);

// Initial render to show empty state
renderBarcodes();

//  Function to show current year in footer
function updateCurrentYear() {
  const yearElement = document.getElementById("currentYear");
  if (yearElement) {
    const currentYear = new Date().getFullYear();
    yearElement.textContent = currentYear;
  }
}

// Call the function when the page loads
updateCurrentYear();
