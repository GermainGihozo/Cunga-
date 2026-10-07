import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface WishlistItem {
  id: number
  name: string
  price: number
  oldPrice?: number
  image: string
  seller_name: string
  shop_slug: string
  category: string
}

interface WishlistState {
  items: WishlistItem[]
}

const load = (): WishlistItem[] => {
  try { return JSON.parse(localStorage.getItem('cunga_wishlist') || '[]') } catch { return [] }
}

const save = (items: WishlistItem[]) => {
  try { localStorage.setItem('cunga_wishlist', JSON.stringify(items)) } catch { /* quota */ }
}

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: { items: load() } as WishlistState,
  reducers: {
    toggleWishlist(state, action: PayloadAction<WishlistItem>) {
      const idx = state.items.findIndex(i => i.id === action.payload.id)
      if (idx >= 0) {
        state.items.splice(idx, 1)
      } else {
        state.items.push(action.payload)
      }
      save(state.items)
    },
    clearWishlist(state) {
      state.items = []
      save([])
    },
  },
})

export const { toggleWishlist, clearWishlist } = wishlistSlice.actions

export const selectWishlistItems  = (state: { wishlist: WishlistState }) => state.wishlist.items
export const selectWishlistCount  = (state: { wishlist: WishlistState }) => state.wishlist.items.length
export const selectIsWishlisted   = (id: number) => (state: { wishlist: WishlistState }) =>
  state.wishlist.items.some(i => i.id === id)

export default wishlistSlice.reducer
