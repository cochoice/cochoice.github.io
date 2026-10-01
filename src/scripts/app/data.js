// Prototype de l'appli CoChoice : textes, données fictives et utilitaires.
// Source : docs/brief-appli-mvp.html. Tout est fictif, rien n'est envoyé.

export const PARTNER = 'Alex'
export const DEFAULT_PSEUDO = 'Sam'
export const DUO_CODE = 'K74P2Q'

/* ---------- Utilitaires ---------- */
export const esc = (s = '') => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])
export const icon = (id, cls = 'i') => `<svg class="${cls}" aria-hidden="true" focusable="false"><use href="#i-${id}"/></svg>`
export const money = (cents) => (cents / 100).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })

let uid = 0
export const newId = () => `x${Date.now().toString(36)}${(uid++).toString(36)}`

const toIso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const fromIso = (iso) => { const [y, m, d] = iso.split('-').map(Number); return new Date(y, m - 1, d) }
const startOfToday = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d }
export const todayIso = () => toIso(new Date())
export const monthName = () => new Date().toLocaleDateString('fr-FR', { month: 'long' })
// « d'octobre », « de novembre »
export const ofMonth = () => (/^[aeiouyh]/i.test(monthName()) ? `d’${monthName()}` : `de ${monthName()}`)

// Prochain jeudi (au moins 2 jours plus tard)
function nextThursday() {
  const d = startOfToday()
  d.setDate(d.getDate() + 2)
  while (d.getDay() !== 4) d.setDate(d.getDate() + 1)
  return toIso(d)
}
// Le 30 du mois en cours (ou du mois suivant s'il est passé)
function thirtieth() {
  const t = startOfToday()
  const d = new Date(t.getFullYear(), t.getMonth(), 30)
  if (d < t) d.setMonth(d.getMonth() + 1)
  return toIso(d)
}

// « avant jeudi » sous 7 jours, sinon « avant le 30/10 »
export function fmtDue(iso) {
  if (!iso) return ''
  const d = fromIso(iso)
  const days = Math.round((d - startOfToday()) / 86400000)
  if (days < 0) return `échue le ${d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}`
  if (days === 0) return 'aujourd’hui'
  if (days < 7) return `avant ${d.toLocaleDateString('fr-FR', { weekday: 'long' })}`
  return `avant le ${d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}`
}
export const fmtDay = (iso) => fromIso(iso).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })

/* ---------- Démarrage ---------- */
export const WHO_USES = ['Moi', 'Mon ou ma partenaire', 'Nous deux', 'On cherche encore', 'Je préfère ne pas le dire']

/* ---------- Tâches ---------- */
export const FAMILIES = {
  information: { label: 'Information', icon: 'book-open' },
  anticipation: { label: 'Anticipation', icon: 'calendar-blank' },
  demarches: { label: 'Démarches', icon: 'path' },
  frais: { label: 'Frais', icon: 'receipt' },
}
export const SUGGESTIONS = [
  { title: 'Passer à la pharmacie', family: 'anticipation' },
  { title: 'Renouveler l’ordonnance', family: 'demarches' },
  { title: 'Prendre un RDV', family: 'demarches' },
  { title: 'Faire un dépistage IST à deux', family: 'demarches' },
  { title: 'Avancer les frais', family: 'frais' },
]
export const STATUS = {
  perso: { label: 'Personnelle', cls: 'perso' },
  attente: { label: 'En attente', cls: 'wait' },
  acceptee: { label: 'Acceptée', cls: 'ok' },
  discussion: { label: 'À discuter', cls: 'talk' },
  refusee: { label: 'Refusée', cls: 'no' },
  faite: { label: 'Faite', cls: 'done' },
}
// Qui s'en occupe (formulaire)
export const OWNERS = [
  ['perso', 'Moi, sans rien partager'],
  ['moi', 'Je propose de m’en occuper'],
  ['alex', `Je propose à ${PARTNER} de s’en occuper`],
  ['deux', 'Nous deux'],
]
export const ownerName = (o) => ({ moi: 'Toi', alex: PARTNER, deux: 'Vous deux' })[o] || 'Toi'

