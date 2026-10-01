import '../styles/main.css'
import '../styles/home.css'
import { CONFIG } from './config.js'
import { initDemo } from './demo.js'

document.documentElement.classList.add('js')
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
const scrollBehavior = () => (reduceMotion.matches ? 'auto' : 'smooth')

/* ---------- Header : ombre au défilement ---------- */
const header = document.querySelector('[data-header]')
const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8)
onScroll()
window.addEventListener('scroll', onScroll, { passive: true })

/* ---------- Menu mobile ---------- */
const toggle = document.querySelector('[data-menu-toggle]')
const menu = document.querySelector('[data-menu]')
const toggleLabel = toggle.querySelector('.menu-toggle-label')

function setMenu(open, { restoreFocus = false } = {}) {
  menu.hidden = !open
  toggle.setAttribute('aria-expanded', String(open))
  toggleLabel.textContent = open ? 'Fermer' : 'Menu'
  if (open) menu.querySelector('a')?.focus()
  else if (restoreFocus) toggle.focus()
}
toggle.addEventListener('click', () => setMenu(menu.hidden))
menu.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false) })
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !menu.hidden) setMenu(false, { restoreFocus: true })
})
document.addEventListener('click', (e) => {
  if (!menu.hidden && !header.contains(e.target)) setMenu(false)
})
window.matchMedia('(min-width: 1024px)').addEventListener('change', (e) => { if (e.matches) setMenu(false) })

/* ---------- Lien de navigation actif ---------- */
const navLinks = [...document.querySelectorAll('.nav-main a')]
const tracked = navLinks.map((a) => document.querySelector(a.getAttribute('href'))).filter(Boolean)
const navObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return
    navLinks.forEach((a) => {
      if (a.getAttribute('href') === `#${entry.target.id}`) a.setAttribute('aria-current', 'location')
      else a.removeAttribute('aria-current')
    })
  })
}, { rootMargin: '-45% 0px -50% 0px' })
tracked.forEach((s) => navObserver.observe(s))

/* ---------- Apparitions discrètes ---------- */
const revealObserver = new IntersectionObserver((entries, obs) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) { entry.target.classList.add('is-in'); obs.unobserve(entry.target) }
  })
}, { rootMargin: '0px 0px -8% 0px' })
document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el))

/* ---------- Démo ---------- */
const demo = initDemo(document.querySelector('[data-app]'))

/* ---------- Points de départ ---------- */
const INTENTS = {
  part: {
    kicker: 'Point de départ A', title: 'Prendre davantage ma part',
    text: 'Vous repérez une responsabilité utile, vous la préparez, puis vous pouvez proposer de la prendre en charge en entier.',
    list: ['Choisir une responsabilité concrète parmi les quatre domaines', 'Préparer ses étapes, avec ou sans échéance', 'Proposer de la prendre en charge, sans rien imposer'],
  },
  charge: {
    kicker: 'Point de départ B', title: 'Alléger ma charge',
    text: 'Vous faites d’abord le point pour vous-même, en privé. Ensuite seulement, vous décidez de ce que vous voulez partager.',
    list: ['Noter ce que vous portez aujourd’hui et ce que vous souhaiteriez', 'Préparer une proposition ou une discussion', 'Garder vos souhaits et votre bilan pour vous'],
  },
  ensemble: {
    kicker: 'Point de départ C', title: 'Nous organiser',
    text: 'Chacun peut proposer une action. L’autre accepte, demande à en discuter ou refuse, et un accord peut être ajusté.',
    list: ['Examiner une proposition reçue', 'Accepter, en discuter ou refuser', 'Ajuster un accord quand la situation change'],
  },
  info: {
    kicker: 'Point de départ D', title: 'M’informer',
    text: 'Vous découvrez les responsabilités et des sources fiables, sans connecter personne et sans rien partager.',
    list: ['Comprendre les quatre domaines', 'Préparer une question pour un professionnel', 'Trouver les services et sources publiques'],
  },
}
const panelBody = document.querySelector('.intent-panel-body')
const ip = {
  kicker: document.querySelector('[data-ip-kicker]'),
  title: document.querySelector('[data-ip-title]'),
  text: document.querySelector('[data-ip-text]'),
  list: document.querySelector('[data-ip-list]'),
}
const intentRadios = [...document.querySelectorAll('input[name="intent"]')]
const currentIntent = () => intentRadios.find((r) => r.checked)?.value || 'part'

function renderIntent(key, animate = true) {
  const d = INTENTS[key]
  ip.kicker.textContent = d.kicker
  ip.title.textContent = d.title
  ip.text.textContent = d.text
  ip.list.innerHTML = d.list.map((t) => `<li>${t}</li>`).join('')
  if (animate) {
    panelBody.classList.remove('is-swapping')
    void panelBody.offsetWidth
    panelBody.classList.add('is-swapping')
  }
}
intentRadios.forEach((r) => r.addEventListener('change', () => renderIntent(r.value)))
renderIntent(currentIntent(), false)

document.querySelector('[data-open-scenario]').addEventListener('click', () => {
  demo.loadScenario(currentIntent())
  document.querySelector('#demo').scrollIntoView({ behavior: scrollBehavior(), block: 'start' })
  demo.focusPanel()
})
function syncIntent(name) {
  const radio = intentRadios.find((r) => r.value === name)
  if (radio && !radio.checked) { radio.checked = true; renderIntent(name, false) }
}
document.addEventListener('cochoice:scenario', (e) => syncIntent(e.detail))
syncIntent(demo.scenario)

