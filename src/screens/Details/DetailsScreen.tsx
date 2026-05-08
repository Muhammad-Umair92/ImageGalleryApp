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

          <View style={styles.badgeRow}>
            <View style={[styles.badge, isLiked && styles.badgeLiked]}>
              <Text style={[styles.badgeText, isLiked && styles.badgeTextLiked]}>
                {isLiked ? '❤️  Liked' : '🤍  Not Liked'}
              </Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Album #{photo.album.id}</Text>
            </View>
          </View>

          <Text style={styles.title}>{photo.title}</Text>

          <View style={styles.divider} />

          <View style={styles.detailsGrid}>
            <DetailRow label="Photo ID" value={`#${photo.id}`} />
            <DetailRow label="Album" value={`Album ${photo.album.id}`} />
            <DetailRow label="Status" value={isLiked ? 'Liked ✓' : 'Not liked'} />
            <DetailRow label="Source" value="picsum.photos" />
          </View>

          <View style={styles.descriptionBox}>
            <Text style={styles.descriptionLabel}>About</Text>
            <Text style={styles.descriptionText}>
              This photo belongs to Album {photo.album.id}. The title "
              {photo.title}" reflects the theme of this curated piece.
              Scroll up to see the parallax effect on the hero image.
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
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
    flexWrap: 'wrap',
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
  },
  badgeLiked: { backgroundColor: '#fef2f2' },
  badgeText: { fontSize: 12, fontWeight: '600', color: '#6b7280' },
  badgeTextLiked: { color: '#ef4444' },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    lineHeight: 30,
    textTransform: 'capitalize',
    letterSpacing: -0.3,
  },
  divider: {
    height: 1,
    backgroundColor: '#f3f4f6',
    marginVertical: 18,
  },
  detailsGrid: {
    gap: 12,
    marginBottom: 20,
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