/* ---------- Frais ---------- */
export const SPLITS = [
  ['moitie', '50 / 50'],
  ['pourcentage', 'En pourcentage'],
  ['chacun', 'Chacun·e paie ses achats'],
]
export const AMELI_URL = 'https://www.ameli.fr/assure/remboursements/rembourse/contraception-ivg/contraception'
export const SSE_URL = 'https://www.etudiant.gouv.fr/fr/les-services-de-sante-etudiante-sse-mode-d-emploi-3050'

/* ---------- Check-in ---------- */
const WHO = ['Surtout moi', 'Équilibré', 'Surtout mon ou ma partenaire']
// axis : réponse « qui » (position commune : -1 = toi, 0 = équilibré, +1 = Alex). scale : 0 à 10. choice : choix unique.
export const QUESTIONS = [
  { id: 'anticipation', type: 'axis', short: 'Qui a anticipé ?', q: 'Ce mois-ci, qui a pensé à anticiper (réapprovisionnement, renouvellement) ?', options: WHO },
  { id: 'demarches', type: 'axis', short: 'Qui s’est occupé des démarches ?', q: 'Qui s’est occupé des démarches (RDV, pharmacie, dépistage) ?', options: WHO },
  { id: 'frais', type: 'axis', short: 'Qui a avancé les frais ?', q: 'Qui a avancé les frais ?', options: WHO },
  { id: 'charge', type: 'scale', short: 'Charge ressentie (0 à 10)', q: 'Ta charge ressentie liée à la contraception, de 0 à 10.', min: 0, max: 10 },
  { id: 'aide', type: 'choice', short: 'Ce qui aiderait le plus', q: 'Le mois prochain, ce qui t’aiderait le plus ?', options: ['Qu’on en parle', 'Que tu prennes une tâche en entier', 'Qu’on revoie les frais', 'Rien, ça me va'] },
]
// Réponses d'Alex, déjà données et cachées jusqu'à la révélation (index d'option, ou valeur pour l'échelle)
export const ALEX_ANSWERS = { anticipation: 1, demarches: 1, frais: 1, charge: 4, aide: 0 }
// Position commune d'une réponse « qui » : pour toi « Surtout moi » = toi ; pour Alex « Surtout moi » = Alex
export const axisPos = (i, who) => (who === 'moi' ? i - 1 : 1 - i)

// Carte de discussion quand un écart apparaît, et tâche proposée par « Transformer en tâche »
export const TALK = {
  charge: { q: 'Qu’est-ce que tu pourrais prendre en entier le mois prochain ?', task: { title: 'Choisir une tâche à prendre en entier le mois prochain', family: 'information' } },
  anticipation: { q: 'Qui pourrait penser au réapprovisionnement le mois prochain, sans attendre qu’on lui demande ?', task: { title: 'Anticiper le réapprovisionnement du mois prochain', family: 'anticipation' } },
  demarches: { q: 'Quelle démarche l’un·e de vous pourrait prendre en entier le mois prochain ?', task: { title: 'Prendre une démarche en entier le mois prochain', family: 'demarches' } },
  frais: { q: 'Comment voulez-vous vous répartir les frais ? Équitable, ce n’est pas forcément moitié-moitié.', task: { title: 'Revoir la répartition des frais', family: 'frais' } },
}

