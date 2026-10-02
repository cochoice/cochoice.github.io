// Mesure d'audience GoatCounter : anonyme, sans cookie, donc sans bandeau de consentement.
// Le script ne se charge que si CONFIG.goatcounterCode est renseigné (config.js).
// GoatCounter ne compte pas les visites en local (localhost).
import { CONFIG } from './config.js'

if (CONFIG.goatcounterCode) {
  const s = document.createElement('script')
  s.async = true
  s.src = 'https://gc.zgo.at/count.js'
  s.dataset.goatcounter = `https://${CONFIG.goatcounterCode}.goatcounter.com/count`
  document.head.append(s)
}
