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
      // Animated.View wraps the whole card for the entrance animation
      <Animated.View style={[styles.cardWrapper, entranceStyle]}>
        <TouchableOpacity
          style={styles.card}
          onPress={onPress}
          activeOpacity={0.92}>

          {/* Full-bleed photo fills the entire card */}
          <Animated.Image
            source={{ uri: `https://picsum.photos/seed/${photo.id}/400/500` }}
            style={styles.image}
            resizeMode="cover"
            sharedTransitionTag={`photo-image-${photo.id}`}
          />

          {/*
           * LinearGradient overlay — transparent at top, dark at bottom.
           * This makes white text readable over any photo color.
           * Colors array: index 0 = top (transparent), index 1 = bottom (dark)
           * locations: [0, 1] maps to [top, bottom] of the gradient view
           */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.82)']}
            locations={[0.3, 1]}
            style={styles.gradient}>

            {/* Author name */}
            <View style={styles.textBlock}>
              <Text style={styles.author} numberOfLines={1}>
                {getAuthorName(photo)}
              </Text>
              <Text style={styles.title} numberOfLines={2}>
                {photo.title}
              </Text>
              {/* Likes row */}
              <View style={styles.likesRow}>
                <Text style={styles.likesCount}>
                  ❤️ {getLikesCount(photo.id).toLocaleString()}
                </Text>
              </View>
            </View>

            {/* Like button */}
            <TouchableOpacity
              onPress={onLikePress}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={styles.likeButton}>
              <Animated.Text style={[styles.heartEmoji, heartStyle]}>
                {isLiked ? '❤️' : '🤍'}
              </Animated.Text>
            </TouchableOpacity>
          </LinearGradient>

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
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 10,
    paddingBottom: 10,
    paddingTop: 40,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  textBlock: {
    flex: 1,
    marginRight: 6,
  },
  author: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.65)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  title: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
    lineHeight: 15,
    textTransform: 'capitalize',
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  likesRow: {
    marginTop: 4,
  },
  likesCount: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.75)',
    fontWeight: '600',
  },
  likeButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heartEmoji: {
    fontSize: 18,
  },
});

export default ImageCard;
