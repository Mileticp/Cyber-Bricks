<?php
function rollDice($numDice = 3) {
    $results = array();
    for ($i = 0; $i < $numDice; $i++) {
        $results[] = rand(1, 6);
    }
    return $results;
}

function calculateScore($diceResults) {
    $total = 0;
    foreach ($diceResults as $value) {
        $total = $total + $value;
    }
    return $total;
}

function sortPlayersByScore($players, $diceResults) {
    $playerData = array();
    foreach ($players as $index => $player) {
        $playerData[] = array(
            'index' => $index,
            'player' => $player,
            'dice' => $diceResults[$index],
            'score' => array_sum($diceResults[$index])
        );
    }
    
    usort($playerData, function($a, $b) {
        return $b['score'] - $a['score'];
    });
    
    return $playerData;
}

function validatePlayerInput($post) {
    $errors = array();
    for ($i = 1; $i <= 3; $i++) {
        if (empty($post["ime$i"]) || !preg_match("/^[a-zA-Z\s]+$/", $post["ime$i"])) {
            $errors[] = "Invalid name for player $i";
        }
        if (empty($post["priimek$i"]) || !preg_match("/^[a-zA-Z\s]+$/", $post["priimek$i"])) {
            $errors[] = "Invalid surname for player $i";
        }
    }
    return $errors;
} 