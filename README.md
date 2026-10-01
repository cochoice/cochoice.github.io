# CoChoice · site vitrine + landing page

Vite 7 + Tailwind CSS v4. Consigne complète : voir `CLAUDE.md`.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # sortie dans dist/
```

Pages : `index.html` (page d'accueil publique, avec démonstration interactive), `a-propos.html`, `contact.html` · `landing.html` (landing).

## Page d'accueil (index.html)

- Styles : `src/styles/main.css` (tokens) + `src/styles/home.css` (page).
- Scripts : `src/scripts/home.js` (menu, points de départ, formulaire), `src/scripts/demo.js` (aperçu de l'application, données fictives, stockage local).
- Formulaire de contact : renseigner `contactEndpoint` dans `src/scripts/config.js` (ex. Formspree). Tant qu'il est vide, rien n'est envoyé et la page le dit.
- Photos et crédits : voir `CREDITS.md`.
