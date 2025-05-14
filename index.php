<?php
require_once 'includes/config.php';
require_once 'includes/game-logic.php';

session_start();

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $errors = validatePlayerInput($_POST);
    
    if (empty($errors)) {
        $_SESSION['users'] = [
            [
                'ime' => $_POST['ime1'],
                'priimek' => $_POST['priimek1']
            ],
            [
                'ime' => $_POST['ime2'],
                'priimek' => $_POST['priimek2']
            ],
            [
                'ime' => $_POST['ime3'],
                'priimek' => $_POST['priimek3']
            ]
        ];
        
        $_SESSION['kocke'] = [];
        for ($i = 0; $i < MAX_PLAYERS; $i++) {
            $_SESSION['kocke'][$i] = rollDice(DICE_PER_PLAYER);
        }
        
        header('Location: ' . $_SERVER['PHP_SELF']);
        exit;
    }
}

$player_data = [];
if (isset($_SESSION['users']) && isset($_SESSION['kocke'])) {
    $player_data = sortPlayersByScore($_SESSION['users'], $_SESSION['kocke']);
}
?>

<!DOCTYPE html>
<html lang="sl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Igralne Kocke</title>
    <link rel="icon" type="image/png" href="images/favicon.png">
    <link rel="stylesheet" href="css/style.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.min.css">
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <script>
        window.onload = function() {
            <?php if (empty($player_data) && $_SERVER['REQUEST_METHOD'] !== 'POST'): ?>
            Swal.fire({
                title: '<span style="color: #ffd700">Navodila za igro</span>',
                html: `
                    <div style="text-align: left; color: white; font-size: 1.1em">
                        <p><span style="color: #ffd700">1.</span> Vnesite podatke za vse 3 igralce</p>
                        <p><span style="color: #ffd700">2.</span> Vsak igralec bo vrgel ${<?php echo DICE_PER_PLAYER; ?>} kocke</p>
                        <p><span style="color: #ffd700">3.</span> Zmagovalec se določi glede na vsoto vseh vrednosti kock</p>
                        <p><span style="color: #ffd700">4.</span> Po koncu igre se bo stran avtomatsko osvežila</p>
                    </div>
                `,
                background: 'linear-gradient(145deg, rgba(43, 43, 43, 0.95), rgba(28, 28, 28, 0.95))',
                backdrop: `
                    rgba(0,0,0,0.7)
                    url("images/casino-chips.jpg")
                    center top
                    / cover
                    fixed
                `,
                showConfirmButton: true,
                confirmButtonText: 'Razumem',
                confirmButtonColor: '#ffd700',
                customClass: {
                    popup: 'sweet-popup',
                    title: 'sweet-title',
                    content: 'sweet-content',
                    confirmButton: 'sweet-confirm'
                },
                width: '600px',
                padding: '2em',
                border: '1px solid rgba(255, 215, 0, 0.3)',
                borderRadius: '15px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)'
            });
            <?php endif; ?>
        };
    </script>
</head>
<body>
    <?php if (empty($player_data)): ?>
        <h1>Vnos Igralcev</h1>
        <?php if (!empty($errors)): ?>
            <div class="errors">
                <?php foreach ($errors as $error): ?>
                    <p class="error"><?php echo htmlspecialchars($error); ?></p>
                <?php endforeach; ?>
            </div>
        <?php endif; ?>
        <form method="post" action="<?php echo htmlspecialchars($_SERVER['PHP_SELF']); ?>">
            <div class="form-container">
                <?php for ($i = 1; $i <= MAX_PLAYERS; $i++): ?>
                <div class="square">
                    <h2>Igralec <?php echo $i; ?></h2>
                    <div class="form-group">
                        <label for="ime<?php echo $i; ?>">Ime:</label>
                        <input type="text" id="ime<?php echo $i; ?>" name="ime<?php echo $i; ?>" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="priimek<?php echo $i; ?>">Priimek:</label>
                        <input type="text" id="priimek<?php echo $i; ?>" name="priimek<?php echo $i; ?>" required>
                    </div>
                </div>
                <?php endfor; ?>
            </div>
            <input type="submit" value="Začni Igro">
        </form>
    <?php else: ?>
        <h1>Rezultati Metov Kock</h1>
        
        <div class="podium">
            <div class="firework-container">
                <?php for ($i = 1; $i <= 8; $i++): ?>
                    <div class="firework"></div>
                <?php endfor; ?>
            </div>
            <?php for ($i = 0; $i < MAX_PLAYERS; $i++): ?>
                <div class="podium-step">
                    <div class="podium-trophy">
                        <?php 
                            if ($i == 0) echo "🏆";
                            else if ($i == 1) echo "🥈";
                            else echo "🥉";
                        ?>
                    </div>
                    <div class="podium-name">
                        <?php echo htmlspecialchars($player_data[$i]['player']['ime'] . ' ' . $player_data[$i]['player']['priimek']); ?>
                    </div>
                    <div class="<?php echo $i == 0 ? 'podium-first' : ($i == 1 ? 'podium-second' : 'podium-third'); ?>">
                        <div class="podium-position"><?php echo $i + 1; ?></div>
                    </div>
                    <div class="podium-score"><?php echo $player_data[$i]['score']; ?> točk</div>
                </div>
            <?php endfor; ?>
        </div>
        
        <div class="container results-container">
            <?php foreach ($player_data as $i => $player): ?>
            <div class="square <?php echo $i == 0 ? 'winner-gold' : ($i == 1 ? 'winner-silver' : 'winner-bronze'); ?>">
                <h2><?php echo ($i+1) . '. ' . htmlspecialchars($player['player']['ime'] . ' ' . $player['player']['priimek']); ?></h2>
                
                <div class="dice-container">
                    <?php foreach ($player['dice'] as $vrednost): ?>
                        <div class="dice"><?php echo $vrednost; ?></div>
                    <?php endforeach; ?>
                </div>
                
                <p>Skupaj: <?php echo $player['score']; ?></p>
                <p>Mesto: <?php echo $i+1; ?></p>
            </div>
            <?php endforeach; ?>
        </div>
        
        <div class="countdown">
            Nova igra čez: <span id="countdown">15</span> sekund
        </div>
        
        <div class="back-button-container">
            <button onclick="window.location.href='index.php'" class="back-button">Nazaj</button>
        </div>
        
        <script src="js/game.js"></script>
    <?php 
        session_unset();
        session_destroy();
    endif; 
    ?>
</body>
</html>