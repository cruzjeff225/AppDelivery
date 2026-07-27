import { useState } from 'react';
export function useCart() {
  const [items, setItems] = useState([]);
  // suma, elimina, calcula total en frontend (ver docs/01-PROPUESTA-TECNICA.md)
  return { items, setItems };
}
