import { createContext, useContext, useMemo, useState } from 'react'
const CartContext = createContext(null)
const offerRates = [10, 15, 20, 25, 30]
const discountPercent = (product) => Number(product?.discountPercent ?? offerRates[parseInt(String(product?._id || '0').slice(-1), 16) % offerRates.length])
export function CartProvider({ children }) {
  const [items, setItems] = useState(() => JSON.parse(localStorage.getItem('karigar_cart') || '[]'))
  const persist = (next) => { setItems(next); localStorage.setItem('karigar_cart', JSON.stringify(next)) }
  const add = (product, quantity = 1) => { const next = items.map((x) => ({ ...x })); const found = next.find((x) => x.product._id === product._id); if (found) found.quantity += quantity; else next.push({ product, quantity }); persist(next) }
  const remove = (id) => persist(items.filter((x) => x.product._id !== id))
  const totalFor = (quickDelivery = false) => items.reduce((sum, x) => sum + (quickDelivery ? Number(x.product.price || 0) : Math.round(Number(x.product.price || 0) * (1 - Math.min(30, Math.max(0, discountPercent(x.product))) / 100))) * x.quantity, 0)
  const total = totalFor()
  return <CartContext.Provider value={useMemo(() => ({ items, add, remove, total, totalFor }), [items, total])}>{children}</CartContext.Provider>
}
export const useCart = () => useContext(CartContext)
