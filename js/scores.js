function fetchHiscores() {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            // Backup submit form
            const hiscores = document.getElementById("hiscores");
            document.getElementById("form_holder").innerHTML = hiscores.innerHTML;

            // Show hiscores
            document.getElementById("leaderboard_title").innerHTML = "<u>Top 5</u>";
            hiscores.innerHTML = this.responseText;
        }
    };
    xmlhttp.open("GET","/php/view_hiscores.php?ajax=1", true);
    xmlhttp.send();
}

function updateSubmitBtn() {
    const initials = document.getElementById('name_input').value;
    document.getElementById('submit_input').disabled = (initials.search(/[^a-zA-Z]+/) != -1 || initials.length < 2);
}

function submitScore() {
    const scoreObtained = score;

    if (score < 1000) {
        fetchHiscores();
        return;
    }

    const initials = document.getElementById('name_input').value;

    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            fetchHiscores();
        }
    };
    xmlhttp.open("GET","/php/submit_score.php?initials=" + initials + "&scoreObtained=" + scoreObtained + "&ajax=1", true);
    xmlhttp.send();

    document.getElementById('submit_input').disabled = true;
    document.getElementById('name_input').value = '';
}