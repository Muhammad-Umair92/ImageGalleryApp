import React, { useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useQuery } from '@apollo/client/react';
import { NetworkStatus } from '@apollo/client';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';

import { RootStackParamList, Photo } from '../../types';
import { GET_PHOTOS } from '../../api/queries/photoQueries';
import useAppDispatch from '../../hooks/useAppDispatch';
import useAppSelector from '../../hooks/useAppSelector';
import { toggleLike, setImages, setLoading, setError } from '../../redux/slices/imagesSlice';
import ImageCard, { ROW_HEIGHT } from '../../components/gallery/ImageCard';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';

type Props = NativeStackScreenProps<RootStackParamList, 'Gallery'>;

interface PhotosQueryData {
  photos: {
    data: Photo[];
    meta: { totalCount: number };
  };
}

const HEADER_MAX_HEIGHT = 90;
const HEADER_MIN_HEIGHT = 52;

const GalleryScreen = ({ navigation }: Props) => {
  const dispatch = useAppDispatch();
  const likedImages = useAppSelector(state => state.images.likedImages);
  const reduxImages = useAppSelector(state => state.images.images);

  const { data, loading, error, refetch, networkStatus } = useQuery<PhotosQueryData>(
    GET_PHOTOS,
    {
      variables: { options: { paginate: { page: 1, limit: 30 } } },
      notifyOnNetworkStatusChange: true, // ensures networkStatus updates on refetch
    },
  );

  // Sync Apollo results into Redux — Redux is the true source of truth.
  // Apollo fetches; Redux holds and exposes to the rest of the app.
  React.useEffect(() => { dispatch(setLoading(loading)); }, [loading, dispatch]);
  React.useEffect(() => {
    if (data?.photos?.data) dispatch(setImages(data.photos.data as Photo[]));
  }, [data, dispatch]);
  React.useEffect(() => { dispatch(setError(error?.message ?? null)); }, [error, dispatch]);


  // ─── Animated Collapsing Header ────────────────────────────────────────────
  // scrollY tracks how far the user has scrolled.
  // As scrollY increases from 0 → 80, the header height interpolates
  // from HEADER_MAX_HEIGHT → HEADER_MIN_HEIGHT (compact mode).
  // The title also scales down slightly, giving a natural "collapse" feel.
  const scrollY = useSharedValue(0);

  // useAnimatedScrollHandler runs on the UI thread — zero JS cost per scroll frame
  const scrollHandler = useAnimatedScrollHandler(event => {
    scrollY.value = event.contentOffset.y;
  });

  const headerAnimatedStyle = useAnimatedStyle(() => {
    const height = interpolate(
      scrollY.value,
      [0, 80],
      [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
      Extrapolation.CLAMP, // Never go below MIN or above MAX
    );
    return { height };
  });

  const titleAnimatedStyle = useAnimatedStyle(() => {
    const fontSize = interpolate(scrollY.value, [0, 80], [28, 20], Extrapolation.CLAMP);
    const opacity = interpolate(scrollY.value, [0, 40], [1, 0.7], Extrapolation.CLAMP);
    return { fontSize, opacity };
  });

  const subtitleAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scrollY.value, [0, 60], [1, 0], Extrapolation.CLAMP);
    const translateY = interpolate(scrollY.value, [0, 60], [0, -8], Extrapolation.CLAMP);
    return { opacity, transform: [{ translateY }] };
  });

  // ─── Handlers ──────────────────────────────────────────────────────────────
  const handlePress = useCallback(
    (photo: Photo) => navigation.navigate('Details', { photo }),
    [navigation],
  );

  const handleLikePress = useCallback(
    (photoId: string) => dispatch(toggleLike(photoId)),
    [dispatch],
  );

  const renderItem = useCallback(
    ({ item, index }: { item: Photo; index: number }) => (
      <ImageCard
        photo={item}
        isLiked={likedImages.includes(item.id)}
        onPress={() => handlePress(item)}
        onLikePress={() => handleLikePress(item.id)}
        index={index}
      />
    ),
    [handlePress, handleLikePress, likedImages],
  );

  const keyExtractor = useCallback((item: Photo) => item.id, []);

  // getItemLayout tells FlatList the exact size and offset of every item
  // WITHOUT measuring the DOM. This eliminates layout thrashing on scroll.
  // For numColumns=2: every 2 items share one row of height ROW_HEIGHT.
  // offset = which row this item is in × row height
  const getItemLayout = useCallback(
    (_: ArrayLike<Photo> | null | undefined, index: number) => ({
      length: ROW_HEIGHT,
      offset: ROW_HEIGHT * Math.floor(index / 2),
      index,
    }),
    [],
  );

  // ─── States ─────────────────────────────────────────────────────────────────
  // NetworkStatus.refetch (4) = pull-to-refresh in progress
  // NetworkStatus.loading (1) = initial load
  const isRefreshing = networkStatus === NetworkStatus.refetch;

  if (loading && !data) {
    return (
      <Loader
        backgroundColor="#0f0f13"
        spinnerColor="#818cf8"
        label="Loading gallery..."
      />
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <EmptyState title="Something went wrong" message={error.message} />
      </View>
    );
  }

  // Prefer Redux store (synced from Apollo) — Redux is the source of truth
  const photos = reduxImages.length > 0 ? reduxImages : (data?.photos?.data ?? []) as Photo[];

  return (
    <SafeAreaView style={styles.safeArea}>

      {/* ─── Animated Collapsing Header ─────────────────────────────── */}
      <Animated.View style={[styles.header, headerAnimatedStyle]}>
        <View style={styles.headerRow}>
          <View>
            <Animated.Text style={[styles.title, titleAnimatedStyle]}>
              Gallery
            </Animated.Text>
            <Animated.Text style={[styles.subtitle, subtitleAnimatedStyle]}>
              {photos.length} photos · {likedImages.length} liked
            </Animated.Text>
          </View>
          {/* Device info button — navigates to DeviceDetails screen */}
          <TouchableOpacity
            style={styles.deviceButton}
            onPress={() => navigation.navigate('DeviceDetails')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={styles.deviceButtonIcon}>📱</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* ─── Animated FlatList ──────────────────────────────────────── */}
      {/*
       * Animated.FlatList passes scroll events to the UI thread via onScroll.
       * scrollEventThrottle={16} = fires at ~60fps (16ms per frame at 60fps).
       * Without throttling, scroll events fire too rapidly and waste resources.
       */}
      <Animated.FlatList
        data={photos}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        getItemLayout={getItemLayout}
        removeClippedSubviews={true}
        maxToRenderPerBatch={20}      // Render more items per tick — fewer blank frames
        updateCellsBatchingPeriod={30} // More frequent cell updates (default 50ms)
        windowSize={15}               // Keep 15x viewport rendered — less unmounting
        initialNumToRender={10}
          refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refetch}
            tintColor="#4f46e5"
          />
        }
        ListEmptyComponent={<EmptyState />}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0f0f13',
  },
  header: {
    paddingHorizontal: 24,
    justifyContent: 'center',
    backgroundColor: '#0f0f13',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.45)',
    marginTop: 2,
  },
  deviceButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deviceButtonIcon: {
    fontSize: 20,
  },
  listContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
    flexGrow: 1,
  },
  row: {
    justifyContent: 'space-between',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#0f0f13',
  },
});

export default GalleryScreen;
