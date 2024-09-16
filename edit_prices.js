// Ob nalaganju strani nastavi privzeto vrednost formata na 1000x2000
window.onload = function() {
    const slider = document.getElementById('sheetSizeSlider');
    slider.value = "0"; // Nastavi slider na "0" za 1000x2000 mm
    updateSheetSizeDisplay(); // Posodobi prikaz formata
    showPriceTables(); // Prikaz tabele za privzeti format
}

// Funkcija za posodabljanje prikaza formata glede na slider
function updateSheetSizeDisplay() {
    const slider = document.getElementById('sheetSizeSlider');
    const display = document.getElementById('sheetSizeDisplay');

    if (slider.value === "0") {
        display.textContent = "1000x2000 mm";
    } else {
        display.textContent = "1250x2500 mm";
    }

    // Prikaži tabele glede na izbrani format
    showPriceTables();
}

// Funkcija za prikaz tabele glede na izbrani format
function showPriceTables() {
    const sliderValue = document.getElementById('sheetSizeSlider').value;
    const selectedFormat = sliderValue === "0" ? "1000x2000" : "1250x2500";

    document.getElementById('priceTables').classList.remove('hidden');
    loadPricesForFormat(selectedFormat);
}

// Funkcija za nalaganje cen iz JSON datoteke
function loadPricesForFormat(format) {
    fetch('cena.json?timestamp=' + new Date().getTime()) // Preprečimo cache
    .then(response => response.json())
    .then(data => {
        const ironPrices = data.iron[format];
        const inoxPrices = data.inox[format];
        const aluminumPrices = data.aluminum[format];

        // Posodobi tabele z ustreznimi cenami
        populatePriceTable("ironPrices", ironPrices);
        populatePriceTable("inoxPrices", inoxPrices);
        populatePriceTable("aluminumPrices", aluminumPrices);
    })
    .catch(error => console.error('Napaka pri nalaganju cen:', error));
}

// Funkcija za shranjevanje cen in posodabljanje samo spremenjenih vrednosti
function savePrices() {
    fetch('cena.json')
    .then(response => response.json())
    .then(existingData => {
        // Pridobi cene za oba formata iz vseh tabel
        const ironPrices1000 = getPricesFromTable('ironPrices1000');
        const ironPrices1250 = getPricesFromTable('ironPrices1250');
        const inoxPrices1000 = getPricesFromTable('inoxPrices1000');
        const inoxPrices1250 = getPricesFromTable('inoxPrices1250');
        const aluminumPrices1000 = getPricesFromTable('aluminumPrices1000');
        const aluminumPrices1250 = getPricesFromTable('aluminumPrices1250');

        const updatedData = {
            iron: {
                '1000x2000': { ...existingData.iron['1000x2000'], ...ironPrices1000 },
                '1250x2500': { ...existingData.iron['1250x2500'], ...ironPrices1250 }
            },
            inox: {
                '1000x2000': { ...existingData.inox['1000x2000'], ...inoxPrices1000 },
                '1250x2500': { ...existingData.inox['1250x2500'], ...inoxPrices1250 }
            },
            aluminum: {
                '1000x2000': { ...existingData.aluminum['1000x2000'], ...aluminumPrices1000 },
                '1250x2500': { ...existingData.aluminum['1250x2500'], ...aluminumPrices1250 }
            }
        };

        // Pošlji posodobljene podatke nazaj na strežnik
        fetch('save_prices.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Cene so bile uspešno shranjene.');
            } else {
                alert('Prišlo je do napake pri shranjevanju.');
            }
        });
    });
}

// Funkcija za pridobivanje cen iz tabele
function getPricesFromTable(tableId) {
    const rows = document.querySelectorAll(`#${tableId} tr`);
    const prices = {};
    rows.forEach(row => {
        const thickness = row.querySelector('td:first-child').textContent;
        const priceInput = row.querySelector('input');
        const priceValue = parseFloat(priceInput.value);

        // Preverimo, če je cena veljavna številka ali vrednost "1"
        if (!isNaN(priceValue) && priceValue >= 1) {
            prices[thickness] = priceValue;
        } else {
            // Če je neveljavna ali prazna vrednost, obdržimo staro vrednost
            prices[thickness] = parseFloat(priceInput.getAttribute('data-original')) || 0;
        }
    });
    return prices;
}

// Funkcija za pravilno razvrščanje debelin v tabelah
function populatePriceTable(tableId, prices) {
    const tableBody = document.getElementById(tableId);
    tableBody.innerHTML = ''; // Počisti tabelo

    for (const thickness in prices) {
        const row = document.createElement('tr');

        const thicknessCell = document.createElement('td');
        thicknessCell.textContent = thickness;

        const priceCell = document.createElement('td');
        const priceInput = document.createElement('input');
        priceInput.type = 'number';
        priceInput.value = parseFloat(prices[thickness]); // Pretvori v število
        priceInput.classList.add('price-input');

        priceInput.setAttribute('data-original', prices[thickness]); // Shranimo izvorno vrednost

        priceCell.appendChild(priceInput);
        row.appendChild(thicknessCell);
        row.appendChild(priceCell);
        tableBody.appendChild(row);
    }
}

// Funkcija za prehod nazaj na index.html
function goBackToCalculator() {
    window.location.href = 'index.html';
}
function populatePriceTable(tableId, prices) {
    const tableBody = document.getElementById(tableId);
    tableBody.innerHTML = ''; // Počisti tabelo

    for (const thickness in prices) {
        const row = document.createElement('tr');

        const thicknessCell = document.createElement('td');
        thicknessCell.textContent = thickness;

        const priceCell = document.createElement('td');
        const priceInput = document.createElement('input');
        priceInput.type = 'number';
        priceInput.value = parseFloat(prices[thickness]); // Pretvori v število
        priceInput.classList.add('price-input');

        // Dodaj ID in name za boljšo identifikacijo polj
        priceInput.id = `price_${tableId}_${thickness}`;
        priceInput.name = `price_${tableId}_${thickness}`;

        priceInput.setAttribute('data-original', prices[thickness]); // Shranimo izvorno vrednost

        priceCell.appendChild(priceInput);
        row.appendChild(thicknessCell);
        row.appendChild(priceCell);
        tableBody.appendChild(row);
    }
}

