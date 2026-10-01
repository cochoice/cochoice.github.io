// Démarrage : 4 écrans courts, joués au premier lancement.
import { PARTNER, DUO_CODE, WHO_USES, esc, icon } from './data.js'

const stepLabel = (n) => `<p class="a-step">Étape ${n} sur 4</p>`

export function view({ state, ui }) {
  const err = ui.error || ''
  switch (state.step) {
    case 1:
      return `<div class="a-onb a-onb-welcome">
        <img src="/logos/cochoice-logo.svg" alt="CoChoice" width="183" height="32" class="a-onb-logo" />
        <h2 class="a-onb-title" tabindex="-1" data-focus>La contraception, ça se pense à deux.</h2>
        <button type="button" class="a-btn a-btn-primary" data-act="onb-next" data-fk="onb-start">Commencer</button>
        <p class="a-muted">Tu peux tout faire seul·e. Le duo, c’est quand tu veux.</p>
      </div>`
    case 2:
      return `<form class="a-onb" data-form="onb-profil" novalidate>
        ${stepLabel(2)}
        <h2 class="a-onb-title" tabindex="-1" data-focus>Ton pseudo</h2>
        <div class="a-field">
          <label for="onb-pseudo" class="sr-only">Ton pseudo</label>
          <input id="onb-pseudo" name="pseudo" type="text" maxlength="24" autocomplete="off" value="${esc(state.pseudo)}" ${err ? 'aria-invalid="true" aria-describedby="onb-pseudo-err"' : ''} />
          ${err ? `<p class="a-error" id="onb-pseudo-err">${esc(err)}</p>` : ''}
        </div>
        <fieldset class="a-choices">
          <legend>Dans votre duo, qui utilise une contraception aujourd’hui ?</legend>
          ${WHO_USES.map((w, i) => `<label class="a-choice"><input type="radio" name="who" value="${i}" ${state.whoUses === w ? 'checked' : ''} /><span>${esc(w)}</span></label>`).join('')}
        </fieldset>
        <button type="submit" class="a-btn a-btn-primary">Continuer</button>
      </form>`
    case 3:
      return `<form class="a-onb" data-form="onb-atelier" novalidate>
        ${stepLabel(3)}
        <h2 class="a-onb-title" tabindex="-1" data-focus>Tu viens d’un atelier ?</h2>
        <p>Entre le code donné en fin de séance. Ça nous aide à savoir si les ateliers servent.</p>
        <div class="a-field">
          <label for="onb-code" class="sr-only">Code atelier (facultatif)</label>
          <input id="onb-code" name="code" type="text" maxlength="16" autocomplete="off" placeholder="CAMPUS-2610" value="${esc(state.atelier)}" class="a-input-code" />
        </div>
        <button type="submit" class="a-btn a-btn-primary">Continuer</button>
        <button type="button" class="a-btn a-btn-ghost" data-act="onb-nocode">Je n’ai pas de code</button>
      </form>`
    case 4:
      return `<div class="a-onb">
        ${stepLabel(4)}
        <h2 class="a-onb-title" tabindex="-1" data-focus>Inviter ton ou ta partenaire</h2>
        <div class="a-box a-duo-code">
          <p class="a-box-title">Ton code duo</p>
          <p class="a-code" aria-label="${DUO_CODE.split('').join(' ')}">${DUO_CODE.slice(0, 3)} ${DUO_CODE.slice(3)}</p>
          ${icon('qr-code', 'a-qr')}
          <p class="a-muted">À envoyer ou à faire scanner.</p>
        </div>
        <button type="button" class="a-btn a-btn-primary" data-act="onb-invite" data-fk="onb-invite">Envoyer l’invitation</button>
        <button type="button" class="a-btn a-btn-ghost" data-act="onb-later">Plus tard</button>
      </div>`
    default:
      return `<div class="a-onb a-onb-welcome">
        <span class="a-joined" aria-hidden="true">${icon('users-three')}</span>
        <h2 class="a-onb-title" tabindex="-1" data-focus>${PARTNER} a rejoint ton duo</h2>
        <p>Vous pouvez maintenant vous répartir les tâches, partager les frais et faire le check-in du mois. C’est toi qui choisis ce qui est partagé.</p>
        <button type="button" class="a-btn a-btn-primary" data-act="onb-finish" data-fk="onb-finish">C’est parti</button>
      </div>`
  }
}

export const actions = {
  'onb-next': (ctx) => step(ctx, 2),
  'onb-nocode': (ctx) => { ctx.state.atelier = ''; step(ctx, 4) },
  'onb-invite': (ctx) => { ctx.state.duo = true; step(ctx, 5) },
  'onb-later': (ctx) => { ctx.state.duo = false; finish(ctx, 'Tu peux inviter ton ou ta partenaire plus tard, depuis l’onglet Moi.') },
  'onb-finish': (ctx) => finish(ctx),
}

export const forms = {
  'onb-profil': (ctx, form) => {
    const pseudo = form.pseudo.value.trim()
    if (pseudo.length < 2) { ctx.ui.error = 'Choisis un pseudo d’au moins 2 caractères.'; ctx.render(); ctx.focus('#onb-pseudo'); return }
    const who = form.querySelector('input[name="who"]:checked')
    Object.assign(ctx.state, { pseudo, whoUses: who ? WHO_USES[Number(who.value)] : '' })
    step(ctx, 3)
  },
  'onb-atelier': (ctx, form) => {
    ctx.state.atelier = form.code.value.trim().toUpperCase()
    step(ctx, 4)
  },
}

function step(ctx, n) {
  ctx.state.step = n
  ctx.commit()
  ctx.focus('[data-focus]')
}

function finish(ctx, msg) {
  Object.assign(ctx.state, { onboarded: true, tab: 'accueil' })
  ctx.commit(msg)
  ctx.focus('[data-focus]')
}
