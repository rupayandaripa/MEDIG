import { configureStore } from "@reduxjs/toolkit";
import MediGReducer from './MediGSlice.js'

export const store = configureStore({
    reducer: MediGReducer
})

export default store