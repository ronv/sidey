const themePreference = () => {
  const hasLocalStorage = localStorage.getItem('theme')

  let supports = false
  let theme

  if (hasLocalStorage === 'light') { theme = 'light' }
  if (hasLocalStorage === 'dark') { theme = 'dark' }

  if (window.matchMedia(`(prefers-color-scheme: dark)`).matches) {
    theme = hasLocalStorage || 'dark'
    supports = true
  };
  if (window.matchMedia(`(prefers-color-scheme: light)`).matches) {
    theme = hasLocalStorage || 'light'
    supports = true
  };
  if (window.matchMedia(`(prefers-color-scheme: no-preference)`).matches) {
    theme = hasLocalStorage || 'none'
    supports = true
  };

  return { supports, theme }
}

document.addEventListener('DOMContentLoaded', e => {
  console.clear()

  const userThemePreference = themePreference()
  const toggle = document.querySelector('.darkmode-toggle')
  const html = document.documentElement

  const setTheme = () => {
    switch (userThemePreference.theme) {
      case 'dark':
        toggle.checked = true
        html.classList.add('dark')
        html.classList.remove('light')
        break
      case 'light':
        toggle.checked = false
        html.classList.remove('dark')
        html.classList.add('light')
        break
    }
  }
  setTheme()

  // clearStorage.addEventListener('click', e => {
  //   localStorage.removeItem('theme')
  //   console.info('local storage cleared')
  // }, false)

  toggle.addEventListener('click', e => {
    console.log('toggle')
    if (toggle.checked) {
      html.classList.add('dark')
      html.classList.remove('light')
      localStorage.setItem('theme', 'dark')
    } else {
      html.classList.remove('dark')
      html.classList.add('light')
      localStorage.setItem('theme', 'light')
    }
  }, false)
}, false)
