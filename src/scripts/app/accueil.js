// Accueil : le mois en 5 cartes, chacune ouvre son onglet.
import { PARTNER, CARDS, esc, icon, money, monthName, ofMonth, fmtDue, ownerName, balance } from './data.js'

// Solde mis en avant : une phrase courte et le montant en grand
function amount(state, owed) {
  if (!state.duo) return '<span class="a-amount-label">Tu utilises CoChoice seul·e</span>'
  if (!owed) return '<span class="a-amount">Vous êtes quittes</span>'
  return `<span class="a-amount-label">${owed > 0 ? `${PARTNER} te doit` : `Tu dois à ${PARTNER}`}</span><span class="a-amount">${money(Math.abs(owed))}</span>`
}

// Prochaine tâche : la plus proche avec une échéance, sinon la première en cours
export function nextTask(state) {
  const open = state.tasks.filter((t) => !['faite', 'refusee'].includes(t.status))
  return open.filter((t) => t.due).sort((a, b) => a.due.localeCompare(b.due))[0] || open[0]
}

export function view({ state }) {
  const t = nextTask(state)
  const { owed } = balance(state)
  const ci = state.checkin.phase === 'quiz' ? '<span class="a-pill a-pill-no">Dans 3 jours</span>' : '<span class="a-pill a-pill-ok">Fait</span>'
  const card = CARDS[state.cardIndex % CARDS.length]
  return `<h2 class="a-title" tabindex="-1" data-focus>Salut ${esc(state.pseudo)}</h2>
    <p class="a-sub">${state.duo ? `Ton duo avec ${PARTNER}` : 'Pas encore de duo'} · ${monthName()}</p>
    ${state.pause ? `<p class="a-note a-note-pause">${icon('pause')}Partage en pause : ${PARTNER} ne voit plus rien.</p>` : ''}
    <div class="a-stack">
      <button type="button" class="a-card" data-go="taches" data-fk="home-taches">
        <span class="a-row"><b>À faire bientôt</b>${t ? `<span class="a-pill">${ownerName(t.owner)}</span>` : ''}</span>
        <span>${t ? `${esc(t.title)}${t.due ? ` · ${fmtDue(t.due)}` : ''}` : 'Rien de prévu. Propose une tâche.'}</span>
      </button>
      <button type="button" class="a-card" data-go="frais" data-fk="home-frais">
        <b>Frais du mois</b>
        ${amount(state, owed)}
      </button>
      <button type="button" class="a-card a-card-dark" data-go="checkin" data-fk="home-checkin">
        <span class="a-row"><b>Check-in ${ofMonth()}</b>${ci}</span>
      </button>
      <button type="button" class="a-card a-card-soft" data-go="checkin" data-target="#a-deck" data-fk="home-card">
        <b>À se poser ensemble</b>
        <span>« ${esc(card)} »</span>
      </button>
      <div class="a-card a-card-box">
        <span class="a-row"><b>${icon('package')}La box CoChoice</b><span class="a-pill">Prochainement</span></span>
        <span>Bientôt : une charge mentale en moins. Une box « double protection » livrée par des pharmacies partenaires, avec une carte « tâche du mois ».</span>
        <button type="button" class="a-btn a-btn-small" data-act="feedback" data-fk="home-box">${icon('bell')}Me prévenir</button>
      </div>
    </div>`
}
