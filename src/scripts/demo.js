// Aperçu interactif de l'application CoChoice.
// Tout est local : données fictives, aucun serveur, « Alex » est simulé·e par la personne qui teste.

const STORAGE_KEY = 'cochoice-demo-v1'
const PARTNER = 'Alex'

const DOMAINS = {
  information: {
    label: 'Information', icon: 'i-info',
    suggestions: ['Préparer une question pour un professionnel de santé', 'Lire une source fiable sur les options existantes', 'Repérer le service de santé étudiante du campus'],
    steps: ['Noter ma question', 'Consulter une source fiable', 'Garder la réponse à portée de main'],
  },
  anticipation: {
    label: 'Anticipation', icon: 'i-anticipation',
    suggestions: ['Prendre en charge le réapprovisionnement convenu', 'Repérer où obtenir les produits souhaités près du campus', 'Prévoir une réserve avant les vacances'],
    steps: ['Vérifier ce qu’il reste', 'Prévoir l’achat avant l’échéance', 'Confirmer que c’est fait'],
  },
  demarches: {
    label: 'Démarches', icon: 'i-demarches',
    suggestions: ['Chercher un créneau de rendez-vous, si c’est souhaité', 'Organiser le trajet vers une pharmacie de garde', 'Accompagner à un rendez-vous, si c’est souhaité'],
    steps: ['Vérifier que cette aide est souhaitée', 'Organiser le créneau ou le trajet', 'Faire le point après'],
  },
  frais: {
    label: 'Frais', icon: 'i-frais',
    suggestions: ['Proposer une répartition des frais du mois', 'Avancer les frais et noter la répartition convenue', 'Vérifier ce qui est remboursé sur Ameli'],
    steps: ['Lister les dépenses concernées', 'Proposer une répartition', 'Noter ce qui est convenu'],
  },
}

const NOW_OPTIONS = [['', 'Choisir'], ['moi', 'Surtout moi'], ['autre', 'Surtout l’autre personne'], ['partage', 'C’est partagé'], ['nc', 'Je ne suis pas concerné·e'], ['nsp', 'Je ne sais pas']]
const WANT_OPTIONS = [['', 'Choisir'], ['garder', 'Que ça reste ainsi'], ['partager', 'Partager davantage'], ['confier', 'Que l’autre s’en charge'], ['nsp', 'Je ne sais pas encore']]
const LIBERTE = [['libre', 'Je me sens libre de mes choix'], ['plutot', 'Plutôt libre'], ['pas', 'Pas vraiment libre'], ['skip', 'Je préfère ne pas répondre']]
const SHARE_OPTIONS = [
  ['perso', 'Moi, en action personnelle', 'i-user'],
  ['moi', 'Moi, et je le propose à Alex', 'i-hand'],
  ['alex', 'Alex, si Alex accepte', 'i-users'],
  ['deux', 'Nous deux', 'i-users'],
]
const DEFAULT_RECO = 'Je découvre CoChoice, un projet d’application et d’ateliers pour mieux partager les responsabilités contraceptives (s’informer, anticiper, faire les démarches, discuter des frais), sans toucher à la liberté de choix de chacun. C’est encore en développement, mais l’idée pourrait t’intéresser.'

const SCENARIO_LABELS = { part: 'Je veux prendre davantage ma part', charge: 'J’aimerais alléger ma charge', ensemble: 'Nous voulons nous organiser', info: 'Je souhaite simplement m’informer' }

/* ---------- Utilitaires ---------- */
let uid = 0
const newId = () => `a${Date.now().toString(36)}${(uid++).toString(36)}`
const esc = (s = '') => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])
const icon = (id, cls = 'i') => `<svg class="${cls}" aria-hidden="true"><use href="#${id}"/></svg>`
const isoIn = (days) => { const d = new Date(); d.setDate(d.getDate() + days); return toIso(d) }
const toIso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const todayIso = () => toIso(new Date())
const fmtDate = (iso) => {
  if (!iso) return 'Sans échéance'
  const [y, m, d] = iso.split('-').map(Number)
  return `Avant le ${new Date(y, m - 1, d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}`
}
const steps = (list, doneCount = 0) => list.map((text, i) => ({ id: newId(), text, done: i < doneCount }))
const ownerLabel = (o) => ({ moi: 'Toi', alex: PARTNER, deux: 'Vous deux' })[o] || 'Toi'
const fromLabel = (f) => (f === 'alex' ? PARTNER : 'Toi')
const emptyWishes = () => Object.fromEntries(Object.keys(DOMAINS).map((k) => [k, { now: '', want: '' }]))
const emptyBilan = () => ({ charge: 5, chargeSkip: false, liberte: '', saved: null })

/* ---------- Scénarios (données fictives) ---------- */
function seed(scenario) {
  const base = { scenario, partner: true, wishes: emptyWishes(), bilan: emptyBilan(), reco: DEFAULT_RECO, discussion: '', guide: true }
  const A = (o) => ({ id: newId(), from: 'moi', owner: 'moi', due: '', prev: null, refusedBy: null, discussBy: null, ...o })
  if (scenario === 'charge') {
    return { ...base, tab: 'souhaits', actions: [
      A({ title: 'Avancer les frais du mois et proposer une répartition', domain: 'frais', owner: 'alex', status: 'acceptee', steps: steps(DOMAINS.frais.steps, 1) }),
      A({ title: 'Chercher un créneau de rendez-vous, si c’est souhaité', domain: 'demarches', owner: 'alex', status: 'refusee', refusedBy: 'alex', steps: steps(DOMAINS.demarches.steps) }),
    ] }
  }
  if (scenario === 'ensemble') {
    return { ...base, tab: 'props', actions: [
      A({ title: 'Prendre en charge le réapprovisionnement convenu', domain: 'anticipation', from: 'alex', owner: 'alex', status: 'attente', due: isoIn(10), steps: steps(DOMAINS.anticipation.steps) }),
      A({ title: 'Répartir les frais de ce trimestre', domain: 'frais', owner: 'deux', status: 'discussion', discussBy: 'alex', steps: steps(DOMAINS.frais.steps) }),
      A({ title: 'Repérer une pharmacie ouverte le dimanche près du campus et vérifier ses horaires pendant la semaine des partiels, au cas où', domain: 'demarches', from: 'alex', owner: 'moi', status: 'acceptee', steps: steps(['Chercher les pharmacies de garde du quartier', 'Noter les horaires du dimanche', 'Partager l’adresse retenue'], 1) }),
    ] }
  }
  if (scenario === 'info') {
    return { ...base, partner: false, tab: 'actions', actions: [
      A({ title: 'Préparer une question pour un professionnel de santé', domain: 'information', status: 'perso', steps: steps(['Noter ma question', 'Repérer le service de santé étudiante', 'Prendre rendez-vous si je le souhaite']) }),
    ] }
  }
  return { ...base, scenario: 'part', tab: 'actions', actions: [
    A({ title: 'Repérer où obtenir les produits convenus près du campus', domain: 'anticipation', status: 'perso', steps: steps(['Lister deux lieux proches du campus', 'Vérifier leurs horaires', 'Garder les adresses dans mes notes'], 1) }),
    A({ title: 'Prendre en charge le réapprovisionnement convenu', domain: 'anticipation', status: 'attente', due: isoIn(12), steps: steps(DOMAINS.anticipation.steps) }),
  ] }
}

