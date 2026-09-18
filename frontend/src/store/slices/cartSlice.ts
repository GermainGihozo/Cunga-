import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface CartItem {
  id: number
  name: string
  price: number
  oldPrice?: number
  image: string
  seller_name: string
  seller_id: number
  shop_slug: string
  category: string
  quantity: number
  stock: number
}

interface CartState {
  items: CartItem[]
}

// Hydrate from localStorage on init
const loadFromStorage = (): CartItem[] => {
  try {
    const raw = localStorage.getItem('cunga_cart')
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

const saveToStorage = (items: CartItem[]) => {
  try {
    localStorage.setItem('cunga_cart', JSON.stringify(items))
  } catch { /* quota exceeded or private mode */ }
}

const initialState: CartState = {
  items: loadFromStorage(),
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem(state, action: PayloadAction<CartItem>) {
      const existing = state.items.find(i => i.id === action.payload.id)
      if (existing) {
        // Respect stock limit
        existing.quantity = Math.min(existing.quantity + action.payload.quantity, existing.stock)
      } else {
        state.items.push({ ...action.payload, quantity: Math.min(action.payload.quantity, action.payload.stock) })
      }
      saveToStorage(state.items)
    },

    removeItem(state, action: PayloadAction<number>) {
      state.items = state.items.filter(i => i.id !== action.payload)
      saveToStorage(state.items)
    },

    updateQuantity(state, action: PayloadAction<{ id: number; quantity: number }>) {
      const item = state.items.find(i => i.id === action.payload.id)
      if (item) {
        item.quantity = Math.max(1, Math.min(action.payload.quantity, item.stock))
        saveToStorage(state.items)
      }
    },

    clearCart(state) {
      state.items = []
      saveToStorage([])
    },

    // Replace entire cart (e.g. after restoring from server)
    setCart(state, action: PayloadAction<CartItem[]>) {
      state.items = action.payload
      saveToStorage(state.items)
    },
  },
})

export const { addItem, removeItem, updateQuantity, clearCart, setCart } = cartSlice.actions

// ── Selectors ─────────────────────────────────────────────
export const selectCartItems  = (state: { cart: CartState }) => state.cart.items
export const selectCartCount  = (state: { cart: CartState }) =>
  state.cart.items.reduce((s, i) => s + i.quantity, 0)
export const selectCartTotal  = (state: { cart: CartState }) =>
  state.cart.items.reduce((s, i) => s + i.price * i.quantity, 0)

export default cartSlice.reducer
