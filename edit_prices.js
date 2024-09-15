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

// Popravljena funkcija za nalaganje cen, ki pravilno razvršča debeline
function loadPricesForFormat(format) {
    const ironPrices = {
        "1": 26, "1.5": 39, "2": 52, "3": 78, "4": 105, "5": 130, "6": 156, "8": 208, "10": 200
    };
    const inoxPrices = {
        "1": 80, "1.5": 100, "2": 120, "3": 160, "4": 180, "5": 220, "6": 260, "8": 320, "10": 360
    };
    const aluminumPrices = {
        "1": 30, "1.5": 40, "2": 50, "3": 70, "4": 80, "5": 100, "6": 120, "8": 160, "10": 180
    };

    // Poskrbi, da so debeline razvrščene pravilno
    populatePriceTable("ironPrices", sortThickness(ironPrices));
    populatePriceTable("inoxPrices", sortThickness(inoxPrices));
    populatePriceTable("aluminumPrices", sortThickness(aluminumPrices));
}

// Funkcija za pravilno razvrščanje debelin
function sortThickness(prices) {
    return Object.keys(prices)
        .sort((a, b) => parseFloat(a) - parseFloat(b)) // Sortiraj po številčni vrednosti
        .reduce((sortedPrices, key) => {
            sortedPrices[key] = prices[key];
            return sortedPrices;
        }, {});
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
        priceInput.value = prices[thickness];
        priceInput.classList.add('price-input');

        priceCell.appendChild(priceInput);
        row.appendChild(thicknessCell);
        row.appendChild(priceCell);
        tableBody.appendChild(row);
    }
}
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

// Ostale funkcije ostanejo enake...
