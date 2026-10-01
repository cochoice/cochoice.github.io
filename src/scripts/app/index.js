// Prototype cliquable de l'appli CoChoice : état, rendu et navigation.
// Données fictives en localStorage (une seule clé), rien n'est envoyé.
import { seed, icon, PARTNER } from './data.js'
import * as demarrage from './demarrage.js'
import * as accueil from './accueil.js'
import * as taches from './taches.js'
import * as frais from './frais.js'
import * as checkin from './checkin.js'
import * as moi from './moi.js'

const STORAGE_KEY = 'cochoice-mvp-v1'
const OLD_KEYS = ['cochoice-demo-v1']
const TABS = [['accueil', 'Accueil', 'house'], ['taches', 'Tâches', 'list-checks'], ['frais', 'Frais', 'receipt'], ['checkin', 'Check-in', 'chat-circle-dots'], ['moi', 'Moi', 'user-circle']]
const VIEWS = { accueil, taches, frais, checkin, moi }
const merge = (key) => Object.assign({}, ...[demarrage, taches, frais, checkin, moi].map((m) => m[key] || {}))
const ACTIONS = merge('actions')
const FORMS = merge('forms')
const CHANGES = merge('changes')

function load() {
  try {
    OLD_KEYS.forEach((k) => localStorage.removeItem(k))
    const s = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
    return s && s.v === 1 && Array.isArray(s.tasks) ? s : null
  } catch { return null }
}
function save(state) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)) } catch { /* stockage indisponible : la démo marche quand même */ }
}
function clear() {
  try { localStorage.removeItem(STORAGE_KEY) } catch { /* rien à effacer */ }
}

