import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Photo } from '../../types';

// ─── State Shape ─────────────────────────────────────────────────────────────
// Define the shape of this slice's state with an interface.
// This is the "contract" — every reducer and selector must respect it.
interface ImagesState {
  images: Photo[];        // All photos fetched from GraphQL
  likedImages: string[];  // Array of photo IDs the user has liked
  loading: boolean;       // True while fetching data
  error: string | null;   // Error message, null if no error
}

// ─── Initial State ────────────────────────────────────────────────────────────
// This is what Redux initializes with before any action is dispatched.
const initialState: ImagesState = {
  images: [],
  likedImages: [],
  loading: false,
  error: null,
};

// ─── Slice ────────────────────────────────────────────────────────────────────
// createSlice generates:
//   1. Action creators (imagesSlice.actions.setImages, etc.)
//   2. Action type strings ("images/setImages", etc.)
//   3. The reducer function (imagesSlice.reducer)
// All from a single object. This replaces ~80 lines of plain Redux.
const imagesSlice = createSlice({
  name: 'images', // Prefix for all auto-generated action type strings
  initialState,
  reducers: {
    // Immer allows us to write `state.images = action.payload` directly.
    // Under the hood, Immer produces a NEW immutable state object.
    // Without Immer, we'd write: return { ...state, images: action.payload }
    setImages: (state, action: PayloadAction<Photo[]>) => {
      state.images = action.payload;
    },

    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    // Toggle like: if already liked → remove. If not liked → add.
    // This is a pure function — same input always produces same output.
    toggleLike: (state, action: PayloadAction<string>) => {
      const photoId = action.payload;
      const index = state.likedImages.indexOf(photoId);

      if (index !== -1) {
        // Already liked — remove it
        state.likedImages.splice(index, 1);
      } else {
        // Not liked — add it
        state.likedImages.push(photoId);
      }
    },
  },
});

// Export individual action creators for use in components and hooks
export const { setImages, setLoading, setError, toggleLike } =
  imagesSlice.actions;

// Export the reducer to be registered in the store
export default imagesSlice.reducer;
