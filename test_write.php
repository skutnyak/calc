<?php
$testData = array("test" => "success");
$result = file_put_contents('cena.json', json_encode($testData));
if ($result) {
    echo "Pisanje v datoteko je bilo uspešno!";
} else {
    echo "Napaka pri pisanju v datoteko.";
}
?>