export function initApp(root, { onFeedback }) {
  const screen = root.querySelector('[data-screen]')
  const tabbar = root.querySelector('[data-tabbar]')
  const live = root.querySelector('[data-live]')
  let state = load() || seed()
  let ui = {}
  let liveTimer
  let enterTimer

  const ctx = {
    get state() { return state },
    get ui() { return ui },
    render, commit, focus, announce, go, reset,
    canShare: (kind) => state.duo && !state.pause && state.sharing[kind],
    feedback: () => onFeedback(announce),
  }
  ACTIONS.feedback = (c) => c.feedback()

  function renderTabs() {
    tabbar.hidden = !state.onboarded
    tabbar.innerHTML = TABS.map(([k, label, ic]) => {
      const sel = state.tab === k
      return `<button type="button" role="tab" id="tab-${k}" aria-controls="app-panel" aria-selected="${sel}" tabindex="${sel ? 0 : -1}" data-tab="${k}">${icon(ic)}<span>${label}</span></button>`
    }).join('')
  }

  function render() {
    const fk = root.contains(document.activeElement) ? document.activeElement.dataset?.fk : null
    const scroll = screen.scrollTop
    renderTabs()
    if (state.onboarded) {
      screen.setAttribute('role', 'tabpanel')
      screen.setAttribute('aria-labelledby', `tab-${state.tab}`)
      screen.innerHTML = VIEWS[state.tab].view(ctx)
    } else {
      screen.removeAttribute('role')
      screen.removeAttribute('aria-labelledby')
      screen.innerHTML = demarrage.view(ctx)
    }
    ui.fresh = null
    ui.revealing = false
    ui.error = ''
    screen.scrollTop = scroll
    if (fk) screen.querySelector(`[data-fk="${CSS.escape(fk)}"]`)?.focus({ preventScroll: true })
  }

  function commit(msg) {
    save(state)
    render()
    if (msg) announce(msg)
  }

  function focus(selector) {
    const el = screen.querySelector(selector) || root.querySelector(selector)
    if (!el) return
    if (!el.matches('a, button, input, select, textarea, [tabindex]')) el.setAttribute('tabindex', '-1')
    el.focus({ preventScroll: true })
    el.scrollIntoView({ block: 'nearest' })
  }

  function announce(msg) {
    clearTimeout(liveTimer)
    live.textContent = ''
    live.classList.remove('is-visible')
    // Petit délai : les lecteurs d'écran annoncent aussi un message identique au précédent
    liveTimer = setTimeout(() => {
      live.textContent = msg
      live.classList.add('is-visible')
      liveTimer = setTimeout(() => live.classList.remove('is-visible'), 4000)
    }, 30)
  }

  function go(tab, { target, keepUi = false } = {}) {
    if (!keepUi) ui = {}
    const changed = state.tab !== tab
    if (tab === 'accueil' && changed) state.cardIndex += 1
    state.tab = tab
    save(state)
    render()
    screen.scrollTop = 0
    // Changement d'onglet visible (fondu court, désactivé si « réduire les animations »)
    if (changed) {
      clearTimeout(enterTimer)
      screen.classList.remove('is-entering')
      void screen.offsetWidth
      screen.classList.add('is-entering')
      enterTimer = setTimeout(() => screen.classList.remove('is-entering'), 250)
    }
    if (target) focus(target)
  }

  function reset(msg, { moveFocus = true } = {}) {
    clear()
    state = seed()
    ui = {}
    commit(msg)
    if (moveFocus) focus('[data-focus]')
  }

  // Démarrage terminé d'office quand on arrive par un raccourci
  function ensureOnboarded() {
    if (state.onboarded) return
    Object.assign(state, { onboarded: true, duo: true, step: 5 })
  }

  /* ----- Événements ----- */
  root.addEventListener('click', (e) => {
    const tab = e.target.closest('[data-tab]')
    if (tab) { go(tab.dataset.tab); focus(`[data-tab="${tab.dataset.tab}"]`); return }
    const goEl = e.target.closest('[data-go]')
    if (goEl) { go(goEl.dataset.go, { target: goEl.dataset.target || '[data-focus], .a-title' }); return }
    const act = e.target.closest('[data-act]')
    if (act && ACTIONS[act.dataset.act]) ACTIONS[act.dataset.act](ctx, act)
  })
  root.addEventListener('submit', (e) => {
    const form = e.target.closest('[data-form]')
    if (!form) return
    e.preventDefault()
    FORMS[form.dataset.form]?.(ctx, form)
  })
  root.addEventListener('change', (e) => {
    const el = e.target.closest('[data-change]')
    if (el && el.dataset.change !== 'ci-range') CHANGES[el.dataset.change]?.(ctx, el)
  })
  root.addEventListener('input', (e) => {
    const el = e.target.closest('[data-change="ci-range"]')
    if (el) CHANGES['ci-range'](ctx, el)
  })
  // Onglets : flèches, Début, Fin
  tabbar.addEventListener('keydown', (e) => {
    const keys = ['ArrowLeft', 'ArrowRight', 'Home', 'End']
    if (!keys.includes(e.key)) return
    e.preventDefault()
    const i = TABS.findIndex(([k]) => k === state.tab)
    const n = e.key === 'Home' ? 0 : e.key === 'End' ? TABS.length - 1 : (i + (e.key === 'ArrowRight' ? 1 : -1) + TABS.length) % TABS.length
    go(TABS[n][0])
    focus(`[data-tab="${TABS[n][0]}"]`)
  })

  // La carte « À se poser ensemble » de l'accueil change à chaque visite
  if (state.onboarded) { state.cardIndex += 1; save(state) }
  render()

  /* ----- Raccourcis « À tester en 2 minutes » ----- */
  return {
    shortcut(name) {
      ensureOnboarded()
      if (name === 'checkin') {
        go('checkin')
        focus(state.checkin.phase === 'quiz' ? '[data-focus]' : '.a-title')
      } else if (name === 'depense') {
        ui = {}
        frais.openForm(ctx)
        go('frais', { keepUi: true, target: '#ef-label' })
      } else if (name === 'tache') {
        ui = {}
        taches.openForm(ctx)
        go('taches', { keepUi: true, target: '#tf-title' })
      } else if (name === 'pause') {
        go('moi')
        if (state.duo) focus('[data-fk="me-pause"]')
        else { focus('[data-fk="me-invite"]'); announce(`Invite d’abord ${PARTNER} : la pause concerne ce que tu partages avec ton duo.`) }
      }
    },
    // Le focus reste sur le bouton de la page ; le message s'affiche à côté
    restart() { reset('', { moveFocus: false }) },
  }
}
