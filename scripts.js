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

// Funkcija za zamenjavo šumnikov s črkami brez šumnikov
function replaceSpecialChars(text) {
    return text
        .replace(/š/g, 's')
        .replace(/Š/g, 'S')
        .replace(/č/g, 'c')
        .replace(/Č/g, 'C')
        .replace(/ž/g, 'z')
        .replace(/Ž/g, 'Z');
}

function exportToPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Nastavi manjšo pisavo
    doc.setFontSize(10);

    // Dinamično pridobi vrednosti iz HTML elementov
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
    let piercingCost = document.getElementById('piercingCost').value;
    let totalCost = document.getElementById('totalCostDisplay').textContent;
    let profit = document.getElementById('profitDisplay').textContent;
    let sellingPrice = document.getElementById('sellingPriceDisplay').textContent;
    let energyCost = calculateEnergyCost(); // Dodaj kalkulacijo stroškov energije
    let operatorCost = calculateOperatorCost(); // Dodaj kalkulacijo stroškov operaterja

    // Dodaj naslov podjetja
    doc.setFontSize(26); // Večja pisava
    doc.text(replaceSpecialChars('FC-Modul d.o.o.'), 10, 20);

    // Dodaj datum in številko ponudbe
    doc.setFontSize(10);
    const date = new Date().toLocaleDateString();
    const offerNumber = 'PON-' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '-001';
    doc.text(`Datum izdelave: ${date}`, 140, 40);
    doc.text(`Stevilka ponudbe: ${replaceSpecialChars(offerNumber)}`, 140, 50);

    // Opis materiala
    doc.text(replaceSpecialChars(`Vrsta materiala: ${materialType}`), 10, 60);
    doc.text(replaceSpecialChars(`Debelina: ${thickness} mm`), 10, 70);
    doc.text(replaceSpecialChars(`Cena plocevine: ${sheetPrice}`), 10, 80);
    doc.text(replaceSpecialChars(`Gabariti: ${dimensions}`), 10, 90);
    doc.text(replaceSpecialChars(`Cas reza: ${cutTime} sekund`), 10, 100);
    doc.text(replaceSpecialChars(`Stevilo prebojev: ${numCuts} prebojev`), 10, 110);
    doc.text(replaceSpecialChars(`Cena kilovatne ure (kWh): ${kWhPrice} EUR`), 10, 120);
    doc.text(replaceSpecialChars(`Amortizacija: ${amortization} EUR/h`), 10, 130);
    doc.text(replaceSpecialChars(`Marza: ${profitMargin} %`), 10, 140);

    // Stroškovni izračuni
    doc.text(replaceSpecialChars('Izracun:'), 10, 170);
    doc.text(replaceSpecialChars(`1. Strosek porabljenega materiala: ${materialCost}`), 10, 180);
    doc.text(replaceSpecialChars(`2. Strosek energije: ${energyCost} EUR`), 10, 190);
    doc.text(replaceSpecialChars(`3. Strosek operaterja: ${operatorCost} EUR`), 10, 200);
    doc.text(replaceSpecialChars(`4. Amortizacija stroja: ${amortization} EUR`), 10, 210);
    doc.text(replaceSpecialChars(`5. Strosek prebojev: ${piercingCost} EUR`), 10, 220);
    doc.text(replaceSpecialChars(`6. Skupni stroski brez dobicka: ${totalCost}`), 10, 230);
    doc.text(replaceSpecialChars(`7. Dobicek: ${profit}`), 10, 240);
    doc.text(replaceSpecialChars(`8. Prodajna cena: ${sellingPrice}`), 10, 250);
 
    // Dodaj footer z vodoravno postavitvijo podatkov
    doc.setFontSize(8); // Manjša pisava za footer
    doc.text('FC MODUL d.o.o., moduli, vibratorska tehnika  Ulica 15. maja 19/A, 6000 KOPER', 10, 280);  // Leva stran footerja
    
    // Dodaj desni del footerja na isti liniji
    doc.text('SI63716518 | Tel.: +386 (0)5 631 47 47 | mail: info@fc-modul.si | Web: www.fc-modul.si', 10, 285);

    // Shrani PDF datoteko
    doc.save("ponudba.pdf");
}

// Funkcija za izračun stroškov energije (dodaj svojo logiko)
function calculateEnergyCost() {
    // Primer: izračunaj na podlagi vnosa uporabnika
    return (parseFloat(document.getElementById('cutTime').value) * 0.45).toFixed(2);
}

// Funkcija za izračun stroškov operaterja (dodaj svojo logiko)
function calculateOperatorCost() {
    // Primer: izračunaj na podlagi vnosa uporabnika
    return (parseFloat(document.getElementById('cutTime').value) * 0.083).toFixed(2);
}


// Ko je stran naložena, naloži cene iz cena.json in nastavi privzete vrednosti
window.onload = function() {
    loadPrices(); // Nalaganje cen iz json
    
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