// Paquet « À se poser ensemble » : qui s'en occupe, ce qui me gêne, ce que je suis prêt·e à essayer
export const CARDS = [
  'Qu’est-ce qui me pèse le plus en ce moment ?',
  'Qui pense au réapprovisionnement, et est-ce que ça nous va ?',
  'Qui prend les rendez-vous, et comment on pourrait alterner ?',
  'Qu’est-ce que je fais sans que l’autre le voie ?',
  'Comment on partage les frais, et est-ce que c’est juste pour nous deux ?',
  'Qu’est-ce qui me gêne quand on parle de contraception ?',
  'De quoi j’aimerais qu’on parle plus souvent ?',
  'Qu’est-ce qui me met mal à l’aise quand je dois demander de l’aide ?',
  'Qu’est-ce que je suis prêt·e à prendre en charge en entier ?',
  'Qu’est-ce que je suis prêt·e à essayer pour qu’on s’organise mieux ?',
  'Est-ce qu’on a déjà parlé de faire un dépistage IST à deux ?',
  'Comment je me sens quand c’est toujours la même personne qui y pense ?',
]

/* ---------- Moi ---------- */
export const SHARING = [
  ['taches', 'Mes tâches communes'],
  ['rappels', 'Mes rappels'],
  ['frais', 'Les frais'],
  ['checkin', 'Mes réponses au check-in'],
]

/* ---------- État initial (données fictives du brief) ---------- */
export function seed() {
  return {
    v: 1,
    onboarded: false,
    step: 1, // démarrage : 1 à 4, 5 = « Alex a rejoint ton duo »
    pseudo: DEFAULT_PSEUDO,
    whoUses: '',
    atelier: '',
    duo: false,
    tab: 'accueil',
    cardIndex: 0, // carte « À se poser ensemble » de l'accueil
    deckIndex: 0, // paquet de l'onglet Check-in
    tasks: [
      { id: 't1', title: 'Passer à la pharmacie', family: 'anticipation', owner: 'alex', status: 'acceptee', due: nextThursday(), remind: true, notify: false },
      { id: 't2', title: 'Prendre RDV dépistage IST à deux', family: 'demarches', owner: 'alex', status: 'attente', due: '', remind: false, notify: false },
      { id: 't3', title: 'Renouveler l’ordonnance', family: 'demarches', owner: 'moi', status: 'discussion', due: thirtieth(), remind: true, notify: false },
      { id: 't4', title: 'Noter une question pour le SSE', family: 'information', owner: 'moi', status: 'perso', due: '', remind: false, notify: false },
    ],
    expenses: [
      { id: 'e1', label: 'Préservatifs', amount: 990, by: 'moi', kind: 'achat' },
      { id: 'e2', label: 'Test de grossesse', amount: 450, by: 'alex', kind: 'achat' },
      { id: 'e3', label: 'Lubrifiant', amount: 330, by: 'moi', kind: 'achat' },
      { id: 'e4', label: 'Préservatifs', amount: 630, by: 'alex', kind: 'achat' },
    ],
    split: 'moitie',
    myPercent: 50,
    checkin: { step: 0, answers: {}, phase: 'quiz', keepPrivate: false, talkDone: false },
    sharing: { taches: true, rappels: false, frais: true, checkin: true },
    pause: false,
  }
}

// Solde : ce qu'Alex te doit (positif) ou ce que tu dois à Alex (négatif), en centimes
export function balance(state) {
  const achats = state.expenses.filter((e) => e.kind === 'achat')
  const paid = (who) => achats.filter((e) => e.by === who).reduce((s, e) => s + e.amount, 0)
  const total = paid('moi') + paid('alex')
  let owed = 0
  if (state.split === 'moitie') owed = paid('moi') - Math.round(total / 2)
  else if (state.split === 'pourcentage') owed = paid('moi') - Math.round((total * state.myPercent) / 100)
  // Remboursements : Alex qui te rembourse diminue ce qu'Alex te doit
  state.expenses.filter((e) => e.kind === 'remboursement').forEach((e) => { owed += e.by === 'alex' ? -e.amount : e.amount })
  return { owed, paidMe: paid('moi'), paidAlex: paid('alex') }
}
export function balanceText(owed) {
  if (owed > 0) return `${PARTNER} te doit ${money(owed)}`
  if (owed < 0) return `Tu dois ${money(-owed)} à ${PARTNER}`
  return 'Vous êtes quittes'
}
