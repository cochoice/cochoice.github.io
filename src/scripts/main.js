import '../styles/main.css'
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

// Année dynamique dans le footer
document.querySelectorAll('[data-year]').forEach((el) => (el.textContent = new Date().getFullYear()))

// Formulaires statiques (landing, contact).
// Adresse d'envoi : attribut action du formulaire, sinon CONFIG.contactEndpoint (config.js).
// Tant qu'aucune adresse n'est renseignée, rien n'est envoyé et on le dit.
document.querySelectorAll('[data-static-form]').forEach((form) => {
  const status = form.querySelector('[data-form-status]')
  const endpoint = form.getAttribute('action') || CONFIG.contactEndpoint
  if (!endpoint) form.querySelectorAll('[data-form-pending]').forEach((el) => (el.hidden = false))
  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    const invalid = [...form.elements].find((el) => el.willValidate && !el.checkValidity())
    if (invalid) {
      status.textContent = invalid.type === 'email'
        ? 'Cet email ne semble pas valide (exemple : prenom@domaine.fr).'
        : 'Il manque une information obligatoire.'
      status.dataset.state = 'error'
      invalid.focus()
      return
    }
    if (!endpoint) {
      status.textContent = 'Le formulaire n’est pas encore relié : rien n’a été envoyé ni enregistré. Merci de votre patience, le branchement arrive bientôt.'
      status.dataset.state = 'info'
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