/* ---------- Formulaire de contact (modale) ---------- */
const dialog = document.querySelector('[data-contact-dialog]')
const form = dialog.querySelector('[data-contact-form]')
const formView = dialog.querySelector('[data-form-view]')
const resultView = dialog.querySelector('[data-result-view]')
const OBJETS = { atelier: 'Échanger sur un atelier', campus: 'Discuter d’un programme sur notre campus', autre: 'Autre question sur CoChoice' }
let opener = null

function openContact(objet, trigger) {
  opener = trigger
  showForm()
  if (objet) form.objet.value = objet
  dialog.showModal()
  history.pushState({ cochoiceDialog: true }, '')
  form.nom.focus()
}
// Fermeture unique (bouton, Échap, clic hors de la fenêtre, retour arrière du navigateur)
function closeContact({ fromHistory = false } = {}) {
  if (!dialog.open) return
  dialog.close()
  if (!fromHistory && history.state?.cochoiceDialog) history.back()
  opener?.focus()
}
function showForm() {
  formView.hidden = false
  resultView.hidden = true
}
document.addEventListener('click', (e) => {
  const t = e.target.closest('[data-contact]')
  if (t) openContact(t.dataset.contact, t)
})
dialog.addEventListener('click', (e) => {
  if (e.target === dialog || e.target.closest('[data-dialog-close]')) closeContact()
  if (e.target.closest('[data-result-back]')) { showForm(); form.nom.focus() }
})
dialog.addEventListener('cancel', (e) => { e.preventDefault(); closeContact() })
window.addEventListener('popstate', () => closeContact({ fromHistory: true }))

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
function setError(input, message) {
  const err = form.querySelector(`#${input.id}-err`)
  input.setAttribute('aria-invalid', message ? 'true' : 'false')
  if (err) { err.textContent = message || ''; err.hidden = !message }
}
function validate() {
  const checks = [
    [form.nom, form.nom.value.trim().length < 2 ? 'Indiquez votre nom (2 caractères minimum).' : ''],
    [form.email, !form.email.value.trim() ? 'Indiquez une adresse email pour que nous puissions vous répondre.' : !EMAIL_RE.test(form.email.value.trim()) ? 'Cette adresse email ne semble pas valide (exemple : prenom@domaine.fr).' : ''],
    [form.objet, !form.objet.value ? 'Choisissez l’objet de votre demande.' : ''],
  ]
  checks.forEach(([input, msg]) => setError(input, msg))
  const firstInvalid = checks.find(([, msg]) => msg)
  firstInvalid?.[0].focus()
  return !firstInvalid
}
;['nom', 'email', 'objet'].forEach((name) => {
  form[name].addEventListener('input', () => { if (form[name].getAttribute('aria-invalid') === 'true') setError(form[name], '') })
})

const escapeHtml = (s) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])
function recap() {
  return [
    `Nom : ${form.nom.value.trim()}`,
    `Email : ${form.email.value.trim()}`,
    `Établissement : ${form.etablissement.value.trim() || 'non précisé'}`,
    `Objet : ${OBJETS[form.objet.value]}`,
  ].join('\n')
}
function showResult({ kicker, title, html }) {
  dialog.querySelector('[data-result-kicker]').textContent = kicker
  dialog.querySelector('[data-result-title]').textContent = title
  dialog.querySelector('[data-result-body]').innerHTML = html
  formView.hidden = true
  resultView.hidden = false
  resultView.focus()
}

form.addEventListener('submit', async (e) => {
  e.preventDefault()
  if (!validate()) return
  if (!CONFIG.contactEndpoint) {
    showResult({
      kicker: 'Demande non envoyée',
      title: 'Le formulaire n’est pas encore relié',
      html: `<p>Ce site est en cours de construction&nbsp;: aucun service d’envoi n’est configuré. <strong>Rien n’a été transmis ni enregistré.</strong></p>
        <p>Voici le récapitulatif de votre demande, à conserver si vous le souhaitez&nbsp;:</p>
        <div class="result-box" data-recap>${escapeHtml(recap())}</div>
        <div class="dialog-actions"><button type="button" class="btn btn-ghost btn-sm" data-copy-recap><svg class="i" aria-hidden="true"><use href="#i-copy"/></svg>Copier le récapitulatif</button></div>
        <p role="status" aria-live="polite" data-copy-status></p>`,
    })
    return
  }
  const submit = form.querySelector('[type="submit"]')
  submit.disabled = true
  submit.textContent = 'Envoi en cours…'
  try {
    const res = await fetch(CONFIG.contactEndpoint, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
    if (!res.ok) throw new Error(String(res.status))
    form.reset()
    showResult({ kicker: 'Demande envoyée', title: 'Merci, nous avons bien reçu votre demande', html: '<p>Nous reviendrons vers vous par email.</p>' })
  } catch {
    showResult({ kicker: 'Échec de l’envoi', title: 'Votre demande n’a pas pu être envoyée', html: '<p>Le service d’envoi n’a pas répondu. Rien n’a été transmis&nbsp;: vous pouvez réessayer plus tard.</p>' })
  } finally {
    submit.disabled = false
    submit.textContent = 'Envoyer la demande'
  }
})
dialog.addEventListener('click', async (e) => {
  if (!e.target.closest('[data-copy-recap]')) return
  const status = dialog.querySelector('[data-copy-status]')
  try {
    await navigator.clipboard.writeText(recap())
    status.textContent = 'Récapitulatif copié.'
  } catch {
    status.textContent = 'Copie impossible : sélectionnez le texte du récapitulatif pour le copier.'
  }
})

/* ---------- Année ---------- */
document.querySelectorAll('[data-year]').forEach((el) => (el.textContent = new Date().getFullYear()))
