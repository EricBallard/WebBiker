export function getCookie() {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${'AUTH'}=`)
  if (parts.length === 2) return parts.pop().split(';').shift()
}

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
  xmlhttp.setRequestHeader('X-Requested-With', 'xmlhttprequest')
  xmlhttp.send()
}

function updateSubmitBtn() {
  const initials = document.getElementById('name_input').value
  document.getElementById('submit_input').disabled = initials.search(/[^a-zA-Z]+/) != -1 || initials.length < 2
}

function isBot() {
  return navigator.webdriver || /bot|googlebot|crawler|spider|robot|curl|crawling/i.test(navigator.userAgent)
}

function submitScore() {
  // Anti-tamper detection
  if (isBot() || window.innerWidth < 400 || window.innerHeight < 400) {
    fetchHiscores()
    return
  }

  const initials = document.getElementById('name_input').value,
    scoreObtained = score,
    jwt = getCookie()

  // Ignore scores < 1000, verify initials
  if (!initials || !jwt || score < 1000 || initials.length > 3) {
    fetchHiscores()
    return
  }

  var xmlhttp = new XMLHttpRequest()

  xmlhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      fetchHiscores()
    }

    console.log(this.response)
  }

  xmlhttp.open('GET', '/php/submit_score.php?initials=' + initials + '&score=' + scoreObtained + '&auth=' + jwt, true)

  xmlhttp.setRequestHeader('X-Requested-With', 'xmlhttprequest')
  xmlhttp.send()

  document.getElementById('submit_input').disabled = true
  document.getElementById('name_input').value = ''
}
