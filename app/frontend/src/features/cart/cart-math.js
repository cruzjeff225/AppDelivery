// Prices in the catalog are before tax. Round IVA per product line in cents.
export function lineAmounts(price, quantity = 1) {
  const subtotalCents = Math.round(Number(price) * 100) * quantity;
  const taxCents = Math.round(subtotalCents * 13 / 100);
  return { subtotal: subtotalCents / 100, tax: taxCents / 100, total: (subtotalCents + taxCents) / 100 };
}

export function cartAmounts(items) {
  let subtotalCents = 0;
  let taxCents = 0;
  let itemCount = 0;
  for (const item of items) {
    const line = lineAmounts(item.price, item.quantity);
    subtotalCents += Math.round(line.subtotal * 100);
    taxCents += Math.round(line.tax * 100);
    itemCount += item.quantity;
  }
  const shippingCents = items.length ? 250 : 0;
  return {
    itemCount, subtotal: subtotalCents / 100, tax: taxCents / 100,
    shippingFee: shippingCents / 100,
    total: (subtotalCents + taxCents + shippingCents) / 100,
  };
}

export function sanitizeCart(items) {
  if (!Array.isArray(items)) return [];
  const seen = new Set();
  return items.filter((item) => {
    if (!item || !Number.isInteger(Number(item.id)) || Number(item.id) <= 0 || seen.has(String(item.id)) ||
        !Number.isFinite(Number(item.price)) || Number(item.price) <= 0 ||
        !Number.isInteger(item.quantity) || item.quantity <= 0 || item.quantity > 10000 ||
        !Number.isInteger(Number(item.total_stock)) || Number(item.total_stock) < item.quantity || item.is_available === false) return false;
    seen.add(String(item.id));
    return true;
  });
}
