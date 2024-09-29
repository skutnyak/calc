<?php
// Preveri, ali so podatki poslani s POST metodo
$data = file_get_contents("php://input");

// Dekodiraj JSON podatke
$prices = json_decode($data, true);

if (is_array($prices)) {
    // Zapiši podatke v datoteko cena.json
    if (file_put_contents('cena.json', json_encode($prices, JSON_PRETTY_PRINT))) {
        // Pošlji uspešno sporočilo nazaj
        echo json_encode(["status" => "success", "message" => "Cene so bile uspešno shranjene."]);
    } else {
        // Če pride do napake pri pisanju
        echo json_encode(["status" => "error", "message" => "Napaka pri shranjevanju podatkov v datoteko."]);
    }
} else {
    // V primeru napake pri prejemu podatkov
    echo json_encode(["status" => "error", "message" => "Napaka pri prejemu podatkov."]);
}
?>
