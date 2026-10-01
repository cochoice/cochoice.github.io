import '../styles/main.css'
import '../styles/home.css'
import { CONFIG } from './config.js'

document.documentElement.classList.add('js')
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
const scrollBehavior = () => (reduceMotion.matches ? 'auto' : 'smooth')

/* ---------- Header : ombre au défilement ---------- */
const header = document.querySelector('[data-header]')
const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8)
onScroll()
window.addEventListener('scroll', onScroll, { passive: true })

/* ---------- Menu : un seul <nav>, affiché en ligne sur ordinateur, en panneau sur mobile ---------- */
const toggle = document.querySelector('[data-menu-toggle]')
const menu = document.querySelector('[data-menu]')
const toggleLabel = toggle.querySelector('.menu-toggle-label')
const isOpen = () => menu.classList.contains('is-open')

function setMenu(open, { restoreFocus = false } = {}) {
  menu.classList.toggle('is-open', open)
  toggle.setAttribute('aria-expanded', String(open))
  toggleLabel.textContent = open ? 'Fermer' : 'Menu'
  if (open) menu.querySelector('a')?.focus()
  else if (restoreFocus) toggle.focus()
}
toggle.addEventListener('click', () => setMenu(!isOpen()))
menu.addEventListener('click', (e) => { if (e.target.closest('a') && isOpen()) setMenu(false) })
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && isOpen()) setMenu(false, { restoreFocus: true })
})
document.addEventListener('click', (e) => {
  if (isOpen() && !header.contains(e.target)) setMenu(false)
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

/* ---------- Formulaire de contact (modale) ---------- */
const DIALOG_HTML = `
  <div class="dialog-inner">
    <button type="button" class="dialog-close" data-dialog-close aria-label="Fermer le formulaire"><svg class="i" aria-hidden="true"><use href="#i-close"/></svg></button>
    <div data-form-view>
      <p class="kicker">Nous écrire</p>
      <h2 class="h3" id="contact-title">On discute&nbsp;?</h2>
      <p class="dialog-desc">Quatre infos suffisent. N’écris rien de médical ou d’intime ici.</p>
      <form class="form" novalidate data-contact-form>
        <div class="field">
          <label for="cf-nom">Nom <span class="req">obligatoire</span></label>
          <input id="cf-nom" name="nom" type="text" autocomplete="name" required maxlength="80" aria-describedby="cf-nom-err" />
          <p class="field-error" id="cf-nom-err" hidden></p>
        </div>
        <div class="field">
          <label for="cf-email">Email <span class="req">obligatoire</span></label>
          <input id="cf-email" name="email" type="email" autocomplete="email" required maxlength="120" aria-describedby="cf-email-err" />
          <p class="field-error" id="cf-email-err" hidden></p>
        </div>
        <div class="field">
          <label for="cf-etab">École ou établissement <span class="opt">facultatif</span></label>
          <input id="cf-etab" name="etablissement" type="text" autocomplete="organization" maxlength="120" />
        </div>
        <div class="field">
          <label for="cf-objet">Objet <span class="req">obligatoire</span></label>
          <select id="cf-objet" name="objet" required aria-describedby="cf-objet-err">
            <option value="">Choisir un objet</option>
            <option value="atelier">Parler d’un atelier</option>
            <option value="campus">Un programme pour mon école</option>
            <option value="autre">Autre question sur CoChoice</option>
          </select>
          <p class="field-error" id="cf-objet-err" hidden></p>
        </div>
        <button type="submit" class="btn btn-primary btn-block">Envoyer</button>
        <p class="fine">Tes infos servent seulement à te répondre. Jamais revendues, jamais utilisées pour de la pub.</p>
      </form>
    </div>
    <div data-result-view hidden tabindex="-1">
      <p class="kicker" data-result-kicker></p>
      <h2 class="h3" data-result-title></h2>
      <div data-result-body></div>
      <div class="dialog-actions">
        <button type="button" class="btn btn-ghost btn-sm" data-result-back>Modifier</button>
        <button type="button" class="btn btn-primary btn-sm" data-dialog-close>Fermer</button>
      </div>
    </div>
  </div>`
let dialog, form, formView, resultView

function ensureDialog() {
  if (dialog) return
  dialog = document.createElement('dialog')
  dialog.className = 'dialog'
  dialog.setAttribute('aria-labelledby', 'contact-title')
  dialog.innerHTML = DIALOG_HTML
  document.body.append(dialog)
  form = dialog.querySelector('[data-contact-form]')
  formView = dialog.querySelector('[data-form-view]')
  resultView = dialog.querySelector('[data-result-view]')
  wireDialog()
}
const OBJETS = { atelier: 'Parler d’un atelier', campus: 'Un programme pour mon école', autre: 'Autre question sur CoChoice' }
let opener = null

function openContact(objet, trigger) {
  ensureDialog()
  opener = trigger
  showForm()
  if (objet) form.objet.value = objet
  dialog.showModal()
  history.pushState({ cochoiceDialog: true }, '')
  form.nom.focus()
}
// Fermeture unique (bouton, Échap, clic hors de la fenêtre, retour arrière du navigateur)
function closeContact({ fromHistory = false } = {}) {
  if (!dialog?.open) return
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
window.addEventListener('popstate', () => closeContact({ fromHistory: true }))

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
function setError(input, message) {
  const err = form.querySelector(`#${input.id}-err`)
  input.setAttribute('aria-invalid', message ? 'true' : 'false')
  if (err) { err.textContent = message || ''; err.hidden = !message }
}
function validate() {
  const checks = [
    [form.nom, form.nom.value.trim().length < 2 ? 'Indique ton nom (2 caractères minimum).' : ''],
    [form.email, !form.email.value.trim() ? 'Indique ton email pour qu’on puisse te répondre.' : !EMAIL_RE.test(form.email.value.trim()) ? 'Cet email ne semble pas valide (exemple : prenom@domaine.fr).' : ''],
    [form.objet, !form.objet.value ? 'Choisis l’objet de ton message.' : ''],
  ]
  checks.forEach(([input, msg]) => setError(input, msg))
  const firstInvalid = checks.find(([, msg]) => msg)
  firstInvalid?.[0].focus()
  return !firstInvalid
}

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

function wireDialog() {
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog || e.target.closest('[data-dialog-close]')) closeContact()
    if (e.target.closest('[data-result-back]')) { showForm(); form.nom.focus() }
  })
  dialog.addEventListener('cancel', (e) => { e.preventDefault(); closeContact() })
  ;['nom', 'email', 'objet'].forEach((name) => {
    form[name].addEventListener('input', () => { if (form[name].getAttribute('aria-invalid') === 'true') setError(form[name], '') })
  })
  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    if (!validate()) return
    if (!CONFIG.contactEndpoint) {
      showResult({
        kicker: 'Pas envoyé',
        title: 'Le formulaire n’est pas encore relié',
        html: `<p>Le site est encore en construction&nbsp;: aucun service d’envoi n’est branché. <strong>Rien n’a été transmis ni enregistré.</strong></p>
          <p>Voici ton message, si tu veux le garder&nbsp;:</p>
          <div class="result-box" data-recap>${escapeHtml(recap())}</div>
          <div class="dialog-actions"><button type="button" class="btn btn-ghost btn-sm" data-copy-recap><svg class="i" aria-hidden="true"><use href="#i-copy"/></svg>Copier</button></div>
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
      showResult({ kicker: 'Envoyé', title: 'Merci, on a bien reçu ton message', html: '<p>On te répond par email.</p>' })
    } catch {
      showResult({ kicker: 'Oups', title: 'Ton message n’est pas parti', html: '<p>Le service d’envoi n’a pas répondu. Rien n’a été transmis&nbsp;: réessaie un peu plus tard.</p>' })
    } finally {
      submit.disabled = false
      submit.textContent = 'Envoyer'
    }
  })
  dialog.addEventListener('click', async (e) => {
    if (!e.target.closest('[data-copy-recap]')) return
    const status = dialog.querySelector('[data-copy-status]')
    try {
      await navigator.clipboard.writeText(recap())
      status.textContent = 'Copié.'
    } catch {
      status.textContent = 'Copie impossible : sélectionne le texte pour le copier.'
    }
  })
}

/* ---------- Année ---------- */
document.querySelectorAll('[data-year]').forEach((el) => (el.textContent = new Date().getFullYear()))
