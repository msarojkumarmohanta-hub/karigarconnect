import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { wishlistApi } from '../api/services'
import { useAuth } from './AuthContext'

const WishlistContext = createContext(null)

export function WishlistProvider({ children }) {
  const { user } = useAuth()
  const [ids, setIds] = useState(new Set())
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user) {
      setIds(new Set())
      return
    }

    setLoading(true)
    wishlistApi.list()
      .then((wishlist) => setIds(new Set((wishlist?.products || []).map((product) => product._id || product))))
      .finally(() => setLoading(false))
  }, [user])

  const toggle = async (productId) => {
    if (!user || !productId) return false
    const saved = ids.has(productId)
    const wishlist = saved ? await wishlistApi.remove(productId) : await wishlistApi.add(productId)
    setIds(new Set((wishlist?.products || []).map((product) => product._id || product)))
    return !saved
  }

  return <WishlistContext.Provider value={useMemo(() => ({ ids, loading, toggle }), [ids, loading])}>{children}</WishlistContext.Provider>
}

export const useWishlist = () => useContext(WishlistContext)
