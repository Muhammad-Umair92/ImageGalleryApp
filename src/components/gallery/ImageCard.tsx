import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import { Photo } from '../../types';
import { getLikesCount, getAuthorName } from '../../utils/photoUtils';

// Module-level Set — persists for the entire app session, survives component
// unmount/remount cycles. When FlatList recycles an item (scrolled out of
// windowSize → remounted), we check this Set. If the photo already animated,
// skip straight to final state — no blank delay on scroll-back.
const animatedPhotoIds = new Set<string>();

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 48 - 12) / 2;
const CARD_HEIGHT = CARD_WIDTH * 1.25;
const ROW_HEIGHT = CARD_HEIGHT + 12; // card height + marginBottom — used for getItemLayout

// Export for FlatList getItemLayout calculation in GalleryScreen
export { ROW_HEIGHT };

interface ImageCardProps {
  photo: Photo;
  isLiked: boolean;
  onPress: () => void;
  onLikePress: () => void;
  index: number; // Used to stagger the entrance animation
}

const ImageCard = React.memo(
  ({ photo, isLiked, onPress, onLikePress, index }: ImageCardProps) => {

    // ─── Staggered Entrance Animation ──────────────────────────────────
    // Check module-level Set BEFORE initializing shared values.
    // If this photo already animated this session → start at final state (no delay).
    // If not → start hidden, animate in with stagger, then record in Set.
    // via.placeholder.com (the API's thumbnailUrl host) returns solid-color squares —
    // a valid HTTP 200, so onError never fires. Use picsum directly as primary.
    // seed=photo.id ensures the same image renders consistently for each photo.
    const imageUri = `https://picsum.photos/seed/${photo.id}/400/500`;

    const alreadyAnimated = animatedPhotoIds.has(photo.id);

    const translateY = useSharedValue(alreadyAnimated ? 0 : 60);
    const opacity = useSharedValue(alreadyAnimated ? 1 : 0);

    const entranceStyle = useAnimatedStyle(() => ({
      transform: [{ translateY: translateY.value }],
      opacity: opacity.value,
    }));

    useEffect(() => {
      if (alreadyAnimated) return; // Skip — already played this session
      animatedPhotoIds.add(photo.id); // Mark as animated before async delay
      const delay = Math.min(index * 70, 400); // Cap at 400ms so last cards don't wait forever
      translateY.value = withDelay(delay, withSpring(0, { damping: 14, stiffness: 120 }));
      opacity.value = withDelay(delay, withTiming(1, { duration: 300 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ─── Like Heart Animation ───────────────────────────────────────────
    const heartScale = useSharedValue(1);
    const heartStyle = useAnimatedStyle(() => ({
      transform: [{ scale: heartScale.value }],
    }));

    useEffect(() => {
      if (isLiked) {
        heartScale.value = withSequence(
          withSpring(1.5, { damping: 3, stiffness: 400 }),
          withSpring(1.0, { damping: 5, stiffness: 200 }),
        );
      } else {
        heartScale.value = withSequence(
          withSpring(0.6, { damping: 3, stiffness: 400 }),
          withSpring(1.0, { damping: 5, stiffness: 200 }),
        );
      }
    }, [isLiked, heartScale]);

    return (
      <Animated.View style={[styles.cardWrapper, entranceStyle]}>
        <TouchableOpacity
          style={styles.card}
          onPress={onPress}
          activeOpacity={0.92}>

          {/* Layer 1 — Full-bleed photo (picsum.photos, seeded by photo.id) */}
          <Animated.Image
            source={{ uri: imageUri }}
            style={styles.image}
            resizeMode="cover"
            sharedTransitionTag={`photo-image-${photo.id}`}
          />

          {/*
           * Layer 2 — Bottom gradient with text (column layout).
           * Gradient flows: transparent → semi-dark → very dark.
           * Text stacks vertically: author → title → likes.
           * This is a pure column layout — no flex tricks that could clip content.
           */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.65)', 'rgba(0,0,0,0.95)']}
            locations={[0, 0.4, 1]}
            style={styles.gradient}>
            <View style={styles.metaContainer}>
              <View style={styles.metaRow}>
                <Text style={styles.author} numberOfLines={1}>
                  {getAuthorName(photo)}
                </Text>
                <Text style={styles.likesCount}>
                  {getLikesCount(photo.id).toLocaleString()} likes
                </Text>
              </View>
              <Text style={styles.title} numberOfLines={1}>
                {photo.title}
              </Text>
            </View>
          </LinearGradient>

          {/*
           * Layer 3 — Like button: absolutely positioned top-right.
           * Separated from the gradient so it is ALWAYS visible.
           * Circular frosted background ensures readability over any image.
           */}
          <TouchableOpacity
            onPress={onLikePress}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.likeButton}>
            <Animated.Text style={[styles.heartEmoji, heartStyle]}>
              {isLiked ? '❤️' : '🤍'}
            </Animated.Text>
          </TouchableOpacity>

        </TouchableOpacity>
      </Animated.View>
    );
  },
);

const styles = StyleSheet.create({
  cardWrapper: {
    width: CARD_WIDTH,
    marginBottom: 12,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#e5e7eb',
    // iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    // Android elevation
    elevation: 6,
  },
  image: {
    ...StyleSheet.absoluteFill, // Fills entire card (position absolute, all edges 0)
  },
  gradient: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'flex-end',
  },
  metaContainer: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    minHeight: 62,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  author: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.78)',
    textTransform: 'uppercase',
    letterSpacing: 1.1,
    flex: 1,
    marginRight: 6,
  },
  title: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
    lineHeight: 16,
  },
  likesCount: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
  },
  // Absolutely positioned heart button — top-right corner of card
  likeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heartEmoji: {
    fontSize: 16,
  },
});

export default ImageCard;
