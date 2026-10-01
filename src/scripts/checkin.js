// Mini-démos « communication du duo » : check-in mensuel et question sensible.
// Mécanique : je réponds d'abord, puis je découvre les réponses d'Alex (simulées), côte à côte.
// Rien n'est envoyé ni enregistré.

const PARTNER = 'Alex'

// axis : réponse située sur un axe commun Toi ↔ Alex. scale : échelle personnelle. choice : choix unique.
const QUESTIONS = [
  {
    id: 'qui', type: 'axis',
    q: 'Ce mois-ci, qui a le plus pensé à la contraception ?',
    options: ['Surtout moi', 'Plutôt moi', 'Autant l’un·e que l’autre', 'Plutôt l’autre', 'Surtout l’autre'],
    // Position commune (-2 = toi, +2 = Alex) perçue par Alex, selon ta réponse : Alex voit souvent plus d'équilibre.
    partnerAxis: { '-2': 0, '-1': 0, 0: 1, 1: 1, 2: 2 },
  },
  {
    id: 'charge', type: 'scale',
    q: 'Ta charge mentale liée à la contraception, ce mois-ci',
    options: ['Très légère', 'Légère', 'Moyenne', 'Lourde', 'Très lourde'],
    partner: [1, 1, 2, 1, 1],
  },
  {
    id: 'argent', type: 'scale',
    q: 'La façon dont vous partagez les frais, ça te va ?',
    options: ['Pas du tout', 'Plutôt non', 'Plutôt oui', 'Carrément'],
    partner: [2, 2, 2, 3],
  },
  {
    id: 'aide', type: 'choice',
    q: 'Le mois prochain, ce qui t’aiderait le plus',
    options: ['Que l’autre gère la pharmacie', 'Qu’on partage mieux les frais', 'Qu’on en parle plus souvent', 'Rien, ça roule'],
    partner: [2, 2, 3, 3],
  },
]

const TALK = {
  qui: 'Qu’est-ce que l’un·e de vous pourrait prendre en charge en entier le mois prochain, sans attendre qu’on lui demande ?',
  charge: 'Qu’est-ce qui pèse le plus dans ta charge en ce moment, et qu’est-ce qui t’allègerait vraiment ?',
  argent: 'Comment vous voulez vous répartir les frais ? Équitable, ce n’est pas forcément moitié-moitié.',
}

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])
const icon = (id) => `<svg class="i" aria-hidden="true"><use href="#${id}"/></svg>`

