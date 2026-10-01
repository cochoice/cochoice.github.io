// Tâches et rappels : propose, Alex accepte, veut en discuter ou refuse (réponse simulée).
// Logique reprise de l'ancienne démo (demo.js), recentrée sur le brief.
import { PARTNER, FAMILIES, SUGGESTIONS, STATUS, OWNERS, esc, icon, newId, fmtDue, fmtDay, todayIso, ownerName } from './data.js'

const pill = (t) => `<span class="a-pill a-pill-${STATUS[t.status].cls}">${STATUS[t.status].label}</span>`

function meta(t) {
  const parts = [FAMILIES[t.family].label]
  if (t.status === 'perso') parts.push('visible par toi seul·e')
  else if (t.status === 'attente') parts.push(`proposée à ${PARTNER}`)
  else parts.push(ownerName(t.owner))
  if (t.due) parts.push(fmtDue(t.due))
  return parts.join(' · ')
}

function reminder(t) {
  if (!t.due || !t.remind) return ''
  return `<p class="a-task-remind">${icon('bell')}Rappel la veille${t.notify ? ` · ${PARTNER} prévenu·e aussi` : ''}</p>`
}

function card(ctx, t) {
  const b = (act, label, cls = '') => `<button type="button" class="a-btn a-btn-small ${cls}" data-act="${act}" data-id="${t.id}" data-fk="${act}-${t.id}">${label}</button>`
  const canShare = ctx.canShare('taches')
  let msg = ''
  let btns = []
  switch (t.status) {
    case 'perso':
      btns = [canShare ? b('task-propose', `Proposer à ${PARTNER}`) : '', b('task-done', 'Faite'), b('task-delete', 'Supprimer', 'a-btn-quiet')]
      break
    case 'attente':
      msg = `Rien n’est convenu tant qu’${PARTNER} n’a pas répondu. Pas de relance automatique.`
      btns = [b('task-withdraw', 'Retirer', 'a-btn-quiet')]
      break
    case 'acceptee':
      btns = [b('task-done', 'Marquer comme faite')]
      break
    case 'discussion':
      msg = `${PARTNER} veut en parler avant de décider.`
      btns = [b('task-repropose', 'Reproposer'), b('task-keep', 'Je la garde pour moi')]
      break
    case 'refusee':
      msg = `${PARTNER} a refusé. Refus respecté, sans relance.`
      btns = [b('task-keep', 'Je la garde pour moi'), b('task-delete', 'Retirer', 'a-btn-quiet')]
      break
    case 'faite':
      btns = [b('task-delete', 'Retirer', 'a-btn-quiet')]
      break
  }
  const sim = t.status === 'attente'
    ? `<div class="a-sim"><p class="a-sim-label">Simuler la réponse d’${PARTNER}</p><div class="a-btns">${b('sim-accept', 'Accepte')}${b('sim-discuss', 'À discuter')}${b('sim-refuse', 'Refuse')}</div></div>`
    : ''
  return `<article class="a-task ${ctx.ui.fresh === t.id ? 'is-new' : ''} ${t.status === 'faite' ? 'is-done' : ''}" aria-labelledby="tt-${t.id}">
    <div class="a-row"><h3 class="a-task-title" id="tt-${t.id}">${icon(FAMILIES[t.family].icon)}${esc(t.title)}</h3>${pill(t)}</div>
    <p class="a-sub">${meta(t)}</p>
    ${reminder(t)}
    ${msg ? `<p class="a-task-msg">${msg}</p>` : ''}
    ${btns.filter(Boolean).length ? `<div class="a-btns">${btns.join('')}</div>` : ''}
    ${sim}
  </article>`
}

