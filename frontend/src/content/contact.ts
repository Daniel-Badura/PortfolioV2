// Form IDs are public identifiers, not credentials. Override at build time if needed.
export const formspreeId = import.meta.env.VITE_FORMSPREE_FORM_ID?.trim() || 'moevqqvl';
if (!/^[a-zA-Z0-9]+$/.test(formspreeId)) {
  throw new Error('VITE_FORMSPREE_FORM_ID must contain a Formspree form ID, not a URL.');
}
export const formspreeEndpoint = `https://formspree.io/f/${formspreeId}`;
