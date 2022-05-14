import { getCookie, isBot } from './util.js'

export let updateSubmitBtn = () => {
  const initials = document.getElementById('name_input').value
  document.getElementById('submit_input').disabled = initials.search(/[^a-zA-Z]+/) != -1 || initials.length < 2
}

export let fetch = () => {
  let xmlhttp = new XMLHttpRequest()

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
  xmlhttp.open('GET', './php/view_hiscores.php', true)
  xmlhttp.setRequestHeader('X-Requested-With', 'xmlhttprequest')
  xmlhttp.send()
}

export let submit = player => {
  if (!player) return

  // Anti-tamper detection
  if (isBot()) {
    fetch()
    return
  }

  const initials = document.getElementById('name_input').value,
    score = player.score,
    jwt = getCookie()

  // Ignore scores < 1000, verify initials
  if (!initials || initials.length > 3 || score < 1000 || !jwt) {
    fetch()
    return
  }

  let xmlhttp = new XMLHttpRequest()

  xmlhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      fetch()
    }
  }

  xmlhttp.open('GET', './php/submit_score.php?initials=' + initials + '&score=' + score + '&auth=' + jwt, true)

  xmlhttp.setRequestHeader('X-Requested-With', 'xmlhttprequest')
  xmlhttp.send()

  document.getElementById('submit_input').disabled = true
  document.getElementById('name_input').value = ''
}