function form(ctx) {
  const f = ctx.ui.taskForm
  const v = f.values
  const err = f.errors || {}
  const canShare = ctx.canShare('taches')
  const canNotify = ctx.canShare('rappels')
  const shareHint = !ctx.state.duo ? `Invite ton ou ta partenaire (onglet Moi) pour proposer une tâche.`
    : ctx.state.pause ? 'Partage en pause : la tâche reste personnelle.'
      : !ctx.state.sharing.taches ? 'Le partage des tâches est désactivé dans Moi : la tâche reste personnelle.' : ''
  return `<form class="a-form" data-form="task" novalidate>
    <h3 class="a-form-title" tabindex="-1" data-focus>Proposer une tâche</h3>
    <div class="a-field">
      <span class="a-label" id="sug-label">Suggestions</span>
      <div class="a-chips" role="group" aria-labelledby="sug-label">${SUGGESTIONS.map((s, i) => `<button type="button" class="a-chip" data-act="task-suggest" data-i="${i}" data-fk="sug-${i}">${esc(s.title)}</button>`).join('')}</div>
    </div>
    <div class="a-field">
      <label for="tf-title" class="a-label">Intitulé</label>
      <input id="tf-title" name="title" type="text" maxlength="80" value="${esc(v.title)}" ${err.title ? 'aria-invalid="true" aria-describedby="tf-title-err"' : ''} />
      ${err.title ? `<p class="a-error" id="tf-title-err">${err.title}</p>` : ''}
    </div>
    <fieldset class="a-choices a-choices-grid">
      <legend class="a-label">Famille</legend>
      ${Object.entries(FAMILIES).map(([k, fam]) => `<label class="a-choice"><input type="radio" name="family" value="${k}" ${v.family === k ? 'checked' : ''} /><span>${icon(fam.icon)}${fam.label}</span></label>`).join('')}
    </fieldset>
    <fieldset class="a-choices">
      <legend class="a-label">Qui s’en occupe ?</legend>
      ${OWNERS.map(([k, label]) => `<label class="a-choice"><input type="radio" name="owner" value="${k}" ${v.owner === k ? 'checked' : ''} ${k !== 'perso' && !canShare ? 'disabled' : ''} /><span>${label}</span></label>`).join('')}
      ${shareHint ? `<p class="a-hint">${shareHint}</p>` : ''}
    </fieldset>
    <div class="a-field">
      <label for="tf-due" class="a-label">Échéance <span class="a-opt">facultative</span></label>
      <input id="tf-due" name="due" type="date" min="${todayIso()}" value="${esc(v.due)}" ${err.due ? 'aria-invalid="true" aria-describedby="tf-due-err"' : ''} />
      ${err.due ? `<p class="a-error" id="tf-due-err">${err.due}</p>` : ''}
    </div>
    <fieldset class="a-choices">
      <legend class="a-label">Rappel</legend>
      <label class="a-check"><input type="checkbox" name="remind" ${v.remind ? 'checked' : ''} /><span>Me rappeler la veille de l’échéance</span></label>
      <label class="a-check"><input type="checkbox" name="notify" ${v.notify && canNotify ? 'checked' : ''} ${canNotify ? '' : 'disabled'} /><span>Prévenir ${PARTNER} aussi</span></label>
      ${canNotify ? '' : `<p class="a-hint">${PARTNER} n’est prévenu·e que si tu l’autorises : active « Mes rappels » dans Moi.</p>`}
    </fieldset>
    <div class="a-btns">
      <button type="submit" class="a-btn a-btn-primary">${v.owner === 'perso' || !canShare ? 'Créer la tâche' : `Proposer à ${PARTNER}`}</button>
      <button type="button" class="a-btn a-btn-ghost" data-act="task-cancel">Annuler</button>
    </div>
  </form>`
}

export function view(ctx) {
  const { state, ui } = ctx
  const open = state.tasks.filter((t) => t.status !== 'faite')
  const done = state.tasks.filter((t) => t.status === 'faite')
  const upcoming = open.filter((t) => t.due && t.status !== 'refusee').sort((a, b) => a.due.localeCompare(b.due))
  return `<h2 class="a-title" tabindex="-1" data-focus>Tâches</h2>
    <p class="a-sub">Information · Anticipation · Démarches · Frais</p>
    ${upcoming.length ? `<section class="a-box" aria-labelledby="a-upcoming"><h3 class="a-box-title" id="a-upcoming">${icon('calendar-blank')}À venir</h3>
      <ul class="a-upcoming">${upcoming.map((t) => `<li><span>${fmtDay(t.due)}</span>${esc(t.title)}</li>`).join('')}</ul></section>` : ''}
    ${ui.taskForm ? form(ctx) : `<button type="button" class="a-btn a-btn-primary a-btn-block" data-act="task-new" data-fk="task-new">${icon('plus')}Proposer une tâche</button>`}
    <div class="a-stack">${open.map((t) => card(ctx, t)).join('') || '<p class="a-muted">Aucune tâche en cours.</p>'}</div>
    ${done.length ? `<h3 class="a-section">Faites · ${done.length}</h3><div class="a-stack">${done.map((t) => card(ctx, t)).join('')}</div>` : ''}`
}

