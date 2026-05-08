import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  useAnimatedRef,
  interpolate,
  withSpring,
  withSequence,
  Extrapolation,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RootStackParamList } from '../../types';
import useAppDispatch from '../../hooks/useAppDispatch';
import useAppSelector from '../../hooks/useAppSelector';
import { toggleLike } from '../../redux/slices/imagesSlice';
import { getLikesCount, getAuthorName } from '../../utils/photoUtils';

type Props = NativeStackScreenProps<RootStackParamList, 'Details'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');
// Hero image is taller than the screen width for the parallax to have room
const HERO_HEIGHT = SCREEN_WIDTH * 1.1;
// The visible container for the hero — crop to this height
const HERO_CONTAINER_HEIGHT = SCREEN_WIDTH * 0.85;

const DetailsScreen = ({ route, navigation }: Props) => {
  const { photo } = route.params;
  const dispatch = useAppDispatch();
  const likedImages = useAppSelector(state => state.images.likedImages);
  const isLiked = likedImages.includes(photo.id);

  const handleLikePress = useCallback(() => {
    dispatch(toggleLike(photo.id));
  }, [dispatch, photo.id]);

  // ─── Parallax Effect ────────────────────────────────────────────────────
  // Track scroll position on the UI thread (no JS bridge)
  const scrollY = useSharedValue(0);
  const scrollRef = useAnimatedRef<Animated.ScrollView>();

  const scrollHandler = useAnimatedScrollHandler(event => {
    scrollY.value = event.contentOffset.y;
  });

  // Parallax: image moves up at 40% of scroll speed.
  // Container clips the image so it never shows blank space.
  // As user scrolls down 100px → image only moves 40px → appears to scroll slower.
  // This depth illusion is what gives the "wow" feeling on scroll.
  const parallaxImageStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollY.value,
      [0, HERO_CONTAINER_HEIGHT],
      [0, -HERO_CONTAINER_HEIGHT * 0.4],
      Extrapolation.CLAMP,
    );
    return { transform: [{ translateY }] };
  });

  // Back button fades in as a floating overlay when scrolled
  const headerOverlayStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scrollY.value, [0, 120], [0, 1], Extrapolation.CLAMP);
    return { opacity };
  });

  // ─── Floating Like Button Animation ─────────────────────────────────────
  const fabScale = useSharedValue(1);
  const fabAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: fabScale.value }],
  }));

  const handleFabLike = useCallback(() => {
    dispatch(toggleLike(photo.id));
    fabScale.value = withSequence(
      withSpring(0.85, { damping: 3, stiffness: 400 }),
      withSpring(1.15, { damping: 3, stiffness: 300 }),
      withSpring(1.0, { damping: 5, stiffness: 200 }),
    );
  }, [dispatch, photo.id, fabScale]);

  return (
    <View style={styles.container}>

      {/* ─── Animated Scroll ──────────────────────────────────────────── */}
      <Animated.ScrollView
        ref={scrollRef}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        bounces={true}>

        {/* ─── Hero Image with Parallax ─────────────────────────────── */}
        {/*
         * Container clips the image (overflow: hidden).
         * Image is taller than container — gives parallax room to move.
         * As user scrolls down, parallaxImageStyle moves image UP at 40% speed.
         * Result: image appears to "scroll through" the container at a slower rate.
         */}
        <View style={styles.heroContainer}>
          <Animated.Image
            source={{ uri: `https://picsum.photos/seed/${photo.id}/600/700` }}
            style={[styles.heroImage, parallaxImageStyle]}
            resizeMode="cover"
            sharedTransitionTag={`photo-image-${photo.id}`}
          />
          {/* Dark gradient at bottom of hero for content legibility */}
          <LinearGradient
            colors={['transparent', 'rgba(255,255,255,0.95)']}
            locations={[0.6, 1]}
            style={styles.heroGradient}
          />
        </View>

        {/* ─── Content ──────────────────────────────────────────────── */}
        <View style={styles.content}>

          {/* Author + likes summary */}
          <View style={styles.authorRow}>
            <View style={styles.authorAvatar}>
              <Text style={styles.avatarInitial}>
                {getAuthorName(photo).charAt(0).toUpperCase()}
              </Text>
            </View>
            <View>
              <Text style={styles.authorName}>{getAuthorName(photo)}</Text>
              <Text style={styles.authorSub}>Photographer</Text>
            </View>
          </View>

          <Text style={styles.title}>{photo.title}</Text>

          {/* Likes stats row */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {(getLikesCount(photo.id) + (isLiked ? 1 : 0)).toLocaleString()}
              </Text>
              <Text style={styles.statLabel}>Likes</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>Album {photo.album.id}</Text>
              <Text style={styles.statLabel}>Collection</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>#{photo.id}</Text>
              <Text style={styles.statLabel}>Photo ID</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Description */}
          <View style={styles.descriptionBox}>
            <Text style={styles.descriptionLabel}>Description</Text>
            <Text style={styles.descriptionText}>
              A stunning photo by {getAuthorName(photo)} from Album {photo.album.id}.
              This piece titled "{photo.title}" is part of a curated collection
              showcasing diverse photographic styles and subjects. With{' '}
              {getLikesCount(photo.id).toLocaleString()} likes from the community,
              it stands as one of the most appreciated works in this collection.
            </Text>
          </View>

          {/* Spacer so FAB doesn't cover last content */}
          <View style={{ height: 100 }} />
        </View>
      </Animated.ScrollView>

      {/* ─── Transparent Header Overlay (appears on scroll) ──────────── */}
      <SafeAreaView style={styles.headerOverlay} edges={['top']}>
        <Animated.View style={[styles.headerBar, headerOverlayStyle]}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {photo.title}
          </Text>
          <View style={{ width: 40 }} />
        </Animated.View>
      </SafeAreaView>

      {/* Back button always visible (floating at top-left) */}
      <SafeAreaView style={styles.floatingBackSafeArea} edges={['top']}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.floatingBack}>
          <Text style={styles.floatingBackIcon}>←</Text>
        </TouchableOpacity>
      </SafeAreaView>

      {/* ─── Floating Action Button (Like) ───────────────────────────── */}
      {/*
       * The FAB is positioned fixed to the screen (not in ScrollView).
       * It stays at the bottom-right regardless of scroll position.
       * This is a common mobile UX pattern for primary actions.
       */}
      <Animated.View style={[styles.fab, fabAnimatedStyle]}>
        <TouchableOpacity
          onPress={handleFabLike}
          style={[styles.fabButton, isLiked && styles.fabButtonLiked]}
          activeOpacity={0.9}>
          <Text style={styles.fabIcon}>{isLiked ? '❤️' : '🤍'}</Text>
          <Text style={styles.fabLabel}>{isLiked ? 'Liked' : 'Like'}</Text>
        </TouchableOpacity>
      </Animated.View>

    </View>
  );
};

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  heroContainer: {
    height: HERO_CONTAINER_HEIGHT,
    overflow: 'hidden', // Clips the taller image — essential for parallax
  },
  heroImage: {
    width: SCREEN_WIDTH,
    height: HERO_HEIGHT, // Taller than container — gives parallax room
    top: 0,
  },
  heroGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: HERO_CONTAINER_HEIGHT * 0.5,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 16,
    backgroundColor: '#ffffff',
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  authorAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#4f46e5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
  },
  authorName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  authorSub: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    lineHeight: 30,
    textTransform: 'capitalize',
    letterSpacing: -0.3,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 14,
    padding: 16,
    marginBottom: 4,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
  },
  statLabel: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 2,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#e5e7eb',
  },
  divider: {
    height: 1,
    backgroundColor: '#f3f4f6',
    marginVertical: 18,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: { fontSize: 14, color: '#9ca3af', fontWeight: '500' },
  detailValue: { fontSize: 14, color: '#111827', fontWeight: '700' },
  descriptionBox: {
    backgroundColor: '#f9fafb',
    borderRadius: 14,
    padding: 16,
  },
  descriptionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#374151',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  descriptionText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 22,
  },
  // ─── Header overlay
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrow: { fontSize: 22, color: '#111827' },
  headerTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
  // ─── Floating back button (always visible over hero image)
  floatingBackSafeArea: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  floatingBack: {
    margin: 16,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingBackIcon: { fontSize: 18, color: '#fff' },
  // ─── FAB
  fab: {
    position: 'absolute',
    bottom: 36,
    right: 24,
  },
  fabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 30,
    backgroundColor: '#1a1a2e',
    gap: 8,
    // iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  fabButtonLiked: {
    backgroundColor: '#ef4444',
  },
  fabIcon: { fontSize: 20 },
  fabLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.3,
  },
});

export default DetailsScreen;
