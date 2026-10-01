// Check-in mensuel en 5 questions, révélation simultanée, puis paquet de cartes « À se poser ensemble ».
// Logique reprise de l'ancien checkin.js : 5 questions au lieu de 4, sans le mode « question sensible ».
import { PARTNER, QUESTIONS, ALEX_ANSWERS, TALK, CARDS, esc, icon, ofMonth, axisPos } from './data.js'
import { addTask } from './taches.js'

const answerLabel = (q, v) => (q.type === 'scale' ? String(v) : q.options[v])

// Écart entre tes réponses et celles d'Alex, par question
function gaps(answers) {
  const out = {}
  QUESTIONS.forEach((q) => {
    const me = answers[q.id]
    const alex = ALEX_ANSWERS[q.id]
    if (q.type === 'axis') out[q.id] = Math.abs(axisPos(me, 'moi') - axisPos(alex, 'alex'))
    else if (q.type === 'scale') out[q.id] = Math.abs(me - alex)
  })
  return out
}
// L'écart à mettre en avant : la charge s'il dépasse 2 points, sinon le premier « qui » qui diffère
function mainGap(answers) {
  const g = gaps(answers)
  if (g.charge >= 3) return { id: 'charge', label: `${g.charge} points` }
  const axis = QUESTIONS.find((q) => q.type === 'axis' && g[q.id] > 0)
  return axis ? { id: axis.id, label: g[axis.id] > 1 ? 'Grand écart' : 'Petit écart' } : null
}

function viewQuestion(ci) {
  const q = QUESTIONS[ci.step]
  const val = ci.answers[q.id]
  let field
  if (q.type === 'scale') {
    const v = val ?? 5
    field = `<div class="a-range"><input type="range" name="v" min="${q.min}" max="${q.max}" step="1" value="${v}" aria-labelledby="ci-q" aria-describedby="ci-range-help" data-change="ci-range" />
      <p class="a-range-val" aria-hidden="true"><span>${q.min}</span><output data-range-out>${v}</output><span>${q.max}</span></p>
      <p class="a-hint" id="ci-range-help">0 : aucune charge · 10 : très lourde</p></div>`
  } else {
    field = `<div class="a-choices">${q.options.map((o, i) => `<label class="a-choice"><input type="radio" name="v" value="${i}" ${val === i ? 'checked' : ''} required /><span>${esc(o)}</span></label>`).join('')}</div>`
  }
  return `<form class="a-form a-form-plain" data-form="checkin" novalidate>
    <p class="sr-only">Question ${ci.step + 1} sur ${QUESTIONS.length}</p>
    <div class="a-progress" aria-hidden="true"><i style="width:${((ci.step + 1) / QUESTIONS.length) * 100}%"></i></div>
    <fieldset class="a-choices">
      <legend class="a-q" id="ci-q" tabindex="-1" data-focus>${esc(q.q)}</legend>
      ${field}
    </fieldset>
    <p class="a-error" data-ci-error hidden>Choisis une réponse pour continuer.</p>
    <div class="a-btns a-btns-split">
      ${ci.step > 0 ? `<button type="button" class="a-btn a-btn-ghost" data-act="ci-prev">${icon('arrow-left')}Retour</button>` : '<span></span>'}
      <button type="submit" class="a-btn a-btn-primary">${ci.step === QUESTIONS.length - 1 ? 'Terminer' : 'Suivant'}</button>
    </div>
  </form>`
}

function viewDone(ctx) {
  const ci = ctx.state.checkin
  const blocked = !ctx.canShare('checkin')
  return `<div class="a-box">
    <p class="a-box-title" tabindex="-1" data-focus>${icon('lock')}Tes réponses sont verrouillées.</p>
    <p>${PARTNER} a déjà répondu. Rien ne s’affiche tant que vous n’avez pas répondu tous les deux : c’est le cas, vous pouvez découvrir vos réponses en même temps.</p>
  </div>
  <label class="a-check"><input type="checkbox" ${ci.keepPrivate ? 'checked' : ''} data-change="ci-private" /><span>Ce mois-ci, je garde mes réponses pour moi</span></label>
  ${ci.keepPrivate ? `<p class="a-note">Rien n’est partagé. Tu ne vois pas non plus les réponses d’${PARTNER} : c’est donnant-donnant.</p>` : ''}
  ${blocked && !ci.keepPrivate ? `<p class="a-note">${ctx.state.pause ? 'Partage en pause' : 'Le partage de tes réponses au check-in est désactivé dans Moi'} : rien n’est révélé.</p>` : ''}
  <div class="a-btns a-btns-split">
    <button type="button" class="a-btn a-btn-ghost" data-act="ci-edit">${icon('arrow-left')}Modifier</button>
    <button type="button" class="a-btn a-btn-primary" data-act="ci-reveal" data-fk="ci-reveal" ${ci.keepPrivate || blocked ? 'disabled' : ''}>Voir nos réponses</button>
  </div>`
}