export function openForm(ctx, preset = {}) {
  const share = ctx.canShare('taches')
  ctx.ui.taskForm = { values: { title: '', family: 'anticipation', owner: share ? 'alex' : 'perso', due: '', remind: true, notify: false, ...preset } }
}

// Garde les valeurs saisies quand le formulaire est redessiné (suggestion, erreur)
function readForm(ctx, form) {
  const v = ctx.ui.taskForm.values
  v.title = form.title.value
  v.family = form.querySelector('input[name="family"]:checked')?.value || v.family
  v.owner = form.querySelector('input[name="owner"]:checked')?.value || 'perso'
  v.due = form.due.value
  v.remind = form.remind.checked
  v.notify = form.notify.checked
  return v
}

const find = (ctx, id) => ctx.state.tasks.find((t) => t.id === id)
const set = (ctx, el, patch, msg) => { Object.assign(find(ctx, el.dataset.id), patch); ctx.commit(msg) }

export const actions = {
  'task-new': (ctx) => { openForm(ctx); ctx.render(); ctx.focus('#tf-title') },
  'task-cancel': (ctx) => { ctx.ui.taskForm = null; ctx.render(); ctx.focus('[data-fk="task-new"]') },
  'task-suggest': (ctx, el) => {
    const form = el.closest('form')
    const v = readForm(ctx, form)
    const s = SUGGESTIONS[Number(el.dataset.i)]
    Object.assign(v, { title: s.title, family: s.family })
    ctx.render()
    ctx.focus('#tf-title')
  },
  'task-propose': (ctx, el) => set(ctx, el, { status: 'attente', owner: 'alex' }, `Tâche proposée à ${PARTNER}.`),
  'task-repropose': (ctx, el) => set(ctx, el, { status: 'attente' }, `Tâche reproposée à ${PARTNER}.`),
  'task-withdraw': (ctx, el) => set(ctx, el, { status: 'perso', owner: 'moi' }, 'Proposition retirée. La tâche redevient personnelle.'),
  'task-keep': (ctx, el) => set(ctx, el, { status: 'perso', owner: 'moi' }, 'La tâche est à toi, visible par toi seul·e.'),
  'task-done': (ctx, el) => set(ctx, el, { status: 'faite' }, 'Tâche marquée comme faite.'),
  'task-delete': (ctx, el) => { ctx.state.tasks = ctx.state.tasks.filter((t) => t.id !== el.dataset.id); ctx.commit('Tâche retirée.'); ctx.focus('[data-fk="task-new"]') },
  'sim-accept': (ctx, el) => set(ctx, el, { status: 'acceptee' }, `${PARTNER} a accepté la tâche.`),
  'sim-discuss': (ctx, el) => set(ctx, el, { status: 'discussion' }, `${PARTNER} veut en discuter.`),
  'sim-refuse': (ctx, el) => set(ctx, el, { status: 'refusee' }, `${PARTNER} a refusé. Le refus est respecté.`),
}

export const forms = {
  task: (ctx, form) => {
    const v = readForm(ctx, form)
    const errors = {}
    if (v.title.trim().length < 3) errors.title = 'Donne un intitulé d’au moins 3 caractères.'
    if (v.due && v.due < todayIso()) errors.due = 'Cette date est déjà passée.'
    if (Object.keys(errors).length) {
      ctx.ui.taskForm.errors = errors
      ctx.render()
      ctx.focus(errors.title ? '#tf-title' : '#tf-due')
      return
    }
    const shared = v.owner !== 'perso' && ctx.canShare('taches')
    const t = {
      id: newId(), title: v.title.trim(), family: v.family, due: v.due,
      owner: shared ? v.owner : 'moi', status: shared ? 'attente' : 'perso',
      remind: Boolean(v.due) && v.remind, notify: Boolean(v.due) && v.remind && v.notify && ctx.canShare('rappels'),
    }
    ctx.state.tasks.unshift(t)
    ctx.ui.taskForm = null
    ctx.ui.fresh = t.id
    ctx.commit(shared ? `Tâche proposée à ${PARTNER}. Simule sa réponse sur la carte.` : 'Tâche créée, visible par toi seul·e.')
    ctx.focus(`#tt-${t.id}`)
  },
}

// Utilisé par le check-in : « Transformer en tâche »
export function addTask(ctx, { title, family }) {
  const t = { id: newId(), title, family, due: '', owner: 'moi', status: 'perso', remind: false, notify: false }
  ctx.state.tasks.unshift(t)
  ctx.ui.fresh = t.id
  return t
}
