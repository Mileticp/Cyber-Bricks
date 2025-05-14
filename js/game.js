document.addEventListener('DOMContentLoaded', function() {
    var countdown = document.getElementById('countdown');
    var time = 15;
    
    function updateCountdown() {
        countdown.textContent = time;
        time--;
        
        if (time < 0) {
            window.location.reload();
        }
    }
    
    // Update immediately and then every second
    updateCountdown();
    setInterval(updateCountdown, 1000);
}); 