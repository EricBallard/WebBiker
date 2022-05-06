function fetchHiscores() {
  var xmlhttp = new XMLHttpRequest()

  xmlhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      if (this.responseText.startsWith('<script>')) {
        // Forward redirect from ajax response..
        // Failed to connect, no session, directly connected to index.html?
        window.location.href = 'index.php'
        return
      }

      // Backup submit form
      const hiscores = document.getElementById('hiscores')
      document.getElementById('form_holder').innerHTML = hiscores.innerHTML

      // Show hiscores
      document.getElementById('leaderboard_title').innerHTML = '<u>Top 5</u>'
      hiscores.innerHTML = this.responseText
    }
  }
  xmlhttp.open('GET', '/php/view_hiscores.php', true)
  xmlhttp.setRequestHeader('HTTP_X_REQUESTED_WITH', 'xmlhttprequest')
  xmlhttp.send()
}

function updateSubmitBtn() {
  const initials = document.getElementById('name_input').value
  document.getElementById('submit_input').disabled = initials.search(/[^a-zA-Z]+/) != -1 || initials.length < 2
}

function submitScore() {
  const initials = document.getElementById('name_input').value,
    scoreObtained = score

  // Ignore scores < 1000, verify initials
  if (!initials || score < 1000 || initials.length > 3) {
    fetchHiscores()
    return
  }

  var xmlhttp = new XMLHttpRequest()

  xmlhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      fetchHiscores()
    }
  }
  xmlhttp.open(
    'GET',
    '/php/submit_score.php?initials=' + initials + '&scoreObtained=' + scoreObtained,
    true
  )

  xmlhttp.setRequestHeader('HTTP_X_REQUESTED_WITH', 'xmlhttprequest')
  xmlhttp.send()

  document.getElementById('submit_input').disabled = true
  document.getElementById('name_input').value = ''
}
