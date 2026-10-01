// Partage des frais : le Tricount de la contraception. Montants fictifs.
import { PARTNER, SPLITS, AMELI_URL, esc, icon, money, newId, monthName, balance, balanceText } from './data.js'

const payer = (by) => (by === 'alex' ? PARTNER : 'Toi')

function addForm(ctx) {
  const f = ctx.ui.expenseForm
  const err = f.errors || {}
  return `<form class="a-form" data-form="expense" novalidate>
    <h3 class="a-form-title" tabindex="-1" data-focus>Ajouter une dépense</h3>
    <div class="a-field">
      <label for="ef-label" class="a-label">Quoi ?</label>
      <input id="ef-label" name="label" type="text" maxlength="40" value="${esc(f.values.label)}" ${err.label ? 'aria-invalid="true" aria-describedby="ef-label-err"' : ''} />
      ${err.label ? `<p class="a-error" id="ef-label-err">${err.label}</p>` : ''}
    </div>
    <div class="a-field">
      <label for="ef-amount" class="a-label">Montant en euros</label>
      <input id="ef-amount" name="amount" type="text" inputmode="decimal" maxlength="8" value="${esc(f.values.amount)}" ${err.amount ? 'aria-invalid="true" aria-describedby="ef-amount-err"' : ''} />
      ${err.amount ? `<p class="a-error" id="ef-amount-err">${err.amount}</p>` : ''}
    </div>
    <fieldset class="a-choices a-choices-grid">
      <legend class="a-label">Qui a payé ?</legend>
      ${[['moi', 'Toi'], ['alex', PARTNER]].map(([k, l]) => `<label class="a-choice"><input type="radio" name="by" value="${k}" ${f.values.by === k ? 'checked' : ''} /><span>${l}</span></label>`).join('')}
    </fieldset>
    <div class="a-btns">
      <button type="submit" class="a-btn a-btn-primary">Ajouter</button>
      <button type="button" class="a-btn a-btn-ghost" data-act="expense-cancel">Annuler</button>
    </div>
  </form>`
}

export function view(ctx) {
  const { state, ui } = ctx
  const { owed, paidMe, paidAlex } = balance(state)
  const month = monthName()
  const sharingNote = !state.duo ? 'Invite ton ou ta partenaire (onglet Moi) pour partager les frais.'
    : state.pause ? `Partage en pause : ${PARTNER} ne voit pas ces dépenses.`
      : !state.sharing.frais ? `Le partage des frais est désactivé dans Moi : ${PARTNER} ne voit pas ces dépenses.` : ''
  const rows = state.expenses.map((e) => e.kind === 'remboursement'
    ? `<li class="a-exp a-exp-refund"><span>Remboursement · ${payer(e.by)} ${icon('arrow-right')} ${e.by === 'alex' ? 'Toi' : PARTNER}</span><span>${money(e.amount)}</span></li>`
    : `<li class="a-exp"><span>${esc(e.label)} · ${payer(e.by)}</span><span>${money(e.amount)}</span></li>`).join('')
  return `<h2 class="a-title" tabindex="-1" data-focus>Frais</h2>
    ${sharingNote ? `<p class="a-note">${sharingNote}</p>` : ''}
    ${ui.expenseForm ? addForm(ctx) : ''}
    <section class="a-box" aria-labelledby="a-month">
      <h3 class="a-box-title" id="a-month">${month.charAt(0).toUpperCase() + month.slice(1)}</h3>
      <p class="a-row"><span>Toi</span><span>${money(paidMe)}</span></p>
      <p class="a-row"><span>${PARTNER}</span><span>${money(paidAlex)}</span></p>
      ${state.duo ? `<p><span class="a-pill ${owed ? 'a-pill-ok' : ''}">${balanceText(owed)}</span></p>` : ''}
    </section>
    <ul class="a-exps" aria-label="Dépenses du mois">${rows}</ul>
    <p class="a-muted">Montants fictifs.</p>
    ${state.duo ? `<fieldset class="a-choices">
      <legend class="a-label">Répartition</legend>
      ${SPLITS.map(([k, l]) => `<label class="a-choice"><input type="radio" name="split" value="${k}" ${state.split === k ? 'checked' : ''} data-change="split" /><span>${l}</span></label>`).join('')}
      ${state.split === 'pourcentage' ? `<div class="a-field a-field-inline"><label for="ef-pct" class="a-label">Ta part</label><input id="ef-pct" type="number" min="0" max="100" step="5" value="${state.myPercent}" data-change="percent" /><span>% · ${PARTNER} : ${100 - state.myPercent} %</span></div>` : ''}
    </fieldset>` : ''}
    ${ui.expenseForm ? '' : `<button type="button" class="a-btn a-btn-primary a-btn-block" data-act="expense-new" data-fk="expense-new">${icon('plus')}Ajouter une dépense</button>`}
    ${state.duo ? `<button type="button" class="a-btn a-btn-ghost a-btn-block" data-act="expense-settle" data-fk="expense-settle" ${owed ? '' : 'disabled'}>Marquer comme remboursé</button>` : ''}
    <div class="a-box a-info">
      <p>${icon('info')}Moins de 26 ans : certains contraceptifs et consultations sont pris en charge à 100 %.</p>
      <a href="${AMELI_URL}" target="_blank" rel="noopener">Ameli${icon('arrow-square-out')}<span class="sr-only"> (nouvel onglet)</span></a>
    </div>`
}

