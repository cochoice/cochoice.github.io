// Page « Découvrir l'appli » (mvp.html) : intro, raccourcis et prototype cliquable.
// Sous 768 px, l'appli s'ouvre en plein écran, sans cadre, avec « Quitter la démo ».
import '../styles/main.css'
import '../styles/mvp.css'
import './audience.js'
import { CONFIG } from './config.js'
import { initApp } from './app/index.js'

const FEEDBACK_PENDING = 'Le formulaire n’est pas encore en ligne. En attendant, tu peux nous écrire via la page Contact.'
const mobile = window.matchMedia('(max-width: 767.98px)')
const shell = document.querySelector('[data-app]')
const outside = () => document.querySelectorAll('[data-page]')
let opener = null

// Formulaire unique (Google Form) ; sans URL, on le dit au lieu d'ouvrir un lien mort
function openFeedback(announce) {
  if (CONFIG.feedbackFormUrl) window.open(CONFIG.feedbackFormUrl, '_blank', 'noopener')
  else announce(FEEDBACK_PENDING)
}

const app = initApp(shell, { onFeedback: openFeedback })

/* ----- Plein écran mobile ----- */
function openFull() {
  if (!mobile.matches || shell.classList.contains('is-full')) return
  opener = document.activeElement
  shell.classList.add('is-full')
  shell.setAttribute('role', 'dialog')
  shell.setAttribute('aria-modal', 'true')
  document.documentElement.classList.add('app-open')
  outside().forEach((el) => { el.inert = true })
}
function closeFull() {
  if (!shell.classList.contains('is-full')) return
  shell.classList.remove('is-full')
  shell.removeAttribute('role')
  shell.removeAttribute('aria-modal')
  document.documentElement.classList.remove('app-open')
  outside().forEach((el) => { el.inert = false })
  ;(opener && document.contains(opener) ? opener : document.querySelector('[data-app-open]'))?.focus()
}
document.querySelector('[data-app-open]')?.addEventListener('click', () => {
  openFull()
  shell.querySelector('[data-focus], .a-title, [role="tab"][aria-selected="true"]')?.focus()
})
shell.querySelector('[data-app-quit]')?.addEventListener('click', closeFull)
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeFull() })
mobile.addEventListener('change', () => { if (!mobile.matches) closeFull() })

/* ----- Raccourcis « À tester en 2 minutes » et « Recommencer la démo » ----- */
document.querySelectorAll('[data-shortcut]').forEach((btn) => btn.addEventListener('click', () => {
  openFull()
  app.shortcut(btn.dataset.shortcut)
}))
const restartMsg = document.querySelector('[data-restart-msg]')
document.querySelector('[data-restart]')?.addEventListener('click', () => {
  app.restart()
  if (restartMsg) restartMsg.textContent = 'Démo remise à zéro : le prototype repart du démarrage.'
})

/* ----- « Être prévenu·e du lancement » (hors de l'appli) ----- */
document.querySelectorAll('[data-feedback-link]').forEach((link) => {
  const msg = document.getElementById(link.dataset.feedbackMsg || '')
  if (CONFIG.feedbackFormUrl) {
    Object.assign(link, { href: CONFIG.feedbackFormUrl, target: '_blank', rel: 'noopener' })
    return
  }
  link.addEventListener('click', (e) => {
    e.preventDefault()
    if (msg) msg.textContent = FEEDBACK_PENDING
  })
})

document.querySelectorAll('[data-year]').forEach((el) => (el.textContent = new Date().getFullYear()))
