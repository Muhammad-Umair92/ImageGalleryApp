// Generates a deterministic "likes" count from a photo ID.
// The API doesn't provide real likes, so we derive a consistent number
// from the ID using a simple hash — same photo always gets the same count.
// In production, this would come from your database.
export const getLikesCount = (photoId: string): number => {
  const id = parseInt(photoId, 10);
  return ((id * 137 + 42) % 486) + 15; // Always 15–500 range
};

// Returns the author name from the nested album.user field.
// Falls back gracefully if the API doesn't return user data.
export const getAuthorName = (photo: {
  album?: { user?: { name: string } };
}): string => {
  return photo.album?.user?.name ?? 'Unknown Author';
};
