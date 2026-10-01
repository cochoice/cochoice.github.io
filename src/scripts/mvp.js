import '../styles/main.css'
import '../styles/home.css'
import '../styles/mvp.css'
import { initDemo } from './demo.js'
import { initCheckin, initSensitive } from './checkin.js'

document.documentElement.classList.add('js')

// Apparitions discrètes (désactivées si prefers-reduced-motion, cf. home.css)
const revealObserver = new IntersectionObserver((entries, obs) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) { entry.target.classList.add('is-in'); obs.unobserve(entry.target) }
  })
}, { rootMargin: '0px 0px -8% 0px' })
document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el))

initCheckin(document.querySelector('[data-checkin]'))
initSensitive(document.querySelector('[data-sensitive]'))
initDemo(document.querySelector('[data-app]'))

document.querySelectorAll('[data-year]').forEach((el) => (el.textContent = new Date().getFullYear()))
