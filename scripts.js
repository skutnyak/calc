let sheetPrices = {};

// Nalaganje cene materialov iz datoteke cena.json
function loadPrices() {
    fetch('cena.json')
        .then(response => response.json())
        .then(data => {
            sheetPrices = data;
            updateSheetPrice();  // Posodobi ceno, ko so podatki naloženi
        })
        .catch(error => console.error('Napaka pri nalaganju cen:', error));
}

// Posodobi ceno materiala na podlagi izbire uporabnika
function updateSheetPrice() {
    const materialType = document.getElementById('materialType').value;
    const sheetSize = document.getElementById('sheetSize').value;
    const thickness = document.getElementById('thickness').value;
    const sheetPriceDisplay = document.getElementById('sheetPriceDisplay');

    // Preveri, če so podatki o ceni pravilno dostopni
    if (sheetPrices[materialType] && sheetPrices[materialType][sheetSize] && sheetPrices[materialType][sheetSize][thickness]) {
        const sheetPrice = parseFloat(sheetPrices[materialType][sheetSize][thickness]);
        if (!isNaN(sheetPrice)) {
            sheetPriceDisplay.textContent = `${sheetPrice.toFixed(2)} EUR`;
            calculatePricePerMm2(sheetPrice);
        } else {
            sheetPriceDisplay.textContent = 'Cena ni veljavna.';
            document.getElementById('pricePerMm2').textContent = '---';
        }
    } else {
        sheetPriceDisplay.textContent = 'Cena ni definirana za izbrane parametre.';
        document.getElementById('pricePerMm2').textContent = '---';
    }
}

// Izračunaj ceno materiala na kvadratni milimeter
function calculatePricePerMm2(sheetPrice) {
    const sheetSize = document.getElementById('sheetSize').value;

    let width, height;

    if (sheetSize === '1000x2000') {
        width = 1000;
        height = 2000;
    } else if (sheetSize === '1250x2500') {
        width = 1250;
        height = 2500;
    } else {
        document.getElementById('pricePerMm2').textContent = 'Prosimo, izberite veljaven format pločevine.';
        return;
    }

    const sheetArea = width * height;
    const pricePerMm2 = sheetPrice / sheetArea;
    document.getElementById('pricePerMm2').textContent = pricePerMm2.toFixed(8); // Prikaz 8 decimalk
}

// Izračun stroškov materiala v realnem času
function calculateMaterialCost() {
    const cutLength = parseFloat(document.getElementById('cutLength').value) || 0;
    const cutWidth = parseFloat(document.getElementById('cutWidth').value) || 0;
    const pricePerMm2 = parseFloat(document.getElementById('pricePerMm2').textContent) || 0;

    // Izračun stroška porabljenega materiala
    const materialCost = cutLength * cutWidth * pricePerMm2;

    // Posodobi prikaz stroška materiala
    document.getElementById('materialCostDisplay').textContent = `${materialCost.toFixed(2)} EUR`;
}

// Izračunaj vse stroške, ko uporabnik pritisne gumb "Izračunaj"
function calculateAll() {
    const cutLength = parseFloat(document.getElementById('cutLength').value) || 0;
    const cutWidth = parseFloat(document.getElementById('cutWidth').value) || 0;
    const pricePerMm2 = parseFloat(document.getElementById('pricePerMm2').textContent) || 0;

    // Izračun stroška porabljenega materiala
    const materialCost = cutLength * cutWidth * pricePerMm2;

    // Posodobi prikaz stroška materiala
    document.getElementById('materialCostDisplay').textContent = `${materialCost.toFixed(2)} EUR`;

    // Nadaljnji izračuni za druge stroške
    const cutTime = parseFloat(document.getElementById('cutTime').value) || 0;
    const laserPower = parseFloat(document.getElementById('laserPower').value) || 3000;
    const energyCostPerKwh = parseFloat(document.getElementById('energyCost').value) || 0;
    const energyCostPerSecond = (laserPower / 1000) * (energyCostPerKwh / 3600);
    const totalEnergyCost = energyCostPerSecond * cutTime;

    const operatorRate = parseFloat(document.getElementById('operatorRate').value) || 30;
    const sheetChangeCost = parseFloat(document.getElementById('sheetChangeCost').value) || 10;
    const amortization = parseFloat(document.getElementById('amortization').value) || 0.050;
    const profitMargin = parseFloat(document.getElementById('profitMargin').value) || 20;

    const operatorCost = (operatorRate / 3600) * cutTime;
    const amortizationCost = (amortization / 3600) * cutTime;

    const numCuts = parseFloat(document.getElementById('numCuts').value) || 0;
    const piercingCost = parseFloat(document.getElementById('piercingCost').value) || 0;
    const totalPiercingCost = numCuts * piercingCost;

    // Izračun skupnih stroškov brez dobička (Cena razreza)
    const cuttingCost = materialCost + totalEnergyCost + operatorCost + amortizationCost + totalPiercingCost + sheetChangeCost;
    document.getElementById('cuttingCostDisplay').textContent = `Cena razreza: ${cuttingCost.toFixed(2)} EUR`;

    // Izračun skupnih stroškov z dobičkom
    const profit = (cuttingCost * profitMargin) / 100;
    const totalCost = cuttingCost + profit;

    // Posodabljanje prikaza rezultatov
    document.getElementById('totalCostDisplay').textContent = `Skupni stroški: ${totalCost.toFixed(2)} EUR`;
    document.getElementById('profitDisplay').textContent = `Dobiček: ${profit.toFixed(2)} EUR`;
    document.getElementById('sellingPriceDisplay').textContent = `Prodajna cena: ${totalCost.toFixed(2)} EUR`;
}

// Funkcija za izvoz v PDF
function exportToPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Dodaj naslov podjetja
    doc.text('FC-Modul d.o.o.', 10, 20);

    // Dodaj datum in številko ponudbe
    const date = new Date().toLocaleDateString();
    const offerNumber = 'PON-' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '-001';
    doc.text(`Datum izdelave: ${date}`, 150, 20);
    doc.text(`Številka ponudbe: ${offerNumber}`, 150, 30);

    // Dodaj izračune
    doc.text(document.getElementById('totalCostDisplay').textContent, 10, 50);
    doc.text(document.getElementById('profitDisplay').textContent, 10, 60);
    doc.text(document.getElementById('cuttingCostDisplay').textContent, 10, 70);
    doc.text(document.getElementById('sellingPriceDisplay').textContent, 10, 80);

    // Shrani PDF datoteko
    doc.save("ponudba.pdf");
}

// Ko je stran naložena, naloži cene iz cena.json
window.onload = function() {
    loadPrices();
};
