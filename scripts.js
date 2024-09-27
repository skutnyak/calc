// Funkcija za nalaganje cen iz JSON datoteke
function loadPrices() {
    fetch('cena.json')
        .then(response => response.json())
        .then(data => {
            sheetPrices = data;
            updateSheetPrice();
        })
        .catch(error => console.error('Napaka pri nalaganju cen:', error));
}

// Posodobi cene na podlagi izbrane vrste materiala, debeline in velikosti
function updateSheetPrice() {
    const materialType = document.getElementById('materialType').value;
    const sheetSize = document.getElementById('sheetSize').value;
    const thickness = document.getElementById('thickness').value;
    const sheetPriceDisplay = document.getElementById('sheetPriceDisplay');

    if (sheetPrices[materialType] && sheetPrices[materialType][sheetSize] && sheetPrices[materialType][sheetSize][thickness]) {
        const sheetPrice = parseFloat(sheetPrices[materialType][sheetSize][thickness]);
        sheetPriceDisplay.textContent = sheetPrice ? `${sheetPrice.toFixed(2)} EUR` : 'Cena ni veljavna.';
        calculatePricePerMm2(sheetPrice);
    } else {
        sheetPriceDisplay.textContent = 'Cena ni definirana za izbrane parametre.';
        document.getElementById('pricePerMm2').textContent = '---';
    }
}

// Izračun cene na kvadratni milimeter
function calculatePricePerMm2(sheetPrice) {
    const sheetSize = document.getElementById('sheetSize').value;
    let width, height;
    if (sheetSize === '1000x2000') {
        width = 1000;
        height = 2000;
    } else {
        width = 1250;
        height = 2500;
    }
    const area = width * height;
    const pricePerMm2 = sheetPrice / area;
    document.getElementById('pricePerMm2').textContent = pricePerMm2.toFixed(8) + ' EUR/mm²';
}

// Funkcija za izračun stroškov materiala v realnem času
function calculateMaterialCost() {
    const cutLength = parseFloat(document.getElementById('cutLength').value) || 0;
    const cutWidth = parseFloat(document.getElementById('cutWidth').value) || 0;
    const pricePerMm2 = parseFloat(document.getElementById('pricePerMm2').textContent) || 0;

    // Izračun stroška porabljenega materiala
    const materialCost = cutLength * cutWidth * pricePerMm2;

    // Posodobi prikaz stroška materiala v stolpcu "Parametri razreza"
    document.getElementById('materialCostColumnDisplay').textContent = `${materialCost.toFixed(2)} EUR`;

    // Vrni strošek materiala za nadaljnjo uporabo v povzetku
    return materialCost;
}

// Posodobitev funkcije "calculateAll"
function calculateAll() {
    // Kličemo funkcijo za izračun stroškov materiala
    const materialCost = calculateMaterialCost();

    // Prikažemo vrednost v povzetku
    document.getElementById('materialCostDisplay').textContent = `Cena porabljenega materiala: ${materialCost.toFixed(2)} EUR`;

    // Preostali izračuni za razrez
    const cutTime = parseFloat(document.getElementById('cutTime').value) || 0;
    const energyCost = parseFloat(document.getElementById('energyCost').value) || 0;
    const laserPower = parseFloat(document.getElementById('laserPower').value) || 3000;
    const energyCostPerSecond = (laserPower / 1000) * (energyCost / 3600);
    const totalEnergyCost = energyCostPerSecond * cutTime;

    const operatorRate = parseFloat(document.getElementById('operatorRate').value) || 30;
    const operatorCost = (operatorRate / 3600) * cutTime;
    const sheetChangeCost = parseFloat(document.getElementById('sheetChangeCost').value) || 10;

    // Cena razreza vključuje stroške energije, operaterja in menjavo pločevine
    const cuttingCost = totalEnergyCost + operatorCost + sheetChangeCost;
    document.getElementById('cuttingCostDisplay').textContent = `Cena razreza: ${cuttingCost.toFixed(2)} EUR`;

    // Cena prebojev
    const numPiercings = parseFloat(document.getElementById('numCuts').value) || 0;
    const piercingCostPerUnit = parseFloat(document.getElementById('piercingCost').value) || 0;
    const totalPiercingCost = numPiercings * piercingCostPerUnit;
    document.getElementById('piercingCostDisplay').textContent = `Cena prebojev: ${totalPiercingCost.toFixed(2)} EUR`;

    // Končna cena vključuje vse stroške (material, razrez, preboji, marža)
    const profitMargin = parseFloat(document.getElementById('profitMargin').value) || 20;
    const profit = (cuttingCost + totalPiercingCost) * profitMargin / 100;
    const finalPrice = materialCost + cuttingCost + totalPiercingCost + profit;
    document.getElementById('totalCostDisplay').textContent = `Koncna cena: ${finalPrice.toFixed(2)} EUR`;
}

function exportToPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Nastavi manjšo pisavo
    doc.setFontSize(10);

    // Dinamično pridobi vrednosti iz izračunanih rezultatov
    let materialType = document.getElementById('materialType').value;
    let thickness = document.getElementById('thickness').value;
    let sheetPrice = document.getElementById('sheetPriceDisplay').textContent;
    let dimensions = `${document.getElementById('cutLength').value} mm x ${document.getElementById('cutWidth').value} mm`;
    let cutTime = document.getElementById('cutTime').value;
    let numCuts = document.getElementById('numCuts').value;
    let kWhPrice = document.getElementById('energyCost').value;
    let amortization = document.getElementById('amortization').value;
    let profitMargin = document.getElementById('profitMargin').value;

    let materialCost = document.getElementById('materialCostDisplay').textContent;
    let cuttingCost = document.getElementById('cuttingCostDisplay').textContent;
    let piercingCost = document.getElementById('piercingCostDisplay').textContent;
    let totalCost = document.getElementById('totalCostDisplay').textContent;
    let profit = document.getElementById('profitDisplay') ? document.getElementById('profitDisplay').textContent : 'N/A';
    let sellingPrice = document.getElementById('sellingPriceDisplay') ? document.getElementById('sellingPriceDisplay').textContent : totalCost;

    // Dodaj naslov podjetja
    doc.setFontSize(26); // Večja pisava
    doc.text('FC-Modul d.o.o.', 10, 20);

    // Dodaj datum in številko ponudbe
    doc.setFontSize(10);
    const date = new Date().toLocaleDateString();
    const offerNumber = 'PON-' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '-001';
    doc.text(`Datum izdelave: ${date}`, 140, 40);
    doc.text(`Številka ponudbe: ${offerNumber}`, 140, 50);

    // Opis materiala in parametrov reza
    doc.text(`Vrsta materiala: ${materialType}`, 10, 60);
    doc.text(`Debelina: ${thickness} mm`, 10, 70);
    doc.text(`Cena plocevine: ${sheetPrice}`, 10, 80);
    doc.text(`Gabariti: ${dimensions}`, 10, 90);
    doc.text(`Cas reza: ${cutTime} sekund`, 10, 100);
    doc.text(`Stevilo prebojev: ${numCuts} prebojev`, 10, 110);
    doc.text(`Cena kilovatne ure (kWh): ${kWhPrice} EUR`, 10, 120);
    doc.text(`Amortizacija: ${amortization} EUR/h`, 10, 130);
    doc.text(`Marza: ${profitMargin} %`, 10, 140);

    // Stroškovni izračuni
    doc.text('Izracun:', 10, 170);
    doc.text(`1. ${materialCost}`, 10, 180);
    doc.text(`2. ${cuttingCost}`, 10, 190);
    doc.text(`3. ${piercingCost}`, 10, 200);
    doc.text(`4. ${totalCost}`, 10, 210);
    
    // Dodaj footer
    doc.setFontSize(8); // Manjša pisava za footer
    doc.text('FC MODUL d.o.o., moduli, vibratorska tehnika Ulica 15. maja 19/A, 6000 KOPER', 10, 280);
    doc.text('SI63716518 | Tel.: +386 (0)5 631 47 47 | mail: info@fc-modul.si | Web: www.fc-modul.si', 10, 285);

    // Shrani PDF datoteko
    doc.save("ponudba.pdf");
}




// Nalaganje strani
window.onload = function() {
    loadPrices();

  // Nastavi privzete vrednosti
    document.getElementById('materialType').value = 'inox'; // Vrsta materiala - Inox
    document.getElementById('thickness').value = '2'; // Debelina materiala - 2 mm
    document.getElementById('sheetSize').value = '1000x2000'; // Format pločevine - 1000x2000
    document.getElementById('piercingCost').value = '0.5'; // Cena preboja - 0,5 EUR
    document.getElementById('laserPower').value = '3000'; // Moč laserja - 3000 W
    document.getElementById('energyCost').value = '0.9'; // Cena kilovatne ure - 0,9 EUR
    document.getElementById('operatorRate').value = '30'; // Delovna ura operaterja - 30 EUR/h
    document.getElementById('sheetChangeCost').value = '10'; // Menjava pločevine - 10 EUR
    document.getElementById('amortization').value = '0.50'; // Amortizacija - 0,50 EUR/h
    document.getElementById('profitMargin').value = '20'; // Marža - 20%



};
