/** Escape all authored/imported text at the HTML boundary. @param {unknown} value */
export const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[char] ?? char);