/* ---------- Check-in mensuel ---------- */
export function initCheckin(root) {
  const state = { step: 0, answers: {}, phase: 'quiz', keepPrivate: false }

  function focusHeading() {
    root.querySelector('[data-focus]')?.focus({ preventScroll: true })
  }

  function render(focus = true) {
    if (state.phase === 'quiz') root.innerHTML = viewQuestion()
    else if (state.phase === 'done') root.innerHTML = viewDone()
    else root.innerHTML = viewReveal()
    if (focus) focusHeading()
  }

  function viewQuestion() {
    const q = QUESTIONS[state.step]
    const val = state.answers[q.id]
    const dots = QUESTIONS.map((_, i) => `<span class="ci-dot ${i < state.step ? 'is-done' : ''} ${i === state.step ? 'is-current' : ''}"></span>`).join('')
    return `<div class="ci-head"><p class="ci-label">Check-in du mois</p><p class="ci-progress" aria-label="Question ${state.step + 1} sur ${QUESTIONS.length}">${dots}<span>${state.step + 1}/${QUESTIONS.length}</span></p></div>
      <form class="ci-form" data-ci-form>
        <fieldset>
          <legend class="ci-q" tabindex="-1" data-focus>${q.q}</legend>
          <div class="ci-options ${q.type === 'choice' ? 'ci-options-grid' : ''}">
            ${q.options.map((o, i) => `<label class="ci-opt"><input type="radio" name="ci" value="${i}" ${val === i ? 'checked' : ''} /><span class="ci-opt-mark" aria-hidden="true"></span><span>${esc(o)}</span></label>`).join('')}
          </div>
        </fieldset>
        <div class="ci-nav">
          ${state.step > 0 ? `<button type="button" class="btn btn-ghost btn-sm" data-ci="prev">${icon('i-back')}Retour</button>` : '<span></span>'}
          <button type="submit" class="btn btn-primary btn-sm" ${val === undefined ? 'disabled' : ''} data-ci-next>${state.step === QUESTIONS.length - 1 ? 'Terminer' : 'Suivant'} ${icon('i-arrow')}</button>
        </div>
      </form>`
  }

  function viewDone() {
    return `<div class="ci-head"><p class="ci-label">Check-in du mois</p><p class="ci-progress"><span>4/4</span></p></div>
      <h3 class="ci-q" tabindex="-1" data-focus>C’est fait. ${PARTNER} a aussi répondu.</h3>
      <p class="ci-text">Les réponses ne s’affichent que si vous êtes d’accord tous les deux pour comparer. ${PARTNER} est ok (simulé). Et toi&nbsp;?</p>
      <label class="check ci-check"><input type="checkbox" ${state.keepPrivate ? 'checked' : ''} data-ci-private />Ce mois-ci, je garde mes réponses pour moi</label>
      ${state.keepPrivate
        ? `<p class="ci-note">OK. Rien n’est partagé. Et tu ne vois pas non plus les réponses d’${PARTNER}&nbsp;: c’est donnant-donnant.</p>`
        : ''}
      <div class="ci-nav">
        <button type="button" class="btn btn-ghost btn-sm" data-ci="edit">${icon('i-back')}Modifier</button>
        <button type="button" class="btn btn-primary btn-sm" data-ci="reveal" ${state.keepPrivate ? 'disabled' : ''}>Découvrir nos réponses ${icon('i-arrow')}</button>
      </div>`
  }

  function partnerAnswer(q) {
    const mine = state.answers[q.id]
    if (q.type === 'axis') {
      const xAlex = q.partnerAxis[mine - 2]
      return { x: xAlex, label: q.options[2 - xAlex] } // côté Alex, « moi » = Alex
    }
    return { i: q.partner[mine], label: q.options[q.partner[mine]] }
  }

  function gapBadge(gap, same = 'Même ressenti') {
    if (gap === 0) return `<span class="ci-badge ci-badge-ok">${icon('i-check')}${same}</span>`
    if (gap === 1) return '<span class="ci-badge ci-badge-mid">Petit écart</span>'
    return `<span class="ci-badge ci-badge-gap">Écart de ${gap} crans</span>`
  }

  function viewReveal() {
    const gaps = {}
    const rows = QUESTIONS.map((q, n) => {
      const mine = state.answers[q.id]
      const p = partnerAnswer(q)
      let visual
      let badge
      if (q.type === 'axis') {
        const xMe = mine - 2
        const gap = Math.abs(xMe - p.x)
        gaps[q.id] = gap
        badge = gapBadge(gap, 'Vous voyez pareil')
        const pos = (x) => `${((x + 2) / 4) * 100}%`
        visual = `<div class="ci-axis" role="img" aria-label="Pour toi : ${esc(q.options[mine])}. Pour ${PARTNER} : ${esc(p.label)}.">
            <div class="ci-axis-track"><span class="ci-axis-mid"></span>
              <span class="ci-marker ci-marker-a" style="--x:${pos(xMe)}">Toi</span>
              <span class="ci-marker ci-marker-b" style="--x:${pos(p.x)}">${PARTNER}</span>
            </div>
            <div class="ci-axis-labels" aria-hidden="true"><span>Surtout toi</span><span>Équilibré</span><span>Surtout ${PARTNER}</span></div>
          </div>
          <p class="ci-says"><span class="who who-a">Toi</span>${esc(q.options[mine])}</p>
          <p class="ci-says"><span class="who who-b">${PARTNER}</span>${esc(p.label)}</p>`
      } else if (q.type === 'scale') {
        const max = q.options.length - 1
        const gap = Math.abs(mine - p.i)
        gaps[q.id] = gap
        badge = gapBadge(gap)
        visual = `<div class="ci-bars">
            <div class="ci-bar-row"><span class="who who-a">Toi</span><span class="ci-bar"><b class="ci-fill-a" style="--w:${((mine + 1) / (max + 1)) * 100}%"></b></span><span class="ci-bar-val">${esc(q.options[mine])}</span></div>
            <div class="ci-bar-row"><span class="who who-b">${PARTNER}</span><span class="ci-bar"><b class="ci-fill-b" style="--w:${((p.i + 1) / (max + 1)) * 100}%"></b></span><span class="ci-bar-val">${esc(p.label)}</span></div>
          </div>`
        if (q.id === 'charge') visual += '<p class="ci-hint">Normal que vos charges diffèrent&nbsp;: ce qui compte, c’est si la répartition te convient.</p>'
      } else {
        const same = mine === p.i
        badge = same ? `<span class="ci-badge ci-badge-ok">${icon('i-check')}Même envie</span>` : '<span class="ci-badge ci-badge-mid">Envies différentes</span>'
        visual = `<div class="ci-choices"><p class="ci-choice ci-choice-a"><span class="who who-a">Toi</span>${esc(q.options[mine])}</p><p class="ci-choice ci-choice-b"><span class="who who-b">${PARTNER}</span>${esc(p.label)}</p></div>`
      }
      return `<li class="ci-row" style="--d:${n * 90}ms"><div class="ci-row-head"><p class="ci-row-q">${q.q}</p>${badge}</div>${visual}</li>`
    }).join('')

    const top = Object.entries(gaps).filter(([, g]) => g >= 2).sort((a, b) => b[1] - a[1])[0]
    const summary = top
      ? `<div class="ci-talk"><p class="ci-talk-label">${icon('i-cards')}Carte à se poser ensemble</p><p class="ci-talk-q">${TALK[top[0]]}</p></div>`
      : `<div class="ci-talk ci-talk-ok"><p class="ci-talk-label">${icon('i-check')}Plutôt aligné·es ce mois-ci</p><p class="ci-talk-q">Pas de gros écart. Gardez le rythme&nbsp;!</p></div>`

    return `<div class="ci-head"><p class="ci-label">Check-in du mois</p></div>
      <h3 class="ci-q" tabindex="-1" data-focus>Vos réponses, côte à côte</h3>
      <ul class="ci-rows">${rows}</ul>
      ${summary}
      <p class="ci-note">Pas de score, pas de gagnant&nbsp;: c’est juste un point de départ pour en parler. Réponses d’${PARTNER} simulées.</p>
      <div class="ci-nav"><span></span><button type="button" class="btn btn-ghost btn-sm" data-ci="restart">${icon('i-undo')}Recommencer</button></div>`
  }

  root.addEventListener('change', (e) => {
    if (e.target.name === 'ci') {
      state.answers[QUESTIONS[state.step].id] = Number(e.target.value)
      root.querySelector('[data-ci-next]').disabled = false
    }
    if (e.target.matches('[data-ci-private]')) {
      state.keepPrivate = e.target.checked
      render(false)
      root.querySelector('[data-ci-private]').focus()
    }
  })
  root.addEventListener('submit', (e) => {
    e.preventDefault()
    if (state.answers[QUESTIONS[state.step].id] === undefined) return
    if (state.step < QUESTIONS.length - 1) state.step++
    else state.phase = 'done'
    render()
  })
  root.addEventListener('click', (e) => {
    const act = e.target.closest('[data-ci]')?.dataset.ci
    if (!act) return
    if (act === 'prev') state.step--
    if (act === 'edit') { state.phase = 'quiz'; state.step = 0 }
    if (act === 'reveal') state.phase = 'reveal'
    if (act === 'restart') Object.assign(state, { step: 0, answers: {}, phase: 'quiz', keepPrivate: false })
    render()
  })
  render(false)
}

