export const formatMoney = (value) => `$${Number(value).toFixed(2)}`;

export const formatDateTime = (value) =>
  new Date(value).toLocaleString('es-SV', { dateStyle: 'short', timeStyle: 'short' });

export const apiErrorMessage = (err, fallback) => err?.response?.data?.error || fallback;
