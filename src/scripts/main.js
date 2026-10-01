import '../styles/main.css'
import { CONFIG } from './config.js'

// Menu mobile
const toggle = document.querySelector('[data-menu-toggle]')
const menu = document.querySelector('[data-menu]')
toggle?.addEventListener('click', () => {
  const open = menu.classList.toggle('hidden') === false
  toggle.setAttribute('aria-expanded', String(open))
})

// Année dynamique dans le footer
document.querySelectorAll('[data-year]').forEach((el) => (el.textContent = new Date().getFullYear()))

// Formulaires des pages vitrine (landing, contact).
// Tant qu'aucun service d'envoi n'est configuré (config.js), rien n'est envoyé et on le dit.
document.querySelectorAll('[data-static-form]').forEach((form) => {
  const status = form.querySelector('[data-form-status]')
  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    const invalid = [...form.elements].find((el) => el.willValidate && !el.checkValidity())
    if (invalid) {
      status.textContent = invalid.type === 'email'
        ? 'Cet email ne semble pas valide (exemple : prenom@domaine.fr).'
        : 'Il manque une info obligatoire.'
      status.dataset.state = 'error'
      invalid.focus()
      return
    }
    if (!CONFIG.contactEndpoint) {
      status.textContent = 'Le formulaire n’est pas encore relié : rien n’a été envoyé ni enregistré. Merci de ta patience, on branche ça bientôt.'
      status.dataset.state = 'info'
      return
    }
    try {
      const res = await fetch(CONFIG.contactEndpoint, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
      if (!res.ok) throw new Error(String(res.status))
      form.reset()
      status.textContent = 'C’est envoyé, merci ! On te répond par email.'
      status.dataset.state = 'ok'
    } catch {
      status.textContent = 'Oups, ça n’est pas parti. Rien n’a été transmis : réessaie un peu plus tard.'
      status.dataset.state = 'error'
    }
  })
})