/* ---------- Question sensible (aperçu) ---------- */
const SENSITIVE = {
  q: 'Pour la suite, qu’est-ce que tu serais partant·e pour essayer ?',
  options: [
    'Gérer la pharmacie',
    'Venir au prochain RDV, si l’autre le souhaite',
    'Payer la moitié des frais',
    'Me renseigner sur les options masculines',
    'Faire un dépistage IST ensemble',
  ],
  skip: 'Je préfère ne pas répondre pour l’instant',
  partner: [0, 3, 4],
}

export function initSensitive(root) {
  const state = { picked: new Set(), skip: false, phase: 'ask' }

  function render(focus = true) {
    root.innerHTML = state.phase === 'ask' ? viewAsk() : state.phase === 'wait' ? viewWait() : viewReveal()
    if (focus) root.querySelector('[data-focus]')?.focus({ preventScroll: true })
  }

  function viewAsk() {
    const can = state.skip || state.picked.size > 0
    return `<div class="ci-head"><p class="ci-label">Question sensible · aperçu</p><span class="ci-badge ci-badge-soft">${icon('i-eye-off')}Réponses cachées</span></div>
      <form data-s-form>
        <fieldset>
          <legend class="ci-q" tabindex="-1" data-focus>${SENSITIVE.q}</legend>
          <p class="ci-text">Plusieurs choix possibles. ${PARTNER} ne voit rien avant d’avoir répondu aussi.</p>
          <div class="ci-options">
            ${SENSITIVE.options.map((o, i) => `<label class="ci-opt ci-opt-multi"><input type="checkbox" value="${i}" ${state.picked.has(i) ? 'checked' : ''} ${state.skip ? 'disabled' : ''} /><span class="ci-opt-mark" aria-hidden="true"></span><span>${esc(o)}</span></label>`).join('')}
            <label class="ci-opt ci-opt-multi ci-opt-skip"><input type="checkbox" value="skip" ${state.skip ? 'checked' : ''} /><span class="ci-opt-mark" aria-hidden="true"></span><span>${SENSITIVE.skip}</span></label>
          </div>
        </fieldset>
        <div class="ci-nav"><span></span><button type="submit" class="btn btn-primary btn-sm" ${can ? '' : 'disabled'}>Valider ${icon('i-arrow')}</button></div>
      </form>`
  }

  function viewWait() {
    return `<div class="ci-head"><p class="ci-label">Question sensible · aperçu</p></div>
      <h3 class="ci-q" tabindex="-1" data-focus>${state.skip ? 'Pas de souci.' : 'Réponses enregistrées.'}</h3>
      ${state.skip
        ? `<p class="ci-text">Tu préfères ne pas répondre pour l’instant&nbsp;: ${PARTNER} ne voit rien, et tu ne vois pas ses réponses. Tu pourras y revenir quand tu veux.</p>
           <div class="ci-nav"><span></span><button type="button" class="btn btn-ghost btn-sm" data-s="restart">${icon('i-undo')}Revenir à la question</button></div>`
        : `<p class="ci-text">${PARTNER} a répondu aussi (simulé). On découvre en même temps&nbsp;?</p>
           <div class="ci-nav"><button type="button" class="btn btn-ghost btn-sm" data-s="restart">${icon('i-back')}Modifier</button><button type="button" class="btn btn-primary btn-sm" data-s="reveal">Découvrir ${icon('i-arrow')}</button></div>`}`
  }

  function viewReveal() {
    const mine = [...state.picked]
    const theirs = SENSITIVE.partner
    const both = mine.filter((i) => theirs.includes(i))
    const onlyMe = mine.filter((i) => !theirs.includes(i))
    const onlyThem = theirs.filter((i) => !mine.includes(i))
    const list = (items, cls) => items.length ? `<ul class="s-list">${items.map((i) => `<li class="s-chip ${cls}">${esc(SENSITIVE.options[i])}</li>`).join('')}</ul>` : '<p class="ci-hint">Rien ici.</p>'
    return `<div class="ci-head"><p class="ci-label">Question sensible · aperçu</p></div>
      <h3 class="ci-q" tabindex="-1" data-focus>Ce que vous êtes partant·es pour essayer</h3>
      <div class="s-group s-group-both"><p class="s-title">${icon('i-check')}Tous les deux</p>${list(both, 's-chip-both')}</div>
      <div class="s-cols">
        <div class="s-group"><p class="s-title"><span class="who who-a">Toi</span>seulement</p>${list(onlyMe, 's-chip-a')}</div>
        <div class="s-group"><p class="s-title"><span class="who who-b">${PARTNER}</span>seulement</p>${list(onlyThem, 's-chip-b')}</div>
      </div>
      <p class="ci-note">Rien n’est engagé. Commence par ce qui vous réunit${both.length ? '' : '&nbsp;: ici, rien encore, et c’est ok'}. Réponses d’${PARTNER} simulées. La version complète (vote anonyme, révélation simultanée) est une idée pour la V2.</p>
      <div class="ci-nav"><span></span><button type="button" class="btn btn-ghost btn-sm" data-s="restart">${icon('i-undo')}Recommencer</button></div>`
  }

  root.addEventListener('change', (e) => {
    const t = e.target
    if (t.type !== 'checkbox') return
    if (t.value === 'skip') { state.skip = t.checked; if (t.checked) state.picked.clear() }
    else t.checked ? state.picked.add(Number(t.value)) : state.picked.delete(Number(t.value))
    const value = t.value
    render(false)
    root.querySelector(`input[value="${value}"]`)?.focus()
  })
  root.addEventListener('submit', (e) => { e.preventDefault(); state.phase = 'wait'; render() })
  root.addEventListener('click', (e) => {
    const act = e.target.closest('[data-s]')?.dataset.s
    if (!act) return
    if (act === 'reveal') state.phase = 'reveal'
    if (act === 'restart') { state.phase = 'ask'; if (state.skip) state.skip = false }
    render()
  })
  render(false)
}
