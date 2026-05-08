import React, { useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useQuery } from '@apollo/client/react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RootStackParamList, Photo } from '../../types';
import { GET_PHOTOS } from '../../api/queries/photoQueries';
import useAppDispatch from '../../hooks/useAppDispatch';
import useAppSelector from '../../hooks/useAppSelector';
import { toggleLike } from '../../redux/slices/imagesSlice';
import ImageCard from '../../components/gallery/ImageCard';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';

type Props = NativeStackScreenProps<RootStackParamList, 'Gallery'>;

// ─── GraphQL Response Types ───────────────────────────────────────────────────
// These match the exact shape Apollo returns from GET_PHOTOS query.
// Always type your query responses — prevents runtime crashes from shape mismatches.
interface PhotosQueryData {
  photos: {
    data: Photo[];
    meta: { totalCount: number };
  };
}

const GalleryScreen = ({ navigation }: Props) => {
  const dispatch = useAppDispatch();

  // Read liked photo IDs from Redux store.
  // useAppSelector re-renders this component ONLY when likedImages array changes.
  // Other Redux state changes (loading, images) don't trigger a re-render here.
  const likedImages = useAppSelector(state => state.images.likedImages);

  // useQuery sends the GraphQL query to Apollo.
  // Apollo returns: data, loading, error, refetch
  // On mount: loading=true, data=undefined
  // On success: loading=false, data={photos:{data:[...]}}
  // cache-and-network fetchPolicy (set in client.ts):
  //   1. Returns cached data immediately (fast UX)
  //   2. Refetches from network in background
  //   3. Updates UI when fresh data arrives
  const { data, loading, error, refetch } = useQuery<PhotosQueryData>(
    GET_PHOTOS,
    {
      variables: {
        options: {
          paginate: { page: 1, limit: 30 },
        },
      },
    },
  );

  // Apollo v4 onCompleted/onError were removed from useQuery options.
  // Log data changes via a ref check instead (or use useEffect).
  React.useEffect(() => {
    if (data) {
      console.log('[Gallery] Photos loaded:', data.photos?.data?.length);
    }
    if (error) {
      console.log('[Gallery] Apollo error:', error.message);
    }
  }, [data, error]);

  // ─── Handlers ──────────────────────────────────────────────────────────────
  // useCallback memoizes these functions so their reference stays stable
  // across re-renders. This is CRITICAL for React.memo to work on ImageCard.
  //
  // Without useCallback:
  //   Parent re-renders → new onPress function created → ImageCard sees new prop
  //   → React.memo thinks props changed → ALL cards re-render. Memo is wasted.
  //
  // With useCallback:
  //   Parent re-renders → same onPress reference returned → ImageCard props unchanged
  //   → React.memo skips re-render. 99 cards saved.
  //
  // The dependency array [navigation] means: only recreate this function
  // if the navigation object changes (it won't). Photo is passed as parameter
  // to avoid closing over a stale value.
  const handlePress = useCallback(
    (photo: Photo) => {
      navigation.navigate('Details', { photo });
    },
    [navigation],
  );

  const handleLikePress = useCallback(
    (photoId: string) => {
      dispatch(toggleLike(photoId));
    },
    [dispatch],
  );

  // ─── Render Item ───────────────────────────────────────────────────────────
  // renderItem is also memoized. Without useCallback, FlatList re-renders
  // every item when the parent re-renders because renderItem is a new function.
  // Dependencies: handlePress, handleLikePress, likedImages
  // When likedImages changes (like toggled), renderItem updates to reflect new state.
  const renderItem = useCallback(
    ({ item }: { item: Photo }) => (
      <ImageCard
        photo={item}
        isLiked={likedImages.includes(item.id)}
        onPress={() => handlePress(item)}
        onLikePress={() => handleLikePress(item.id)}
      />
    ),
    [handlePress, handleLikePress, likedImages],
  );

  // Stable keyExtractor — never recreate this function
  // Using photo ID (not index) so React can correctly track items if list reorders
  const keyExtractor = useCallback((item: Photo) => item.id, []);

  // ─── Render States ─────────────────────────────────────────────────────────
  if (loading && !data) {
    // Only show full-screen loader on FIRST load, not on refetch.
    // !data check: if data exists (from cache), don't block the UI with a loader.
    return <Loader />;
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <EmptyState
          title="Something went wrong"
          message={error.message}
        />
      </View>
    );
  }

  // Apollo v4 returns DeepPartialObject<T> (all fields optional) for safety.
  // We cast to Photo[] because we know the query always returns complete objects
  // when successful. The ?? [] guards against undefined on first render.
  const photos = (data?.photos?.data ?? []) as Photo[];

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ─── Header ─────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <Text style={styles.title}>Gallery</Text>
        <Text style={styles.subtitle}>
          {photos.length} photos · {likedImages.length} liked
        </Text>
      </View>

      {/* ─── Grid FlatList ──────────────────────────────────────────── */}
      <FlatList
        data={photos}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        numColumns={2}                  // 2-column grid
        columnWrapperStyle={styles.row} // Space between the 2 columns
        contentContainerStyle={styles.listContent}

        // ─── Performance Props ────────────────────────────────────
        removeClippedSubviews={true}    // Detach off-screen views (Android GPU memory)
        maxToRenderPerBatch={10}        // Items rendered per JS event loop tick
        windowSize={5}                  // Render window = 5x screen height
        initialNumToRender={6}          // Items on first paint (match screen capacity)

        // ─── Pull to Refresh ──────────────────────────────────────
        // RefreshControl shows the native iOS/Android pull-to-refresh indicator
        // loading prop: true while refetch() is running
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refetch}
            tintColor="#4f46e5"
          />
        }

        // ─── Empty State ──────────────────────────────────────────
        ListEmptyComponent={<EmptyState />}

        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  listContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 32,
    flexGrow: 1,
  },
  row: {
    justifyContent: 'space-between',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
});

export default GalleryScreen;
