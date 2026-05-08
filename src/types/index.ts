// ─── Photo ───────────────────────────────────────────────────────────────────
// This is the core data model for a photo in the gallery.
// It maps 1-to-1 with what GraphQL returns from the photos query.
export interface Photo {
  id: string;
  title: string;
  url: string;
  thumbnailUrl: string;
  album: {
    id: string;
    title?: string;
    user?: { name: string; username: string };
  };
}

// ─── Album ───────────────────────────────────────────────────────────────────
export interface Album {
  id: string;
  title: string;
}

// ─── User (Registration Form) ────────────────────────────────────────────────
// This represents the data the user submits on the registration screen.
export interface RegisterFormData {
  name: string;
  email: string;
  phone: string;
  password: string;
}

// ─── Navigation ──────────────────────────────────────────────────────────────
// RootStackParamList is the single source of truth for ALL routes in the app.
// Each key is a screen name. The value is the shape of params that screen accepts.
// 'undefined' means that screen takes NO params.
export type RootStackParamList = {
  Register: undefined;
  Gallery: undefined;
  Details: { photo: Photo };
};
