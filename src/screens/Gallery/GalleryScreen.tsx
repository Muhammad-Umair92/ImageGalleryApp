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
import { toggleLike } from '../../redux/slices/imagesSlice';
import ImageCard from '../../components/gallery/ImageCard';
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

  const { data, loading, error, refetch } = useQuery<PhotosQueryData>(
    GET_PHOTOS,
    {
      variables: { options: { paginate: { page: 1, limit: 30 } } },
    },
  );

  React.useEffect(() => {
    if (data) console.log('[Gallery] Photos loaded:', data.photos?.data?.length);
    if (error) console.log('[Gallery] Apollo error:', error.message);
  }, [data, error]);

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

  // ─── States ─────────────────────────────────────────────────────────────────
  if (loading && !data) return <Loader />;

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <EmptyState title="Something went wrong" message={error.message} />
      </View>
    );
  }

  const photos = (data?.photos?.data ?? []) as Photo[];

  return (
    <SafeAreaView style={styles.safeArea}>

      {/* ─── Animated Collapsing Header ─────────────────────────────── */}
      <Animated.View style={[styles.header, headerAnimatedStyle]}>
        <Animated.Text style={[styles.title, titleAnimatedStyle]}>
          Gallery
        </Animated.Text>
        <Animated.Text style={[styles.subtitle, subtitleAnimatedStyle]}>
          {photos.length} photos · {likedImages.length} liked
        </Animated.Text>
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
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={5}
        initialNumToRender={6}
        refreshControl={
          <RefreshControl
            refreshing={loading}
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