export function openForm(ctx) {
  ctx.ui.expenseForm = { values: { label: '', amount: '', by: 'moi' } }
}

export const actions = {
  'expense-new': (ctx) => { openForm(ctx); ctx.render(); ctx.focus('#ef-label') },
  'expense-cancel': (ctx) => { ctx.ui.expenseForm = null; ctx.render(); ctx.focus('[data-fk="expense-new"]') },
  'expense-settle': (ctx) => {
    const { owed } = balance(ctx.state)
    if (!owed) return
    ctx.state.expenses.push({ id: newId(), label: 'Remboursement', amount: Math.abs(owed), by: owed > 0 ? 'alex' : 'moi', kind: 'remboursement' })
    ctx.commit(owed > 0 ? `Remboursement noté : ${PARTNER} t’a remboursé ${money(owed)}.` : `Remboursement noté : tu as remboursé ${money(-owed)} à ${PARTNER}.`)
    ctx.focus('[data-fk="expense-new"]')
  },
}

export const changes = {
  split: (ctx, el) => { ctx.state.split = el.value; ctx.commit(`Répartition : ${SPLITS.find(([k]) => k === el.value)[1]}. Solde recalculé.`) },
  percent: (ctx, el) => {
    const p = Math.min(100, Math.max(0, Math.round(Number(el.value) || 0)))
    ctx.state.myPercent = p
    ctx.commit(`Ta part : ${p} %. Solde recalculé.`)
    ctx.focus('#ef-pct')
  },
}

export const forms = {
  expense: (ctx, form) => {
    const f = ctx.ui.expenseForm
    f.values = { label: form.label.value, amount: form.amount.value, by: form.querySelector('input[name="by"]:checked')?.value || 'moi' }
    const cents = Math.round(Number(f.values.amount.replace(',', '.').replace(/[^\d.]/g, '')) * 100)
    const errors = {}
    if (f.values.label.trim().length < 2) errors.label = 'Indique ce qui a été acheté.'
    if (!cents || cents <= 0 || cents > 100000) errors.amount = 'Indique un montant, par exemple 4,50.'
    if (Object.keys(errors).length) { f.errors = errors; ctx.render(); ctx.focus(errors.label ? '#ef-label' : '#ef-amount'); return }
    ctx.state.expenses.push({ id: newId(), label: f.values.label.trim(), amount: cents, by: f.values.by, kind: 'achat' })
    ctx.ui.expenseForm = null
    ctx.commit(`Dépense ajoutée : ${money(cents)}. Solde recalculé.`)
    ctx.focus('[data-fk="expense-new"]')
  },
}
