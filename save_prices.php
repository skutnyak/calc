<?php
// Preverimo, če je prišla POST zahteva
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Dobimo surove JSON podatke
    $jsonData = file_get_contents('php://input');

    // Pretvorimo JSON podatke v PHP array
    $data = json_decode($jsonData, true);

    // Preverimo, če so podatki ustrezno prejeti
    if ($data) {
        // Pot do datoteke, kamor bomo shranili cene (npr. cena.json)
        $filePath = 'cena.json';

        // Preverimo, če je datoteka zapisljiva
        if (is_writable($filePath)) {
            // Pretvorimo array nazaj v JSON in shranimo v datoteko
            if (file_put_contents($filePath, json_encode($data, JSON_PRETTY_PRINT))) {
                // Vrnemo uspešen odziv
                echo json_encode(['success' => true]);
            } else {
                // Napaka pri pisanju v datoteko
                echo json_encode(['success' => false, 'message' => 'Napaka pri shranjevanju podatkov.']);
            }
        } else {
            // Če datoteka ni zapisljiva
            echo json_encode(['success' => false, 'message' => 'Datoteka ni zapisljiva. Preverite dovoljenja.']);
        }
    } else {
        // Napaka pri dekodiranju JSON podatkov
        echo json_encode(['success' => false, 'message' => 'Napaka pri prejemanju podatkov.']);
    }
} else {
    // Če zahteva ni POST
    echo json_encode(['success' => false, 'message' => 'Neveljavna zahteva.']);
}
?>
