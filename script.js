let productsData = {};
function generateQuoteNumber() {
  const now = new Date();
  const timestamp = now.getTime().toString().slice(-6);
  return "PX-" + timestamp;
}
// Load product data
fetch("products.json")
  .then(response => response.json())
  .then(data => {
    productsData = data;
  });

function determinePlatform() {
  const multiSite = document.getElementById("multiSite").value;
  const cloud = document.getElementById("cloud").value;
  const expansion = document.getElementById("expansion").value;
  const video = document.getElementById("video").value;

  let platform = "net2";

  if (
    multiSite === "yes" ||
    cloud === "yes" ||
    expansion === "yes" ||
    video === "yes"
  ) {
    platform = "paxton10";
  }

  document.getElementById("recommendation").innerText =
    "Recommended Platform: " + platform.toUpperCase();

  showBuildOptions(platform);
}

function showBuildOptions(platform) {
  const container = document.getElementById("bomOutput");

  container.innerHTML = `
    <div class="mt-6">
      <label class="block font-semibold mb-2">Power Type</label>
      <select id="powerType" class="w-full border rounded-lg p-2 mb-4">
        <option value="lv">Low Voltage</option>
        <option value="poe_controller">PoE+</option>
      </select>

      <label class="block font-semibold mb-2">Reader Type</label>
      <select id="readerType" class="w-full border rounded-lg p-2 mb-4">
        ${generateReaderOptions(platform)}
      </select>

      <button onclick="generateBOM('${platform}')"
        class="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700">
        Generate BOM
      </button>
    </div>

    <div id="finalBOM" class="mt-6"></div>
  `;
}

function generateReaderOptions(platform) {
  const readers = productsData[platform].readers;
  let options = "";

  for (let key in readers) {
    options += `<option value="${key}">${readers[key].name}</option>`;
  }

  return options;
}

function generateBOM(platform) {
  const doorCount = parseInt(document.getElementById("doorCount").value);
  const powerType = document.getElementById("powerType").value;
  const readerType = document.getElementById("readerType").value;

  if (!doorCount || doorCount < 1) {
    alert("Please enter valid door count.");
    return;
  }

  const controller = productsData[platform][powerType];
  const reader = productsData[platform].readers[readerType];

  let bom = [];

  bom.push({
    name: controller.name,
    sku: controller.sku,
    qty: doorCount,
    msrp: controller.msrp
  });

  bom.push({
    name: reader.name,
    sku: reader.sku,
    qty: doorCount,
    msrp: reader.msrp
  });

displayBOM(bom);
window.currentBOM = bom;
}
function displayBOM(bom) {
  let total = 0;

  let table = `
    <table class="w-full border mt-4">
      <thead class="bg-gray-200">
        <tr>
          <th class="p-2 border">Product</th>
          <th class="p-2 border">SKU</th>
          <th class="p-2 border">Qty</th>
          <th class="p-2 border">MSRP</th>
          <th class="p-2 border">Line Total</th>
        </tr>
      </thead>
      <tbody>
  `;

  bom.forEach(item => {
    const lineTotal = item.qty * item.msrp;
    total += lineTotal;

    table += `
      <tr>
        <td class="p-2 border">${item.name}</td>
        <td class="p-2 border">${item.sku}</td>
        <td class="p-2 border">${item.qty}</td>
        <td class="p-2 border">$${item.msrp.toFixed(2)}</td>
        <td class="p-2 border">$${lineTotal.toFixed(2)}</td>
      </tr>
    `;
  });

  table += `
      </tbody>
    </table>

    <div class="mt-4 text-xl font-bold">
      Total MSRP: $${total.toFixed(2)}
    </div>

    <button onclick="copyBOM()"
      class="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
      Copy BOM
    </button>

    <button onclick="downloadPDF()"
      class="mt-4 ml-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">
      Download Quote PDF
    </button>
  `;

  document.getElementById("finalBOM").innerHTML = table;
}
function downloadPDF() {

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const bom = window.currentBOM;

  const projectName = document.getElementById("projectName").value || "N/A";
  const customerName = document.getElementById("customerName").value || "N/A";
  const projectState = document.getElementById("projectState").value || "N/A";

  const quoteDate = new Date().toLocaleDateString();
  const quoteNumber = generateQuoteNumber();

  let total = 0;

  const rows = bom.map(item => {
    const lineTotal = item.qty * item.msrp;
    total += lineTotal;

    return [
      item.name,
      item.sku,
      item.qty,
      `$${item.msrp.toFixed(2)}`,
      `$${lineTotal.toFixed(2)}`
    ];
  });
  // HEADER
const logo = new Image();
logo.src = "images/paxton-logo.png";

logo.onload = function () {

  doc.addImage(logo, "PNG", 150, 10, 40, 15);

  doc.setFontSize(20);
  doc.text("Paxton Project Quote", 14, 20);

  doc.setFontSize(11);

  doc.text(`Quote Number: ${quoteNumber}`, 14, 30);
  doc.text(`Quote Date: ${quoteDate}`, 14, 36);

  doc.text(`Customer: ${customerName}`, 120, 30);
  doc.text(`Project: ${projectName}`, 120, 36);
  doc.text(`State: ${projectState}`, 120, 42);

  doc.autoTable({
    startY: 50,
    head: [["Product", "SKU", "Qty", "MSRP", "Line Total"]],
    body: rows,
    headStyles: {
      fillColor: [86,170,28],
      textColor: [255,255,255],
      fontStyle: "bold"
    },
    alternateRowStyles: {
      fillColor: [245,245,245]
    }
  });

doc.setFontSize(14);
doc.text(
  `Total MSRP: $${total.toFixed(2)}`,
  14,
  doc.lastAutoTable.finalY + 15
);

doc.save(`Paxton-Quote-${quoteNumber}.pdf`);
};
}
function toggleDarkMode() {
  const body = document.getElementById("pageBody");
  const button = document.getElementById("themeToggle");

  body.classList.toggle("dark");

  if (body.classList.contains("dark")) {
    button.textContent = "☀️";
  } else {
    button.textContent = "🌙";
  }
}
