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

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 48 - 12) / 2;
// Taller card for a richer look — 1.25 aspect ratio
const CARD_HEIGHT = CARD_WIDTH * 1.25;

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
    // Each card starts 60px below its final position, invisible.
    // withDelay staggers based on index: card 0 animates immediately,
    // card 1 waits 70ms, card 2 waits 140ms etc.
    // This "waterfall" effect makes the gallery feel alive on first load.
    const translateY = useSharedValue(60);
    const opacity = useSharedValue(0);

    const entranceStyle = useAnimatedStyle(() => ({
      transform: [{ translateY: translateY.value }],
      opacity: opacity.value,
    }));

    useEffect(() => {
      const delay = index * 70; // 70ms stagger between each card
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
            colors={['transparent', 'rgba(0,0,0,0.75)']}
            locations={[0.35, 1]}
            style={styles.gradient}>

            {/* Title overlaid on gradient — always readable */}
            <Text style={styles.title} numberOfLines={2}>
              {photo.title}
            </Text>

            {/* Like button inside the gradient row */}
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
    paddingTop: 32,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  title: {
    flex: 1,
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
    lineHeight: 15,
    textTransform: 'capitalize',
    marginRight: 6,
    // Text shadow for extra legibility on light photos
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
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
