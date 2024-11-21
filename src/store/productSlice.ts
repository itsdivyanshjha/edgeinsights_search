import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface Product {
  id: number
  name: string
  image: string
  features: string[]
  price: string
  link: string
}

interface ProductState {
  products: Product[]
  searchQuery: string
}

const initialState: ProductState = {
  products: [],
  searchQuery: '',
}

const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {
    setProducts: (state, action: PayloadAction<Product[]>) => {
      state.products = action.payload
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload
    },
  },
})

export const { setProducts, setSearchQuery } = productSlice.actions
export default productSlice.reducer