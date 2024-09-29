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
    fetch('cena.json')
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
function savePrices() {
    const ironPrices = getPricesFromTable('ironPrices');
    const inoxPrices = getPricesFromTable('inoxPrices');
    const aluminumPrices = getPricesFromTable('aluminumPrices');

    const data = {
        iron: {
            "1000x2000": ironPrices,
            "1250x2500": ironPrices
        },
        inox: {
            "1000x2000": inoxPrices,
            "1250x2500": inoxPrices
        },
        aluminum: {
            "1000x2000": aluminumPrices,
            "1250x2500": aluminumPrices
        }
    };

    // Pošlji podatke na PHP skripto za shranjevanje
    fetch('save_prices.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
        if (result.status === "success") {
            alert('Cene so bile uspešno shranjene!');
        } else {
            alert('Prišlo je do napake: ' + result.message);
        }
    })
    .catch(error => {
        console.error('Napaka pri shranjevanju cen:', error);
    });
}
function getPricesFromTable(tableId) {
    const tableBody = document.getElementById(tableId);
    const rows = tableBody.getElementsByTagName('tr');
    const prices = {};

    for (const row of rows) {
        const thickness = row.cells[0].textContent;
        const price = row.cells[1].getElementsByTagName('input')[0].value;
        prices[thickness] = parseFloat(price); // Pretvori vrednost v številko
    }

    return prices;
}
