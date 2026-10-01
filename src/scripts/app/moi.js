// Moi : ce que tu partages, mode pause, tes données, infos fiables, engagements.
import { PARTNER, DUO_CODE, SHARING, AMELI_URL, SSE_URL, esc, icon } from './data.js'

const ENGAGEMENTS = [
  ['shield-check', 'Hébergement de santé (HDS) en France prévu'],
  ['x', 'Aucune revente de données'],
  ['lock', 'Chiffrement'],
  ['check', 'Consentement explicite'],
]

function confirmBox(kind) {
  const text = kind === 'delete'
    ? 'Tout supprimer ? Tâches, frais et check-in sont effacés, et la démo repart du démarrage.'
    : `Quitter le duo ? ${PARTNER} ne verra plus rien. Tes tâches deviennent personnelles.`
  return `<div class="a-confirm" role="group" aria-labelledby="a-confirm-text">
    <p id="a-confirm-text" tabindex="-1" data-focus>${text}</p>
    <div class="a-btns">
      <button type="button" class="a-btn a-btn-danger a-btn-small" data-act="${kind === 'delete' ? 'me-delete-ok' : 'me-leave-ok'}">${kind === 'delete' ? 'Oui, tout supprimer' : 'Oui, quitter le duo'}</button>
      <button type="button" class="a-btn a-btn-ghost a-btn-small" data-act="me-confirm-cancel" data-kind="${kind}">Annuler</button>
    </div>
  </div>`
}

export function view(ctx) {
  const { state, ui } = ctx
  const sw = ([k, label]) => `<div class="a-toggle"><span id="sw-${k}">${label}</span>
    <button type="button" role="switch" class="a-switch" aria-checked="${state.sharing[k]}" aria-labelledby="sw-${k}" data-act="me-toggle" data-k="${k}" data-fk="sw-${k}" ${state.duo ? '' : 'disabled'}><span></span></button></div>`
  const duo = state.duo
    ? `<p class="a-row"><span class="a-inline">${icon('users-three')}Ton duo avec ${PARTNER}</span><span class="a-pill a-pill-ok">Connecté·e</span></p>`
    : `<p>Tu utilises CoChoice seul·e. Rien n’est partagé.</p>
       <p class="a-row"><span>Ton code duo</span><b class="a-code-sm">${DUO_CODE.slice(0, 3)} ${DUO_CODE.slice(3)}</b></p>
       <button type="button" class="a-btn a-btn-small" data-act="me-invite" data-fk="me-invite">Simuler : ${PARTNER} rejoint ton duo</button>`
  return `<h2 class="a-title" tabindex="-1" data-focus>Ce que tu partages</h2>
    <p class="a-sub">Donnée par donnée. Rien ne part sans ton accord.</p>
    <section class="a-box" aria-label="Ton duo">${duo}</section>
    <div class="a-toggles ${state.pause ? 'is-paused' : ''}">${SHARING.map(sw).join('')}</div>
    ${state.duo ? `<button type="button" class="a-btn a-btn-block ${state.pause ? 'a-btn-ghost' : 'a-btn-primary'}" data-act="me-pause" data-fk="me-pause" aria-describedby="a-pause-help">${icon(state.pause ? 'play' : 'pause')}${state.pause ? 'Reprendre le partage' : 'Mettre en pause'}</button>
      <p class="a-hint" id="a-pause-help">${state.pause ? `${PARTNER} voit seulement « Partage en pause ».` : 'Un clic, plus rien n’est partagé, sans explication à donner.'}</p>` : ''}
    <section class="a-box" aria-labelledby="a-data">
      <h3 class="a-box-title" id="a-data">Mes données</h3>
      <div class="a-btns">
        <button type="button" class="a-btn a-btn-small" data-act="me-export" data-fk="me-export">${icon('download-simple')}Exporter</button>
        <button type="button" class="a-btn a-btn-small" data-act="me-delete" data-fk="me-delete">${icon('trash')}Tout supprimer</button>
        ${state.duo ? `<button type="button" class="a-btn a-btn-small" data-act="me-leave" data-fk="me-leave">${icon('sign-out')}Quitter le duo</button>` : ''}
      </div>
      ${ui.confirm ? confirmBox(ui.confirm) : ''}
    </section>
    <section class="a-box" aria-labelledby="a-infos">
      <h3 class="a-box-title" id="a-infos">Besoin d’un avis médical ?</h3>
      <p>Ton service de santé étudiante ou un·e pro.</p>
      <ul class="a-links">
        <li><a href="${SSE_URL}" target="_blank" rel="noopener">Les services de santé étudiante${icon('arrow-square-out')}<span class="sr-only"> (nouvel onglet)</span></a></li>
        <li><a href="${AMELI_URL}" target="_blank" rel="noopener">Ameli : contraception${icon('arrow-square-out')}<span class="sr-only"> (nouvel onglet)</span></a></li>
      </ul>
      <p class="a-muted">CoChoice informe et organise. Il ne soigne pas.</p>
    </section>
    <section class="a-box" aria-labelledby="a-engage">
      <h3 class="a-box-title" id="a-engage">Nos engagements</h3>
      <ul class="a-engage">${ENGAGEMENTS.map(([ic, t]) => `<li>${icon(ic)}${esc(t)}</li>`).join('')}</ul>
    </section>
    <button type="button" class="a-btn a-btn-ghost a-btn-block" data-act="feedback" data-fk="me-feedback">${icon('chat-circle-dots')}Donner mon avis</button>`
}

export const actions = {
  'me-toggle': (ctx, el) => {
    const k = el.dataset.k
    ctx.state.sharing[k] = !ctx.state.sharing[k]
    const label = SHARING.find(([key]) => key === k)[1]
    ctx.commit(`${label} : ${ctx.state.sharing[k] ? `partagé avec ${PARTNER}` : 'plus partagé'}.`)
  },
  'me-pause': (ctx) => {
    ctx.state.pause = !ctx.state.pause
    ctx.commit(ctx.state.pause ? `Partage en pause. ${PARTNER} voit seulement « Partage en pause ».` : 'Partage repris.')
  },
  'me-invite': (ctx) => { ctx.state.duo = true; ctx.commit(`${PARTNER} a rejoint ton duo.`); ctx.focus('[data-fk="sw-taches"]') },
  'me-export': (ctx) => ctx.announce('Export simulé : dans l’appli, tu recevrais un fichier avec toutes tes données.'),
  'me-delete': (ctx) => { ctx.ui.confirm = 'delete'; ctx.render(); ctx.focus('#a-confirm-text') },
  'me-leave': (ctx) => { ctx.ui.confirm = 'leave'; ctx.render(); ctx.focus('#a-confirm-text') },
  'me-confirm-cancel': (ctx, el) => { const k = el.dataset.kind; ctx.ui.confirm = null; ctx.render(); ctx.focus(`[data-fk="me-${k}"]`) },
  'me-delete-ok': (ctx) => { ctx.ui.confirm = null; ctx.reset('Toutes les données ont été supprimées (simulé).') },
  'me-leave-ok': (ctx) => {
    ctx.ui.confirm = null
    ctx.state.duo = false
    ctx.state.pause = false
    ctx.state.tasks.forEach((t) => { if (!['perso', 'faite'].includes(t.status)) Object.assign(t, { status: 'perso', owner: 'moi', notify: false }) })
    ctx.commit(`Tu as quitté le duo. ${PARTNER} ne voit plus rien.`)
    ctx.focus('[data-fk="me-invite"]')
  },
}
