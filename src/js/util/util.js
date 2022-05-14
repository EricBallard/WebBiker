export let random = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

export let isBot = () => {
  return (
    navigator.webdriver ||
    window.innerWidth < 400 ||
    window.innerHeight < 400 ||
    /bot|googlebot|crawler|spider|robot|curl|crawling/i.test(navigator.userAgent)
  )
}

export let isCookieValid = () => {
  let cookie = getCookie()
  if (!cookie) return false

  let decoded = cookie.split('.')[1]
  decoded = atob(decoded.replace(/_/g, '/').replace(/-/g, '+'))

  let json = JSON.parse(decoded)
  if (!json) return false

  return json.expiration < Date.now()
}

export let getCookie = () => {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${'AUTH'}=`)
  if (parts.length === 2) return parts.pop().split(';').shift()
}

export let getImg = src => {
  let img = new Image()
  img.src = src
  return img
}
