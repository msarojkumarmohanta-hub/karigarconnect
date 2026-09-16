import { createContext, useContext, useMemo, useState } from 'react'

const MembershipContext = createContext(null)
export const plans = {
  monthly: { plan: 'monthly', name: 'Monthly Membership', price: 499, billingPeriod: 'month' },
  yearly: { plan: 'yearly', name: 'Yearly Membership', price: 4599, billingPeriod: 'year' }
}

export function MembershipProvider({ children }) {
  const [membership, setMembership] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('karigar_membership') || 'null') } catch { return null }
  })
  const selectPlan = (plan) => {
    const selected = plans[plan]
    if (!selected) throw new Error('Please choose a valid membership plan.')
    setMembership(selected)
    sessionStorage.setItem('karigar_membership', JSON.stringify(selected))
  }
  const clearPlan = () => { setMembership(null); sessionStorage.removeItem('karigar_membership') }
  const value = useMemo(() => ({ membership, selectPlan, clearPlan, plans }), [membership])
  return <MembershipContext.Provider value={value}>{children}</MembershipContext.Provider>
}
export const useMembership = () => useContext(MembershipContext)
