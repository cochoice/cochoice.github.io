// Configuration du site CoChoice.
// contactEndpoint : URL d'un service de formulaire (ex. Formspree : https://formspree.io/f/xxxx).
// Tant qu'elle est vide, le formulaire n'envoie rien et l'explique à la personne.
// feedbackFormUrl : lien du Google Form unique (« Tu es : étudiant·e / établissement / jury »),
// ouvert par « Être prévenu·e du lancement », « Me prévenir » (box) et « Donner mon avis » (mvp.html).
// Tant qu'il est vide, un message l'explique au lieu d'ouvrir un lien mort.
// goatcounterCode : code du compte GoatCounter (« cochoice » pour https://cochoice.goatcounter.com).
// Tant qu'il est vide, aucune mesure d'audience n'est chargée.
export const CONFIG = {
  contactEndpoint: '',
  feedbackFormUrl: '',
  goatcounterCode: 'cochoice',
}