const GUIDES = {
  part: { tab: 'actions', text: '<strong>Tu as proposé de prendre en charge le réapprovisionnement.</strong> Tant qu’Alex n’a pas répondu, ce n’est pas un accord&nbsp;: ouvre l’onglet Propositions pour simuler sa réponse.' },
  charge: { tab: 'souhaits', text: '<strong>Commence par tes souhaits.</strong> Ils restent privés. Tu choisiras ensuite ce que tu veux proposer, ou préparer une discussion.' },
  ensemble: { tab: 'props', text: '<strong>Alex propose de prendre en charge le réapprovisionnement.</strong> Rien n’est accepté tant que tu n’as pas répondu. Tu peux aussi refuser, sans te justifier.' },
  info: { tab: 'actions', text: '<strong>Tu utilises CoChoice sans partenaire connecté.</strong> Rien n’est partagé. Les sources ci-dessous sont publiques et fiables.' },
}

/* ---------- Composant ---------- */
export function initDemo(root) {
  const panel = root.querySelector('[data-app-panel]')
  const tabs = [...root.querySelectorAll('[role="tab"]')]
  const toastEl = root.querySelector('[data-toast]')
  const countEl = root.querySelector('[data-count-props]')
  const scenarioSelect = document.querySelector('[data-scenario-select]')
  const partnerSwitch = document.querySelector('[data-partner-switch]')
  const partnerState = document.querySelector('[data-partner-state]')

  let state = load() || seed('part')
  // État d'interface, non conservé
  const ui = { open: new Set(), form: null, freshId: null, discussionOpen: false }

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      const s = raw && JSON.parse(raw)
      return s && Array.isArray(s.actions) ? s : null
    } catch { return null }
  }
  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)) } catch { /* stockage indisponible : la démo reste utilisable */ }
  }
  let toastTimer
  function toast(msg) {
    toastEl.textContent = msg
    toastEl.classList.add('is-visible')
    clearTimeout(toastTimer)
    toastTimer = setTimeout(() => toastEl.classList.remove('is-visible'), 3200)
  }
  const find = (id) => state.actions.find((a) => a.id === id)
  const commit = (msg) => { save(); render(); if (msg) toast(msg) }

  /* ----- Rendu ----- */
  function render() {
    const fk = document.activeElement?.closest('[data-app]') ? document.activeElement.dataset.fk : null
    tabs.forEach((t) => {
      const sel = t.dataset.tab === state.tab
      t.setAttribute('aria-selected', String(sel))
      t.tabIndex = sel ? 0 : -1
    })
    panel.setAttribute('aria-labelledby', `tab-${state.tab}`)
    const pending = state.actions.filter((a) => (a.status === 'attente' || a.status === 'ajustement') && a.from === 'alex').length
    countEl.textContent = state.partner && pending ? String(pending) : ''
    countEl.setAttribute('aria-label', pending ? `${pending} à examiner` : '')
    scenarioSelect.value = state.scenario
    partnerSwitch.setAttribute('aria-checked', String(state.partner))
    partnerState.textContent = state.partner ? `${PARTNER} (fictif) est connecté·e` : 'Aucun partenaire connecté'

    const views = { actions: viewActions, props: viewProps, souhaits: viewWishes, bilan: viewBilan, reco: viewReco }
    panel.innerHTML = views[state.tab]()
    ui.freshId = null
    if (fk) panel.querySelector(`[data-fk="${CSS.escape(fk)}"]`)?.focus()
  }

  const guide = () => {
    const g = GUIDES[state.scenario]
    return state.guide && g && g.tab === state.tab
      ? `<div class="guide">${icon('i-arrow')}<p>${g.text} <button type="button" class="abtn abtn-quiet" data-act="dismiss-guide" data-fk="dismiss-guide">Masquer</button></p></div>` : ''
  }

  function viewActions() {
    const mine = state.actions.filter((a) => a.status === 'perso')
    const shared = state.actions.filter((a) => a.status === 'acceptee' || a.status === 'ajustement')
    let html = `<div class="app-intro"><div><h3>Mes actions</h3><p>Les actions personnelles ne sont visibles que par toi. Les actions communes ont été acceptées par vous deux.</p></div>
      ${ui.form ? '' : `<button type="button" class="abtn abtn-primary" data-act="new" data-fk="new">${icon('i-plus')}Nouvelle action</button>`}</div>`
    html += guide()
    if (ui.form) html += viewForm()
    if (!mine.length && !shared.length && !ui.form) {
      html += `<div class="empty"><svg class="empty-mark" viewBox="0 0 64 32" aria-hidden="true"><path d="M16 0H32V32H16A16 16 0 0 1 16 0Z" fill="#A79BDB"/><path d="M32 0H48A16 16 0 0 1 48 32H32Z" fill="#E08A95"/><circle cx="32" cy="16" r="10.2" fill="#fff" stroke="#221C48" stroke-width="3.6"/></svg>
        <h4>Aucune action pour l’instant</h4><p>Choisis une responsabilité concrète. Elle peut rester personnelle&nbsp;: rien n’est partagé sans ton accord.</p>
        <button type="button" class="abtn abtn-primary" data-act="new" data-fk="new-empty">${icon('i-plus')}Créer une première action</button></div>`
    }
    if (mine.length) html += `<p class="app-section-title">Personnelles · ${mine.length}</p><div class="cards">${mine.map(card).join('')}</div>`
    if (shared.length) html += `<p class="app-section-title">Communes · ${shared.length}</p><div class="cards">${shared.map(card).join('')}</div>`
    if (state.scenario === 'info' || !state.partner) html += resources()
    return html
  }

  function resources() {
    const r = [
      ['https://www.ameli.fr/assure/sante/themes/contraception/choisir-mode-contraception', 'Choisir sa contraception', 'Ameli, Assurance maladie'],
      ['https://www.questionsexualite.fr/choisir-sa-contraception/ma-contraception-et-moi/pourquoi-et-comment-parler-contraception-avec-votre-partenaire', 'Parler contraception avec son ou sa partenaire', 'QuestionSexualité, Santé publique France'],
      ['https://www.etudiant.gouv.fr/fr/les-services-de-sante-etudiante-sse-mode-d-emploi-3050', 'Les services de santé étudiante', 'Étudiant.gouv'],
    ]
    return `<p class="app-section-title">Sources fiables</p><div class="resources">${r.map(([href, t, s]) => `<a href="${href}" target="_blank" rel="noopener"><span>${t}<small>${s}</small></span>${icon('i-external')}<span class="sr-only">(nouvel onglet)</span></a>`).join('')}</div>`
  }

  function viewProps() {
    let html = `<div class="app-intro"><div><h3>Propositions</h3><p>Une proposition n’est jamais acceptée d’avance. Chacun peut accepter, demander à en discuter ou refuser, et changer d’avis.</p></div>
      ${state.partner && !ui.form ? `<button type="button" class="abtn abtn-primary" data-act="new-proposal" data-fk="new-proposal">${icon('i-plus')}Proposer une action</button>` : ''}</div>`
    html += guide()
    if (!state.partner) {
      return html + `<div class="empty"><svg class="empty-mark" viewBox="0 0 64 32" aria-hidden="true"><path d="M16 0H32V32H16A16 16 0 0 1 16 0Z" fill="#A79BDB"/><path d="M32 0H48A16 16 0 0 1 48 32H32Z" fill="#E08A95"/><circle cx="32" cy="16" r="10.2" fill="#fff" stroke="#221C48" stroke-width="3.6"/></svg>
        <h4>Tu utilises CoChoice seul·e</h4><p>Aucune proposition ne peut être envoyée ni reçue&nbsp;: tes actions restent personnelles. Connecter quelqu’un est facultatif, et réversible.</p>
        <button type="button" class="abtn" data-act="partner-on" data-fk="partner-on">${icon('i-users')}Simuler un partenaire connecté</button></div>`
    }
    if (ui.form) html += viewForm()
    const groups = [
      ['À examiner', state.actions.filter((a) => (a.status === 'attente' || a.status === 'ajustement') && a.from === 'alex')],
      [`En attente de réponse d’${PARTNER}`, state.actions.filter((a) => (a.status === 'attente' || a.status === 'ajustement') && a.from === 'moi')],
      ['À discuter', state.actions.filter((a) => a.status === 'discussion')],
      ['Refusées', state.actions.filter((a) => a.status === 'refusee')],
    ].filter(([, list]) => list.length)
    if (!groups.length && !ui.form) {
      html += `<div class="empty"><h4>Aucune proposition en cours</h4><p>Tu peux proposer de prendre une responsabilité en charge, ou proposer à ${PARTNER} de s’en occuper.</p>
        <button type="button" class="abtn abtn-primary" data-act="new-proposal" data-fk="new-proposal-empty">${icon('i-plus')}Préparer une proposition</button></div>`
    }
    groups.forEach(([title, list]) => { html += `<p class="app-section-title">${title} · ${list.length}</p><div class="cards">${list.map(card).join('')}</div>` })
    return html
  }

  function statusPill(a) {
    if (a.status === 'perso') return '<span class="pill pill-perso">Personnelle</span>'
    if (a.status === 'acceptee') return '<span class="pill pill-ok">Acceptée</span>'
    if (a.status === 'discussion') return '<span class="pill pill-talk">À discuter</span>'
    if (a.status === 'refusee') return '<span class="pill pill-no">Refusée</span>'
    if (a.status === 'ajustement') return '<span class="pill pill-adjust">Modification en attente</span>'
    return a.from === 'alex' ? '<span class="pill pill-wait">À examiner</span>' : '<span class="pill pill-wait">En attente de réponse</span>'
  }

  function card(a) {
    const d = DOMAINS[a.domain]
    const open = ui.open.has(a.id)
    const stepsId = `steps-${a.id}`
    const done = a.steps.filter((s) => s.done).length
    let msg = ''
    let actions = []
    let sim = ''
    const stepsBtn = `<button type="button" class="abtn" aria-expanded="${open}" aria-controls="${stepsId}" data-act="steps" data-id="${a.id}" data-fk="steps-${a.id}">${open ? 'Masquer les étapes' : 'Voir les étapes'} <span aria-hidden="true">(${done}/${a.steps.length})</span></button>`
    const simBox = (label, btns) => `<div class="sim"><p class="sim-label">Simulation · ${label}</p><div class="card-actions">${btns}</div></div>`
    const b = (act, label, cls = '', ic = '') => `<button type="button" class="abtn ${cls}" data-act="${act}" data-id="${a.id}" data-fk="${act}-${a.id}">${ic ? icon(ic) : ''}${label}</button>`

    switch (a.status) {
      case 'perso':
        actions = [stepsBtn, b('edit', 'Modifier'), state.partner ? b('share', `Proposer à ${PARTNER}`, '', 'i-users') : '', b('delete', 'Supprimer', 'abtn-quiet')]
        break
      case 'attente':
        if (a.from === 'alex') {
          msg = `<div class="card-msg">${PARTNER} propose cette action. Elle n’est pas acceptée tant que tu n’as pas répondu.</div>`
          actions = [stepsBtn, b('accept', 'Accepter', 'abtn-ok', 'i-check'), b('discuss', 'En discuter', '', 'i-chat'), b('refuse', 'Refuser')]
        } else {
          msg = `<div class="card-msg">Proposition envoyée. Rien n’est convenu tant qu’${PARTNER} n’a pas répondu&nbsp;; aucune relance automatique ne sera envoyée.</div>`
          actions = [stepsBtn, b('withdraw', 'Retirer ma proposition', 'abtn-quiet')]
          sim = simBox(`réponse d’${PARTNER}`, b('sim-accept', `${PARTNER} accepte`) + b('sim-discuss', `${PARTNER} veut en discuter`) + b('sim-refuse', `${PARTNER} refuse`))
        }
        break
      case 'acceptee':
        msg = a.from === 'alex' && a.owner === 'moi' ? `<div class="card-msg">Tu as accepté de t’en charger, en entier&nbsp;: y penser, préparer, réaliser, vérifier.</div>` : ''
        actions = [stepsBtn, b('edit', 'Modifier'), b('leave', 'Me retirer de cette action', 'abtn-quiet')]
        break
      case 'ajustement': {
        const p = a.prev || {}
        const changes = []
        if (p.title !== a.title) changes.push(`Intitulé&nbsp;: « ${esc(p.title)} » devient « ${esc(a.title)} »`)
        if (p.owner !== a.owner) changes.push(`Responsable&nbsp;: ${ownerLabel(p.owner)} devient ${ownerLabel(a.owner)}`)
        if (p.domain !== a.domain) changes.push(`Domaine&nbsp;: ${DOMAINS[p.domain]?.label} devient ${DOMAINS[a.domain].label}`)
        msg = `<div class="card-msg card-msg-adjust">${a.from === 'moi' ? `Tu as proposé un changement important. L’accord précédent reste valable tant qu’${PARTNER} n’a pas répondu.` : `${PARTNER} propose un changement important. L’accord précédent reste valable tant que tu n’as pas répondu.`}<ul>${changes.map((c) => `<li>${c}</li>`).join('')}</ul></div>`
        if (a.from === 'moi') {
          actions = [stepsBtn, b('adjust-cancel', 'Annuler ma modification', 'abtn-quiet')]
          sim = simBox(`réponse d’${PARTNER}`, b('sim-adjust-ok', `${PARTNER} accepte le changement`) + b('sim-adjust-no', `${PARTNER} refuse le changement`))
        } else {
          actions = [stepsBtn, b('adjust-ok', 'Accepter le changement', 'abtn-ok', 'i-check'), b('adjust-no', 'Garder l’accord précédent')]
        }
        break
      }
      case 'discussion':
        if (a.discussBy === 'moi') {
          msg = `<div class="card-msg card-msg-talk">Tu as demandé à en discuter avant de décider. ${PARTNER} peut reformuler sa proposition ou la retirer.</div>`
          actions = [stepsBtn]
          sim = simBox(`réponse d’${PARTNER}`, b('sim-reformulate', `${PARTNER} reformule et renvoie`) + b('sim-withdraw', `${PARTNER} retire sa proposition`))
        } else {
          msg = `<div class="card-msg card-msg-talk">${PARTNER} souhaite en discuter avant de décider. Quelques points pour préparer l’échange&nbsp;:<ul><li>Qu’est-ce qui te semble faisable, concrètement&nbsp;?</li><li>Qui y pense, qui prépare, qui vérifie&nbsp;?</li><li>Une répartition équitable n’est pas forcément moitié-moitié.</li></ul></div>`
          actions = [stepsBtn, b('reformulate', 'Reformuler la proposition'), b('keep', 'Garder pour moi'), b('delete', 'Retirer', 'abtn-quiet')]
        }
        break
      case 'refusee':
        if (a.refusedBy === 'alex') {
          msg = `<div class="card-msg card-msg-no">${PARTNER} a refusé cette proposition. Ce refus est respecté&nbsp;: aucune justification demandée, aucune relance automatique.</div>`
          actions = [b('keep', 'Garder l’action pour moi'), b('delete', 'Retirer de la liste', 'abtn-quiet')]
        } else {
          msg = `<div class="card-msg card-msg-no">Tu as refusé cette proposition. ${PARTNER} en est informé·e, sans justification demandée.</div>`
          actions = [b('reconsider', 'Changer d’avis'), b('delete', 'Retirer de la liste', 'abtn-quiet')]
        }
        break
    }

    const editable = a.status === 'perso' || a.status === 'acceptee'
    const allDone = a.steps.length > 0 && done === a.steps.length
    const stepsHtml = open ? `<div class="steps" id="${stepsId}">
        ${a.steps.length ? '' : '<p class="steps-note">Aucune étape pour l’instant.</p>'}
        ${a.steps.map((s, i) => `<div class="step ${s.done ? 'is-done' : ''}">
            <input type="checkbox" ${s.done ? 'checked' : ''} ${editable ? '' : 'disabled'} data-step-done data-id="${a.id}" data-step="${s.id}" data-fk="done-${s.id}" aria-label="Étape ${i + 1} faite" />
            <input type="text" value="${esc(s.text)}" ${editable ? '' : 'readonly'} maxlength="120" data-step-text data-id="${a.id}" data-step="${s.id}" data-fk="text-${s.id}" aria-label="Intitulé de l’étape ${i + 1}" />
            ${editable ? `<button type="button" class="icon-btn" data-act="step-del" data-id="${a.id}" data-step="${s.id}" aria-label="Supprimer l’étape ${i + 1}">${icon('i-close')}</button>` : '<span></span>'}
          </div>`).join('')}
        ${editable ? `<form class="step-add" data-step-add data-id="${a.id}"><label class="sr-only" for="add-${a.id}">Nouvelle étape</label><input id="add-${a.id}" type="text" maxlength="120" placeholder="Ajouter une étape" data-fk="add-${a.id}" /><button type="submit" class="abtn">${icon('i-plus')}Ajouter</button></form>
          <p class="steps-note">${a.status === 'acceptee' ? 'Ajuster les étapes ne change pas l’accord. Changer de responsable ou de périmètre repasse par un accord.' : 'Les étapes t’aident à prendre la responsabilité en entier.'}</p>` : '<p class="steps-note">Les étapes seront modifiables une fois l’action acceptée.</p>'}
        ${allDone ? '<p class="steps-note"><strong>Toutes les étapes sont faites.</strong> Cela ne dit rien, à lui seul, de la charge ressentie&nbsp;: le bilan personnel est là pour ça.</p>' : ''}
      </div>` : ''

    return `<article class="card-a ${ui.freshId === a.id ? 'is-new' : ''}" aria-labelledby="t-${a.id}">
      <div class="card-top"><span class="domain-tag">${icon(d.icon)}${d.label}</span>${statusPill(a)}</div>
      <h4 class="card-title" id="t-${a.id}">${esc(a.title)}</h4>
      <dl class="meta">
        <div><dt>Responsable</dt><dd>${ownerLabel(a.owner)}</dd></div>
        <div><dt>Statut</dt><dd>${statusText(a)}</dd></div>
        ${a.status !== 'perso' ? `<div><dt>Proposé par</dt><dd>${fromLabel(a.from)}</dd></div>` : ''}
        <div><dt>Échéance</dt><dd>${fmtDate(a.due)}</dd></div>
      </dl>
      ${msg}
      <div class="card-actions">${actions.filter(Boolean).join('')}</div>
      ${sim}
      ${stepsHtml}
    </article>`
  }

  function statusText(a) {
    return ({
      perso: 'Action personnelle, non partagée',
      acceptee: 'Acceptée par vous deux',
      discussion: 'Discussion demandée',
      refusee: a.refusedBy === 'alex' ? `Refusée par ${PARTNER}` : 'Refusée par toi',
      ajustement: 'Changement en attente d’accord',
      attente: a.from === 'alex' ? 'En attente de ta réponse' : `En attente de la réponse d’${PARTNER}`,
    })[a.status]
  }

  /* ----- Formulaire d'action ----- */
  function viewForm() {
    const f = ui.form
    const v = f.values
    const a = f.id ? find(f.id) : null
    const editingShared = a && a.status === 'acceptee'
    const shareOpts = SHARE_OPTIONS.filter(([k]) => !(editingShared && k === 'perso'))
    const title = f.mode === 'edit' ? (editingShared ? 'Modifier une action commune' : 'Modifier l’action') : f.mode === 'reformulate' ? 'Reformuler la proposition' : 'Nouvelle action'
    const isShare = v.share !== 'perso'
    const submitLabel = editingShared ? 'Enregistrer' : isShare ? `Envoyer la proposition à ${PARTNER} (simulé)` : f.mode === 'new' ? 'Créer l’action' : 'Enregistrer'
    const err = f.errors || {}
    return `<form class="form-panel form" novalidate data-action-form>
      <h4>${title}</h4>
      ${editingShared ? `<p class="field-hint">Changer l’intitulé, le domaine ou le responsable d’une action commune repasse par un accord d’${PARTNER}. L’échéance et les étapes peuvent être ajustées librement.</p>` : ''}
      <fieldset class="seg"><legend class="fieldset-legend">Domaine</legend>
        ${Object.entries(DOMAINS).map(([k, d]) => `<label><input type="radio" name="domain" value="${k}" ${v.domain === k ? 'checked' : ''} data-form-field data-fk="f-domain-${k}" />${icon(d.icon)}${d.label}</label>`).join('')}
      </fieldset>
      <div class="field">
        <label for="f-title">Intitulé</label>
        <input id="f-title" type="text" maxlength="160" value="${esc(v.title)}" data-form-field="title" data-fk="f-title" aria-describedby="f-title-hint f-title-err" ${err.title ? 'aria-invalid="true"' : ''} />
        <p class="field-hint" id="f-title-hint">Une responsabilité concrète, que l’on peut prendre en charge en entier.</p>
        ${err.title ? `<p class="field-error" id="f-title-err">${err.title}</p>` : ''}
        <div class="chips" aria-label="Suggestions">${DOMAINS[v.domain].suggestions.map((s, i) => `<button type="button" class="chip-btn" data-act="suggest" data-text="${esc(s)}" data-fk="sug-${i}">${esc(s)}</button>`).join('')}</div>
      </div>
      <fieldset class="seg"><legend class="fieldset-legend">Qui s’en charge&nbsp;?</legend>
        ${shareOpts.map(([k, label, ic]) => `<label><input type="radio" name="share" value="${k}" ${v.share === k ? 'checked' : ''} ${!state.partner && k !== 'perso' ? 'disabled' : ''} data-form-field data-fk="f-share-${k}" />${icon(ic)}${editingShared ? ownerLabel(k === 'moi' ? 'moi' : k) : label}</label>`).join('')}
      </fieldset>
      ${!state.partner ? '<p class="field-hint">Aucun partenaire connecté&nbsp;: l’action restera personnelle.</p>' : isShare && !editingShared ? `<p class="field-hint">${PARTNER} pourra accepter, demander à en discuter ou refuser. Rien n’est partagé avant son accord.</p>` : ''}
      <div class="field">
        <span class="fieldset-legend">Échéance <span class="opt">facultative</span></span>
        <label class="check"><input type="checkbox" ${v.noDue ? 'checked' : ''} data-form-field="noDue" data-fk="f-nodue" />Sans échéance</label>
        ${v.noDue ? '' : `<label class="sr-only" for="f-due">Date d’échéance</label><input id="f-due" type="date" min="${todayIso()}" value="${esc(v.due)}" data-form-field="due" data-fk="f-due" ${err.due ? 'aria-invalid="true" aria-describedby="f-due-err"' : ''} />${err.due ? `<p class="field-error" id="f-due-err">${err.due}</p>` : ''}`}
      </div>
      ${f.mode === 'new' ? `<div class="field"><label for="f-steps">Étapes <span class="opt">une par ligne, modifiables ensuite</span></label><textarea id="f-steps" rows="3" data-form-field="steps" data-fk="f-steps">${esc(v.steps)}</textarea></div>` : ''}
      <div class="form-row">
        <button type="submit" class="abtn abtn-primary" data-fk="f-submit">${submitLabel}</button>
        <button type="button" class="abtn abtn-quiet" data-act="form-cancel" data-fk="f-cancel">Annuler</button>
      </div>
    </form>`
  }

  function openForm({ mode = 'new', id = null, domain = 'anticipation', share = 'perso', title = '' } = {}) {
    if (id) {
      const a = find(id)
      const shareOf = a.status === 'perso' ? 'perso' : a.owner
      ui.form = { mode, id, values: { domain: a.domain, title: a.title, share: a.status === 'acceptee' ? a.owner : mode === 'reformulate' ? a.owner : shareOf, due: a.due, noDue: !a.due, steps: '' } }
    } else {
      ui.form = { mode, id: null, values: { domain, title, share: state.partner ? share : 'perso', due: '', noDue: true, steps: DOMAINS[domain].steps.join('\n') } }
    }
    render()
    panel.querySelector('#f-title')?.focus()
  }

  function submitForm() {
    const f = ui.form
    const v = f.values
    const errors = {}
    const title = v.title.trim()
    if (title.length < 3) errors.title = 'Donne un intitulé d’au moins 3 caractères.'
    if (!v.noDue && !v.due) errors.due = 'Choisis une date, ou coche « Sans échéance ».'
    else if (!v.noDue && v.due < todayIso()) errors.due = 'Cette date est déjà passée.'
    if (Object.keys(errors).length) {
      f.errors = errors
      render()
      panel.querySelector(errors.title ? '#f-title' : '#f-due')?.focus()
      return
    }
    const due = v.noDue ? '' : v.due
    const share = state.partner ? v.share : 'perso'
    let msg
    if (f.mode === 'new') {
      const a = {
        id: newId(), title, domain: v.domain, due, prev: null, refusedBy: null, discussBy: null, from: 'moi',
        owner: share === 'perso' ? 'moi' : share, status: share === 'perso' ? 'perso' : 'attente',
        steps: steps(v.steps.split('\n').map((s) => s.trim()).filter(Boolean).slice(0, 12)),
      }
      state.actions.unshift(a)
      ui.freshId = a.id
      msg = a.status === 'perso' ? 'Action personnelle créée. Elle n’est visible que par toi.' : `Proposition prête. Simule la réponse d’${PARTNER} dans Propositions.`
      if (a.status !== 'perso') state.tab = 'props'
    } else {
      const a = find(f.id)
      if (a.status === 'acceptee') {
        const major = a.title !== title || a.domain !== v.domain || a.owner !== share
        a.due = due
        if (major) {
          a.prev = { title: a.title, domain: a.domain, owner: a.owner }
          Object.assign(a, { title, domain: v.domain, owner: share, status: 'ajustement', from: 'moi' })
          msg = `Changement proposé à ${PARTNER}. L’accord précédent reste valable en attendant.`
        } else msg = 'Échéance mise à jour. L’accord reste inchangé.'
      } else {
        Object.assign(a, { title, domain: v.domain, due })
        if (f.mode === 'reformulate' || share !== 'perso') {
          Object.assign(a, { owner: share === 'perso' ? 'moi' : share, status: share === 'perso' ? 'perso' : 'attente', from: 'moi', discussBy: null, refusedBy: null })
          msg = a.status === 'attente' ? `Proposition envoyée à ${PARTNER} (simulé).` : 'Action enregistrée pour toi.'
        } else msg = 'Action modifiée.'
      }
      ui.freshId = a.id
    }
    ui.form = null
    commit(msg)
  }

  /* ----- Souhaits ----- */
  function viewWishes() {
    const opts = (list, val) => list.map(([k, l]) => `<option value="${k}" ${val === k ? 'selected' : ''}>${l}</option>`).join('')
    const wanting = Object.entries(state.wishes).filter(([, w]) => w.want === 'partager' || w.want === 'confier')
    let html = `<div class="app-intro"><div><h3>Mes souhaits</h3><p>Note ce qui se passe aujourd’hui et ce que tu souhaiterais. Personne d’autre ne voit cet écran.</p></div><span class="private-tag">${icon('i-eye-off')}Privé, jamais partagé automatiquement</span></div>`
    html += guide()
    html += Object.entries(DOMAINS).map(([k, d]) => {
      const w = state.wishes[k]
      const wants = w.want === 'partager' || w.want === 'confier'
      return `<div class="wish">
        <p class="wish-head">${icon(d.icon)}${d.label}</p>
        <div class="wish-grid">
          <div class="field"><label for="w-now-${k}">Aujourd’hui, qui s’en occupe&nbsp;?</label><select id="w-now-${k}" data-wish="${k}" data-key="now" data-fk="w-now-${k}">${opts(NOW_OPTIONS, w.now)}</select></div>
          <div class="field"><label for="w-want-${k}">Ce que je souhaiterais</label><select id="w-want-${k}" data-wish="${k}" data-key="want" data-fk="w-want-${k}">${opts(WANT_OPTIONS, w.want)}</select></div>
        </div>
        ${wants ? `<div class="wish-cta card-actions">${state.partner
          ? `<button type="button" class="abtn abtn-primary" data-act="wish-propose" data-domain="${k}" data-fk="wish-propose-${k}">${icon('i-users')}Préparer une proposition</button>`
          : `<p class="field-hint">Aucun partenaire connecté&nbsp;: tu peux préparer une discussion ci-dessous, à avoir hors de l’application.</p>`}</div>` : ''}
      </div>`
    }).join('')
    html += `<p class="app-section-title">Préparer une discussion</p>`
    if (!ui.discussionOpen) {
      html += `<button type="button" class="abtn" data-act="discussion" data-fk="discussion" ${wanting.length ? '' : 'disabled'}>${icon('i-chat')}Préparer une discussion à partir de mes souhaits</button>
        ${wanting.length ? '' : '<p class="field-hint">Indique d’abord au moins un domaine où tu souhaites partager davantage.</p>'}`
    } else {
      html += `<div class="field"><label for="w-discussion">Points que j’aimerais aborder <span class="opt">modifiable, envoyé nulle part</span></label><textarea id="w-discussion" rows="7" data-discussion data-fk="w-discussion">${esc(state.discussion)}</textarea></div>
        <div class="card-actions"><button type="button" class="abtn" data-act="copy" data-target="#w-discussion" data-fk="copy-discussion">${icon('i-copy')}Copier</button><button type="button" class="abtn abtn-quiet" data-act="discussion-close" data-fk="discussion-close">Fermer</button></div>`
    }
    return html
  }

  function buildDiscussion() {
    const lines = ['Ce que j’aimerais qu’on aborde :']
    Object.entries(state.wishes).forEach(([k, w]) => {
      if (w.want === 'partager') lines.push(`- ${DOMAINS[k].label} : j’aimerais qu’on partage davantage.`)
      if (w.want === 'confier') lines.push(`- ${DOMAINS[k].label} : j’aimerais que tu t’en charges, en entier.`)
    })
    lines.push('', 'Questions possibles :', '- Qu’est-ce qui te semble faisable, concrètement ?', '- Qui y pense, qui prépare, qui vérifie ?', '', 'Mes choix contraceptifs restent les miens : on parle ici d’organisation.')
    return lines.join('\n')
  }

  /* ----- Bilan ----- */
  function viewBilan() {
    const b = state.bilan
    const libLabel = (k) => LIBERTE.find(([x]) => x === k)?.[1] || 'non renseignée'
    return `<div class="app-intro"><div><h3>Mon bilan</h3><p>Facultatif. Il t’aide à faire le point pour toi. Il n’est montré ni à ton ou ta partenaire, ni à l’établissement, et personne n’a à le valider.</p></div><span class="private-tag">${icon('i-eye-off')}Privé</span></div>
      <form class="form-panel form" novalidate data-bilan-form>
        <div class="field">
          <label for="b-charge">Charge ressentie aujourd’hui, de 0 (aucune) à 10 (très lourde)</label>
          <div class="range-wrap"><span aria-hidden="true">0</span><input id="b-charge" type="range" min="0" max="10" step="1" value="${b.charge}" ${b.chargeSkip ? 'disabled' : ''} data-bilan="charge" data-fk="b-charge" aria-valuetext="${b.chargeSkip ? 'non renseignée' : `${b.charge} sur 10`}" /><span aria-hidden="true">10</span></div>
          <p><output for="b-charge" class="range-value" data-range-out>${b.chargeSkip ? '–' : `${b.charge}/10`}</output></p>
          <label class="check"><input type="checkbox" ${b.chargeSkip ? 'checked' : ''} data-bilan="chargeSkip" data-fk="b-skip" />Je préfère ne pas répondre</label>
        </div>
        <fieldset class="seg"><legend class="fieldset-legend">Liberté de décision</legend>
          ${LIBERTE.map(([k, l]) => `<label><input type="radio" name="liberte" value="${k}" ${b.liberte === k ? 'checked' : ''} data-bilan="liberte" data-fk="b-lib-${k}" />${l}</label>`).join('')}
        </fieldset>
        ${b.liberte === 'pas' ? `<p class="card-msg card-msg-no">Le partage ne doit jamais devenir une contrainte. Si tu ressens une pression, tu peux en parler à un·e professionnel·le ou au <a href="https://www.etudiant.gouv.fr/fr/les-services-de-sante-etudiante-sse-mode-d-emploi-3050" target="_blank" rel="noopener">service de santé étudiante<span class="sr-only"> (nouvel onglet)</span></a>.</p>` : ''}
        <div class="form-row"><button type="submit" class="abtn abtn-primary" data-fk="b-save">Enregistrer pour moi</button>${b.saved ? `<button type="button" class="abtn abtn-quiet" data-act="bilan-clear" data-fk="b-clear">Effacer mon bilan</button>` : ''}</div>
      </form>
      ${b.saved ? `<div class="summary" tabindex="-1" data-fk="b-summary"><p><strong>Bilan du ${new Date(b.saved.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}</strong></p><p>Charge ressentie&nbsp;: ${b.saved.charge === null ? 'non renseignée' : `${b.saved.charge}/10`}</p><p>Liberté de décision&nbsp;: ${libLabel(b.saved.liberte)}</p><p class="field-hint">Seul ce navigateur le garde, dans cette démo.</p></div>` : ''}
      <p class="field-hint" style="margin-top:1rem">L’évaluation envisagée avec les établissements sera distincte, facultative, et ne leur transmettra jamais de réponse individuelle.</p>`
  }

  /* ----- Recommander ----- */
  function viewReco() {
    return `<div class="app-intro"><div><h3>Recommander CoChoice</h3><p>Un message à modifier et à copier, si tu le souhaites. Rien n’est envoyé automatiquement, et le message ne contient aucune donnée de ta démo.</p></div></div>
      <div class="field"><label for="r-msg">Ton message</label><textarea id="r-msg" rows="6" maxlength="600" data-reco data-fk="r-msg" aria-describedby="r-count">${esc(state.reco)}</textarea><p class="field-hint" id="r-count" data-reco-count>${state.reco.length}/600 caractères</p></div>
      <div class="card-actions"><button type="button" class="abtn abtn-primary" data-act="copy" data-target="#r-msg" data-fk="r-copy">${icon('i-copy')}Copier le message</button><button type="button" class="abtn abtn-quiet" data-act="reco-reset" data-fk="r-reset">Revenir au texte proposé</button></div>`
  }

  /* ----- Événements ----- */
  async function copyFrom(selector) {
    const el = panel.querySelector(selector)
    try {
      await navigator.clipboard.writeText(el.value)
      toast('Copié. À toi de choisir où le partager.')
    } catch {
      el.focus(); el.select()
      toast('Copie automatique impossible : le texte est sélectionné, copie-le manuellement.')
    }
  }

  const ACTIONS = {
    'dismiss-guide': () => { state.guide = false; commit() },
    new: () => openForm(),
    'new-proposal': () => openForm({ share: 'moi' }),
    'form-cancel': () => { ui.form = null; render(); panel.focus() },
    suggest: (_, el) => { ui.form.values.title = el.dataset.text; render(); panel.querySelector('#f-title')?.focus() },
    steps: (a) => { ui.open.has(a.id) ? ui.open.delete(a.id) : ui.open.add(a.id); render() },
    edit: (a) => openForm({ mode: 'edit', id: a.id }),
    reformulate: (a) => openForm({ mode: 'reformulate', id: a.id }),
    share: (a) => { Object.assign(a, { status: 'attente', from: 'moi' }); state.tab = 'props'; commit(`Proposition envoyée à ${PARTNER} (simulé). Rien n’est convenu avant sa réponse.`) },
    delete: (a) => { state.actions = state.actions.filter((x) => x !== a); commit('Action retirée.') },
    accept: (a) => { a.status = 'acceptee'; commit('Accord enregistré. L’action devient commune.') },
    discuss: (a) => { Object.assign(a, { status: 'discussion', discussBy: 'moi' }); commit(`Demande de discussion envoyée à ${PARTNER} (simulé).`) },
    refuse: (a) => { Object.assign(a, { status: 'refusee', refusedBy: 'moi' }); commit('Refus enregistré. Tu n’as pas à te justifier.') },
    reconsider: (a) => { Object.assign(a, { status: 'attente', from: 'alex', refusedBy: null }); commit('La proposition est de nouveau à examiner.') },
    withdraw: (a) => { state.actions = state.actions.filter((x) => x !== a); commit('Proposition retirée.') },
    'sim-accept': (a) => { a.status = 'acceptee'; commit(`${PARTNER} a accepté (simulé). L’action est maintenant commune.`) },
    'sim-discuss': (a) => { Object.assign(a, { status: 'discussion', discussBy: 'alex' }); commit(`${PARTNER} souhaite en discuter (simulé).`) },
    'sim-refuse': (a) => { Object.assign(a, { status: 'refusee', refusedBy: 'alex' }); commit(`${PARTNER} a refusé (simulé). Ce refus est respecté.`) },
    'sim-reformulate': (a) => { Object.assign(a, { status: 'attente', from: 'alex', discussBy: null, title: a.title.endsWith('(reformulée)') ? a.title : `${a.title} (reformulée)` }); commit(`${PARTNER} a reformulé sa proposition (simulé).`) },
    'sim-withdraw': (a) => { state.actions = state.actions.filter((x) => x !== a); commit(`${PARTNER} a retiré sa proposition (simulé).`) },
    keep: (a) => { Object.assign(a, { status: 'perso', owner: 'moi', from: 'moi', refusedBy: null, discussBy: null }); state.tab = 'actions'; commit('L’action est gardée pour toi, en action personnelle.') },
    leave: (a) => { state.actions = state.actions.filter((x) => x !== a); commit(`Tu t’es retiré·e de cette action. ${PARTNER} en est informé·e (simulé).`) },
    'adjust-cancel': (a) => { Object.assign(a, a.prev, { status: 'acceptee', prev: null }); commit('Modification annulée. L’accord précédent s’applique.') },
    'sim-adjust-ok': (a) => { Object.assign(a, { status: 'acceptee', prev: null }); commit(`${PARTNER} a accepté le changement (simulé).`) },
    'sim-adjust-no': (a) => { Object.assign(a, a.prev, { status: 'acceptee', prev: null }); commit(`${PARTNER} a refusé le changement (simulé). L’accord précédent s’applique.`) },
    'adjust-ok': (a) => { Object.assign(a, { status: 'acceptee', prev: null }); commit('Changement accepté.') },
    'adjust-no': (a) => { Object.assign(a, a.prev, { status: 'acceptee', prev: null }); commit('L’accord précédent est conservé.') },
    'step-del': (a, el) => { a.steps = a.steps.filter((s) => s.id !== el.dataset.step); commit('Étape supprimée.') },
    'partner-on': () => setPartner(true),
    'wish-propose': (_, el) => { state.tab = 'actions'; openForm({ domain: el.dataset.domain, share: state.wishes[el.dataset.domain].want === 'confier' ? 'alex' : 'deux' }) },
    discussion: () => { ui.discussionOpen = true; state.discussion = buildDiscussion(); commit(); panel.querySelector('#w-discussion')?.focus() },
    'discussion-close': () => { ui.discussionOpen = false; render(); panel.querySelector('[data-fk="discussion"]')?.focus() },
    copy: (_, el) => copyFrom(el.dataset.target),
    'reco-reset': () => { state.reco = DEFAULT_RECO; commit('Texte proposé rétabli.') },
    'bilan-clear': () => { state.bilan = emptyBilan(); commit('Bilan effacé.') },
  }

  panel.addEventListener('click', (e) => {
    const el = e.target.closest('[data-act]')
    if (!el || el.disabled) return
    const fn = ACTIONS[el.dataset.act]
    if (!fn) return
    const a = el.dataset.id ? find(el.dataset.id) : null
    if (el.dataset.id && !a) return
    fn(a, el)
    if (!panel.contains(document.activeElement) || document.activeElement === document.body) panel.focus()
  })

  panel.addEventListener('submit', (e) => {
    e.preventDefault()
    if (e.target.matches('[data-action-form]')) return submitForm()
    if (e.target.matches('[data-step-add]')) {
      const a = find(e.target.dataset.id)
      const input = e.target.querySelector('input')
      const text = input.value.trim()
      if (!text) { input.focus(); return toast('Écris d’abord l’étape à ajouter.') }
      a.steps.push({ id: newId(), text, done: false })
      commit('Étape ajoutée.')
      panel.querySelector(`#add-${CSS.escape(a.id)}`)?.focus()
    }
    if (e.target.matches('[data-bilan-form]')) {
      const b = state.bilan
      b.saved = { date: Date.now(), charge: b.chargeSkip ? null : b.charge, liberte: b.liberte || 'skip' }
      commit('Bilan enregistré dans ce navigateur, pour toi seul·e.')
      panel.querySelector('[data-fk="b-summary"]')?.focus()
    }
  })

  panel.addEventListener('change', (e) => {
    const t = e.target
    if (t.matches('[data-step-done]')) {
      const s = find(t.dataset.id).steps.find((x) => x.id === t.dataset.step)
      s.done = t.checked
      commit()
    } else if (t.matches('[data-step-text]')) {
      const s = find(t.dataset.id).steps.find((x) => x.id === t.dataset.step)
      const text = t.value.trim()
      if (text) { s.text = text; save() } else t.value = s.text
    } else if (t.matches('[data-wish]')) {
      state.wishes[t.dataset.wish][t.dataset.key] = t.value
      commit()
    } else if (t.matches('[data-form-field]')) {
      const v = ui.form.values
      if (t.name === 'domain') {
        const oldDefault = DOMAINS[v.domain].steps.join('\n')
        if (ui.form.mode === 'new' && (!v.steps || v.steps === oldDefault)) v.steps = DOMAINS[t.value].steps.join('\n')
        v.domain = t.value
        render()
      } else if (t.name === 'share') { v.share = t.value; render() }
      else if (t.dataset.formField === 'noDue') { v.noDue = t.checked; render(); if (!t.checked) panel.querySelector('#f-due')?.focus() }
    } else if (t.matches('[data-bilan="chargeSkip"]')) { state.bilan.chargeSkip = t.checked; commit() }
    else if (t.matches('[data-bilan="liberte"]')) { state.bilan.liberte = t.value; commit() }
  })

  panel.addEventListener('input', (e) => {
    const t = e.target
    if (t.matches('[data-form-field="title"]')) { ui.form.values.title = t.value; if (ui.form.errors) ui.form.errors.title = '' }
    else if (t.matches('[data-form-field="due"]')) { ui.form.values.due = t.value; if (ui.form.errors) ui.form.errors.due = '' }
    else if (t.matches('[data-form-field="steps"]')) ui.form.values.steps = t.value
    else if (t.matches('[data-bilan="charge"]')) {
      state.bilan.charge = Number(t.value)
      t.setAttribute('aria-valuetext', `${t.value} sur 10`)
      panel.querySelector('[data-range-out]').textContent = `${t.value}/10`
      save()
    } else if (t.matches('[data-reco]')) {
      state.reco = t.value
      panel.querySelector('[data-reco-count]').textContent = `${t.value.length}/600 caractères`
      save()
    } else if (t.matches('[data-discussion]')) { state.discussion = t.value; save() }
  })

  // Onglets : clic et flèches
  function selectTab(name, focus = false) {
    state.tab = name
    ui.form = null
    save(); render()
    if (focus) root.querySelector(`[data-tab="${name}"]`).focus()
  }
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => selectTab(t.dataset.tab))
    t.addEventListener('keydown', (e) => {
      const keys = { ArrowRight: 1, ArrowLeft: -1 }
      if (keys[e.key]) { e.preventDefault(); selectTab(tabs[(i + keys[e.key] + tabs.length) % tabs.length].dataset.tab, true) }
      if (e.key === 'Home') { e.preventDefault(); selectTab(tabs[0].dataset.tab, true) }
      if (e.key === 'End') { e.preventDefault(); selectTab(tabs[tabs.length - 1].dataset.tab, true) }
    })
  })

  /* ----- Réglages ----- */
  function setPartner(on) {
    state.partner = on
    if (!on) {
      // Fin du partage : les actions dont tu es responsable redeviennent personnelles, le reste s'arrête.
      state.actions = state.actions
        .filter((a) => a.status === 'perso' || (a.owner === 'moi' && a.status !== 'refusee'))
        .map((a) => ({ ...a, status: 'perso', from: 'moi', prev: null, discussBy: null }))
      ui.form = null
      commit('Partenaire déconnecté (simulé). Tes actions restent, le partage s’arrête.')
    } else commit(`${PARTNER} (fictif) est connecté·e. Rien n’est partagé sans accord.`)
  }
  partnerSwitch.addEventListener('click', () => setPartner(!state.partner))

  function loadScenario(name) {
    state = seed(name)
    ui.open.clear(); ui.form = null; ui.discussionOpen = false
    save(); render()
    toast(`Exemple chargé : « ${SCENARIO_LABELS[name]} »`)
    document.dispatchEvent(new CustomEvent('cochoice:scenario', { detail: name }))
  }
  scenarioSelect.addEventListener('change', () => loadScenario(scenarioSelect.value))
  document.querySelector('[data-demo-reset]').addEventListener('click', () => loadScenario(state.scenario))
  document.querySelector('[data-demo-clear]').addEventListener('click', () => {
    state = { ...seed(state.scenario), actions: [], guide: false, tab: 'actions' }
    ui.open.clear(); ui.form = null; ui.discussionOpen = false
    try { localStorage.removeItem(STORAGE_KEY) } catch { /* rien à effacer */ }
    render()
    toast('Données de démo effacées de ce navigateur.')
  })

  render()
  return { loadScenario, focusPanel: () => panel.focus({ preventScroll: true }), get scenario() { return state.scenario } }
}
