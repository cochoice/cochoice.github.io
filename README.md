# CoChoice · site vitrine + landing page

Vite 7 + Tailwind CSS v4. Consigne complète : voir `CLAUDE.md`.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # sortie dans dist/
```

Pages vitrine : `index.html`, `pourquoi.html`, `solution.html`, `impact.html`, `a-propos.html` (contact en `#contact`), `mentions-legales.html` · `mvp.html` (l'appli) · `landing.html` (landing).

## Site vitrine

- Styles : `src/styles/main.css` (tokens + composants). Script : `src/scripts/main.js` (menu burger, formulaires).
- Formulaire de contact (`a-propos.html#contact`) : renseigner l'attribut `action` du formulaire (Google Forms) ou `contactEndpoint` dans `src/scripts/config.js`. Tant qu'il est vide, rien n'est envoyé et la page le dit.
- Photos et crédits : voir `CREDITS.md` et `mentions-legales.html`.
