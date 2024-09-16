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
    var doc = new jsPDF();

    // Uporabimo standardno pisavo s podporo za šumnike
    doc.setFont('helvetica');

    // Dodaj ime in naslov podjetja
    doc.setFontSize(16);
    doc.text("PREDRAČUN", 105, 20, null, null, "center");
    
    doc.setFontSize(12);
    doc.text("Podjetje XYZ d.o.o.", 105, 30, null, null, "center");
    doc.text("Naslov ulice 123", 105, 36, null, null, "center");
    doc.text("1000 Ljubljana", 105, 42, null, null, "center");

    // Dodaj podatke o stranki
    doc.setFontSize(12);
    doc.text("Podatki o stranki", 20, 60);
    doc.text("Ime: " + document.getElementById('customerName').value, 20, 68);
    doc.text("Naslov: " + document.getElementById('customerAddress').value, 20, 76);
    doc.text("Telefon: " + document.getElementById('customerPhone').value, 20, 84);
    doc.text("Email: " + document.getElementById('customerEmail').value, 20, 92);

    // Datum in številka predračuna
    doc.text("Datum: " + new Date().toLocaleDateString(), 150, 60);
    doc.text("Št. predračuna: " + document.getElementById('invoiceNumber').value, 150, 68);

    // Dodaj tabelo za izračune stroškov
    doc.setFontSize(12);
    doc.text("Stroški:", 20, 110);
    doc.setFontSize(10);
    doc.text("Postavka", 20, 120);
    doc.text("Cena (EUR)", 150, 120);

    // Dodaj stroške v tabelo
    doc.text("Cena materiala:", 20, 130);
    doc.text(document.getElementById('materialCost').value + " EUR", 150, 130);
    
    doc.text("Cena energije:", 20, 140);
    doc.text(document.getElementById('energyCost').value + " EUR", 150, 140);
    
    doc.text("Cena dela:", 20, 150);
    doc.text(document.getElementById('laborCost').value + " EUR", 150, 150);
    
    doc.text("Skupaj:", 20, 160);
    doc.text(document.getElementById('totalCost').value + " EUR", 150, 160);

    // Dodaj dobiček
    doc.text("Dobiček:", 20, 170);
    doc.text(document.getElementById('profit').value + " EUR", 150, 170);

    // Končna cena (prodajna cena)
    doc.setFontSize(12);
    doc.text("Prodajna cena:", 20, 190);
    doc.setFontSize(14);
    doc.text(document.getElementById('finalPrice').value + " EUR", 150, 190);

    // Podpis
    doc.setFontSize(10);
    doc.text("Podpis:", 20, 210);
    doc.text("_________________________", 20, 220);

    // Shranimo PDF
    doc.save('predracun.pdf');
}


}

// Ko je stran naložena, naloži cene iz cena.json
window.onload = function() {
    loadPrices();
};
