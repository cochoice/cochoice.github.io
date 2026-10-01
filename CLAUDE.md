# Consigne projet : site CoChoice (site vitrine + landing page)

## Objectif
Créer un site web moderne, rapide et responsive pour CoChoice (Groupe 13, Rocket School ChangeMaker Project) :
- **Site vitrine** (3 pages) : présenter le problème, la solution, la mission, l'équipe, le contact.
- **Landing page** (1 page) : convertir sur un seul objectif (inscription email), sans menu de navigation.

## Stack technique
- **Vite 7** (serveur de dev + build multi-pages)
- **Tailwind CSS v4** via le plugin `@tailwindcss/vite` (pas de `tailwind.config.js` : les tokens sont dans `@theme` de `src/styles/main.css`)
- HTML statique + JavaScript vanilla (pas de framework)
- Déploiement : GitHub Pages (dossier `dist/`), `base: './'` dans `vite.config.js`

## Structure
```
cochoice-site/
├── CLAUDE.md            ← cette consigne
├── README.md            ← démarrage rapide
├── package.json
├── vite.config.js       ← déclaration des pages (rollupOptions.input)
├── index.html           ← vitrine : Accueil (hero, constat, solution, CTA)
├── a-propos.html        ← vitrine : mission, engagements RSE, équipe
├── contact.html         ← vitrine : formulaire de contact
├── landing.html         ← landing : hero + formulaire, bénéfices, étapes, FAQ, CTA final
├── public/              ← copié tel quel (chemins absolus /...)
│   ├── favicon.svg
│   ├── fonts/           ← Nunito 400 à 900
│   └── logos/           ← logos charte V2 (svg)
└── src/
    ├── styles/main.css  ← Tailwind + tokens charte + composants (.btn-primary, .card…)
    ├── scripts/main.js  ← import CSS, menu mobile, année footer
    └── assets/
        ├── images/      ← photos, illustrations (optimisées, webp)
        └── icons/
```

## Charte graphique CoChoice V2 (à respecter strictement)
- Nom : **CoChoice** (deux majuscules). Signature : « Mêmes droits, mêmes choix. » Sous-signature : « Pour une contraception plus égale. »
- Ton : jeune et pop, sérieux sur le fond. Tutoiement sur la landing, vouvoiement possible sur la vitrine (à trancher en groupe).
- Police unique : **Nunito** (titres ExtraBold 800, texte 400/600).
- Couleurs (classes Tailwind disponibles) :
  | Token | Hex | Usage |
  |---|---|---|
  | `rose` | #FF7777 | accents, fonds CTA |
  | `pervenche` | #5B7BFA | accents, illustrations |
  | `indigo` | #2A1F50 | titres, fonds sombres, bouton principal |
  | `lavande` | #F3F0F8 | fonds de section alternés |
  | `rose-texte` | #CC3A44 | sur-titres, texte rose |
  | `pervenche-texte` | #3D5BE0 | liens, survols |
  | `encre` | #5F567C | texte courant |
- Sur-titres en capitales `rose-texte` (classe `.surtitre`), titres en `indigo`, sections alternées blanc / lavande, footer indigo avec logo blanc.
- Ne jamais utiliser le rose/pervenche clair pour du texte sur fond blanc (contraste insuffisant) : utiliser les variantes `-texte`.

## Règles de développement
1. **Mobile first** : tester à 375 px, 768 px, 1280 px. Aucun scroll horizontal.
2. **Tailwind d'abord** ; CSS custom uniquement dans des blocs `@utility` de `main.css` (syntaxe Tailwind v4).
3. Header et footer sont dupliqués dans chaque page vitrine : toute modif doit être répercutée sur `index.html`, `a-propos.html`, `contact.html` (et le footer de `landing.html`).
4. Nouvelle page = créer le `.html` à la racine **et** l'ajouter dans `vite.config.js > build.rollupOptions.input`.
5. Accessibilité : `alt` sur les images, `lang="fr"`, labels sur les champs, contraste AA, navigation clavier OK.
6. Performance / SEO : `<title>` et `<meta description>` uniques par page, images en webp < 200 Ko, `loading="lazy"` sous la ligne de flottaison.
7. Contenu : remplacer tous les `[placeholders]` à partir des livrables de la dataroom (Drive). Chiffres toujours sourcés.
8. Formulaires : statiques par défaut ; à brancher sur Formspree, Google Forms ou Google Apps Script (attribut `action`). Ajouter une mention RGPD.
9. Pas de tiret cadratin « — » dans les textes.

## Landing page : principes
- 1 page = 1 objectif = 1 CTA (répété en haut et en bas).
- Pas de menu ; logo seul en header.
- Ordre : promesse → preuve (bénéfices, chiffres) → fonctionnement → objections (FAQ) → CTA final.

## Commandes
```bash
npm install       # une seule fois
npm run dev       # http://localhost:5173 (landing : /landing.html)
npm run build     # génère dist/
npm run preview   # prévisualise le build
```

## Prompt type pour itérer avec Claude
> En suivant CLAUDE.md, remplis la section [X] de [page].html avec [contenu / source], en respectant la charte CoChoice et les composants existants. Ne modifie rien d'autre.