function viewReveal(ctx) {
  const ci = ctx.state.checkin
  const rows = QUESTIONS.map((q, i) => {
    const me = ci.answers[q.id]
    const alex = ALEX_ANSWERS[q.id]
    if (q.type === 'scale') {
      const bar = (v, cls) => `<span class="a-bar"><i class="${cls}" style="width:${(v / q.max) * 100}%"></i></span>`
      return `<div class="a-box a-reveal" style="--i:${i}"><p class="a-box-title">${esc(q.short)}</p>
        <p class="a-row"><span>Toi</span><span>${me}</span></p>${bar(me, 'a-bar-me')}
        <p class="a-row"><span>${PARTNER}</span><span>${alex}</span></p>${bar(alex, 'a-bar-alex')}</div>`
    }
    return `<div class="a-box a-reveal" style="--i:${i}"><p class="a-box-title">${esc(q.short)}</p>
      <p class="a-says"><span class="a-who a-who-me">Toi</span>${esc(answerLabel(q, me))}</p>
      <p class="a-says"><span class="a-who a-who-alex">${PARTNER}</span>${esc(answerLabel(q, alex))}</p></div>`
  }).join('')
  const gap = mainGap(ci.answers)
  const talk = gap
    ? `<div class="a-box a-talk a-reveal" style="--i:${QUESTIONS.length}"><p class="a-row"><b>Un écart à en parler</b><span class="a-pill a-pill-no">${gap.label}</span></p>
        <p>« ${esc(TALK[gap.id].q)} »</p>
        ${ci.talkDone ? `<p class="a-ok">${icon('check')}Tâche créée dans l’onglet Tâches.</p><button type="button" class="a-btn a-btn-small" data-go="taches">Voir la tâche</button>`
          : `<button type="button" class="a-btn a-btn-primary" data-act="ci-task" data-fk="ci-task">Transformer en tâche</button>`}
      </div>`
    : `<p class="a-ok">${icon('check')}Pas d’écart marqué ce mois-ci. Une carte ci-dessous peut quand même lancer la discussion.</p>`
  return `<div class="a-reveal-list ${ctx.ui.revealing ? 'is-revealing' : ''}">
    <p class="a-sub" tabindex="-1" data-focus>Vous avez répondu tous les deux. Voici vos réponses, côte à côte.</p>
    ${rows}${talk}
    </div>
    <button type="button" class="a-btn a-btn-ghost a-btn-small" data-act="ci-restart">Refaire le check-in</button>`
}

export function view(ctx) {
  const ci = ctx.state.checkin
  const body = ci.phase === 'quiz' ? viewQuestion(ci) : ci.phase === 'done' ? viewDone(ctx) : viewReveal(ctx)
  const n = ctx.state.deckIndex % CARDS.length
  return `<h2 class="a-title">Check-in ${ofMonth()}</h2>
    ${body}
    <section class="a-deck" id="a-deck" aria-labelledby="a-deck-title" tabindex="-1">
      <h3 class="a-section" id="a-deck-title">${icon('cards')}À se poser ensemble</h3>
      <div class="a-deck-card"><p class="sr-only">Carte ${n + 1} sur ${CARDS.length}</p><p class="a-deck-q">« ${esc(CARDS[n])} »</p></div>
      <div class="a-btns a-btns-split">
        <button type="button" class="a-btn a-btn-ghost a-btn-small" data-act="deck-prev" data-fk="deck-prev">${icon('arrow-left')}Précédente</button>
        <button type="button" class="a-btn a-btn-small" data-act="deck-next" data-fk="deck-next">Suivante${icon('arrow-right')}</button>
      </div>
    </section>`
}

export const forms = {
  checkin: (ctx, form) => {
    const ci = ctx.state.checkin
    const q = QUESTIONS[ci.step]
    let v
    if (q.type === 'scale') v = Number(form.v.value)
    else {
      const checked = form.querySelector('input[name="v"]:checked')
      if (!checked) { const e = form.querySelector('[data-ci-error]'); e.hidden = false; form.querySelector('input[name="v"]').focus(); return }
      v = Number(checked.value)
    }
    ci.answers[q.id] = v
    if (ci.step < QUESTIONS.length - 1) ci.step += 1
    else ci.phase = 'done'
    ctx.commit(ci.phase === 'done' ? 'Check-in terminé. Tes réponses sont verrouillées.' : '')
    ctx.focus('[data-focus]')
  },
}

export const actions = {
  'ci-prev': (ctx) => { ctx.state.checkin.step -= 1; ctx.commit(); ctx.focus('[data-focus]') },
  'ci-edit': (ctx) => { Object.assign(ctx.state.checkin, { phase: 'quiz', step: 0 }); ctx.commit(); ctx.focus('[data-focus]') },
  'ci-reveal': (ctx) => { ctx.state.checkin.phase = 'reveal'; ctx.ui.revealing = true; ctx.commit('Réponses révélées, côte à côte.'); ctx.focus('[data-focus]') },
  'ci-restart': (ctx) => { ctx.state.checkin = { step: 0, answers: {}, phase: 'quiz', keepPrivate: false, talkDone: false }; ctx.commit(); ctx.focus('[data-focus]') },
  'ci-task': (ctx) => {
    const gap = mainGap(ctx.state.checkin.answers)
    if (!gap) return
    addTask(ctx, TALK[gap.id].task)
    ctx.state.checkin.talkDone = true
    ctx.commit('Tâche créée dans l’onglet Tâches. Elle reste personnelle tant que tu ne la proposes pas.')
    ctx.focus('[data-go="taches"]')
  },
  'deck-next': (ctx) => { ctx.state.deckIndex = (ctx.state.deckIndex + 1) % CARDS.length; ctx.commit(); ctx.focus('[data-fk="deck-next"]') },
  'deck-prev': (ctx) => { ctx.state.deckIndex = (ctx.state.deckIndex + CARDS.length - 1) % CARDS.length; ctx.commit(); ctx.focus('[data-fk="deck-prev"]') },
}

export const changes = {
  'ci-private': (ctx, el) => { ctx.state.checkin.keepPrivate = el.checked; ctx.commit(); ctx.focus('[data-change="ci-private"]') },
  // Affichage de la valeur du curseur, sans redessiner
  'ci-range': (_ctx, el) => { el.closest('form').querySelector('[data-range-out]').textContent = el.value },
}
