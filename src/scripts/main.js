import '../styles/main.css'

// Menu mobile
const toggle = document.querySelector('[data-menu-toggle]')
const menu = document.querySelector('[data-menu]')
toggle?.addEventListener('click', () => {
  const open = menu.classList.toggle('hidden') === false
  toggle.setAttribute('aria-expanded', String(open))
})

// Année dynamique dans le footer
document.querySelectorAll('[data-year]').forEach((el) => (el.textContent = new Date().getFullYear()))
