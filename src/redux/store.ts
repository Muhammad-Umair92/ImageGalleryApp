import { configureStore } from '@reduxjs/toolkit';
import imagesReducer from './slices/imagesSlice';

// configureStore automatically:
// 1. Combines reducers
// 2. Adds Redux DevTools support (in development)
// 3. Adds redux-thunk middleware (needed for async actions)
// In plain Redux, you'd set all of this up manually.
export const store = configureStore({
  reducer: {
    // 'images' is the key — this means state.images in the store
    images: imagesReducer,
  },
});

// ─── TypeScript Utilities ─────────────────────────────────────────────────────
// RootState is the TypeScript type of the entire Redux state tree.
// Usage in components: const images = useSelector((state: RootState) => state.images.images)
export type RootState = ReturnType<typeof store.getState>;

// AppDispatch is the TypeScript type of the dispatch function.
// Usage in components: const dispatch = useDispatch<AppDispatch>()
// This is important because it understands async thunk actions.
export type AppDispatch = typeof store.dispatch;
