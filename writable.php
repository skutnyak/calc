<?php
$filePath = 'cena.json';
if (is_writable($filePath)) {
    echo "Datoteka je zapisljiva.";
} else {
    echo "Datoteka ni zapisljiva. Preverite dovoljenja.";
}
?>
