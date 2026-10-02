import '../styles/main.css'
import './audience.js'
import { CONFIG } from './config.js'

// Menu mobile (burger) : ouverture, fermeture par Échap ou au clic sur un lien
const toggle = document.querySelector('[data-menu-toggle]')
const menu = document.querySelector('[data-menu]')
const toggleLabel = toggle?.querySelector('[data-menu-label]')
const isOpen = () => toggle?.getAttribute('aria-expanded') === 'true'

function setMenu(open, { restoreFocus = false } = {}) {
  menu.classList.toggle('hidden', !open)
  toggle.setAttribute('aria-expanded', String(open))
  if (toggleLabel) toggleLabel.textContent = open ? 'Fermer le menu' : 'Ouvrir le menu'
  if (open) menu.querySelector('a')?.focus()
  else if (restoreFocus) toggle.focus()
}
if (toggle && menu) {
  toggle.addEventListener('click', () => setMenu(!isOpen()))
  menu.addEventListener('click', (e) => { if (e.target.closest('a') && isOpen()) setMenu(false) })
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && isOpen()) setMenu(false, { restoreFocus: true }) })
}

// Apparitions au défilement (.apparition, cf. main.css ; statiques si prefers-reduced-motion)
const apparitions = document.querySelectorAll('.apparition')
if (apparitions.length && 'IntersectionObserver' in window) {
  document.documentElement.classList.add('js')
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) { entry.target.classList.add('is-in'); obs.unobserve(entry.target) }
    })
  }, { rootMargin: '0px 0px -8% 0px' })
  apparitions.forEach((el) => observer.observe(el))
}

// Année dynamique dans le footer
document.querySelectorAll('[data-year]').forEach((el) => (el.textContent = new Date().getFullYear()))

// Formulaires statiques (landing, contact).
// Adresse d'envoi : attribut action du formulaire, sinon CONFIG.contactEndpoint (config.js).
// Tant qu'aucune adresse n'est renseignée, rien n'est envoyé et on le dit.
// Erreur affichée sous le champ (élément [data-field-error] désigné par aria-describedby)
function fieldError(field, message) {
  const err = document.getElementById(field.getAttribute('aria-describedby') || '')
  if (!err?.hasAttribute('data-field-error')) return false
  err.textContent = message
  err.hidden = !message
  if (message) field.setAttribute('aria-invalid', 'true')
  else field.removeAttribute('aria-invalid')
  return true
}
const errorMessage = (field) => (field.validity.valueMissing
  ? field.dataset.msgRequired || 'Ce champ est obligatoire.'
  : field.dataset.msgInvalid || 'Cette information ne semble pas valide.')

document.querySelectorAll('[data-static-form]').forEach((form) => {
  const status = form.querySelector('[data-form-status]')
  const pending = form.querySelector('[data-form-pending]')
  const endpoint = form.getAttribute('action') || CONFIG.contactEndpoint
  if (!endpoint && pending) pending.hidden = false
  form.addEventListener('input', (e) => { if (e.target.getAttribute('aria-invalid') && e.target.checkValidity()) fieldError(e.target, '') })
  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    status.classList.remove('sr-only')
    const fields = [...form.elements].filter((el) => el.willValidate)
    const invalid = fields.filter((el) => !el.checkValidity())
    const inline = fields.map((el) => fieldError(el, el.checkValidity() ? '' : errorMessage(el))).some(Boolean)
    if (invalid.length) {
      status.textContent = inline
        ? `${invalid.length > 1 ? `${invalid.length} champs sont à compléter` : 'Un champ est à compléter'}.`
        : invalid[0].type === 'email' ? 'Cet email ne semble pas valide (exemple : prenom@domaine.fr).' : 'Il manque une information obligatoire.'
      status.dataset.state = 'error'
      invalid[0].focus()
      return
    }
    if (!endpoint) {
      status.textContent = 'Le formulaire n’est pas encore relié : rien n’a été envoyé ni enregistré. Merci de votre patience, le branchement arrive bientôt.'
      status.dataset.state = 'info'
      // La note visible le dit déjà : on la met en avant et on n'annonce le message qu'aux lecteurs d'écran
      if (pending) { status.classList.add('sr-only'); pending.classList.add('ring-2', 'ring-rose') }
      return
    }
    try {
      const res = await fetch(endpoint, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
      if (!res.ok) throw new Error(String(res.status))
      form.reset()
      status.textContent = 'C’est envoyé, merci ! Réponse par email.'
      status.dataset.state = 'ok'
    } catch {
      status.textContent = 'Le message n’est pas parti et rien n’a été transmis. Merci de réessayer un peu plus tard.'
      status.dataset.state = 'error'
    }
  })
})
