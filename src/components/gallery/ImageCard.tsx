import React, { useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
} from 'react-native-reanimated';
import { Photo } from '../../types';

// Card width = half screen width minus outer padding (24px each side)
// and half the gap between columns (8px)
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 48 - 16) / 2;

interface ImageCardProps {
  photo: Photo;
  isLiked: boolean;
  onPress: () => void;
  onLikePress: () => void;
}

// React.memo wraps the component in a memoization layer.
// Before re-rendering, it shallowly compares all props.
// If photo, isLiked, onPress, onLikePress are all the same reference → skip re-render.
// This is why onPress and onLikePress MUST be stable references (useCallback in parent).
// If you pass inline arrow functions, memo is useless — new function = new reference every time.
const ImageCard = React.memo(
  ({ photo, isLiked, onPress, onLikePress }: ImageCardProps) => {
    // ─── Animation Setup ───────────────────────────────────────────────
    // useSharedValue lives on BOTH JS thread and UI thread.
    // Updating it from JS is instant — no bridge, no overhead.
    const scale = useSharedValue(1);

    // useAnimatedStyle runs on the UI thread as a worklet.
    // It reads scale (a shared value) and returns a style object.
    // Every frame: UI thread reads scale → applies transform → renders.
    // Zero JS thread involvement after the animation starts.
    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    // When isLiked changes, trigger the heart pop animation.
    // withSequence chains animations: pop to 1.4 → spring back to 1.0
    // withSpring uses a physics-based spring curve (no duration needed —
    // spring settles naturally based on mass, damping, stiffness).
    useEffect(() => {
      if (isLiked) {
        // Pop up to 1.4x scale, then spring back to normal
        scale.value = withSequence(
          withSpring(1.4, { damping: 4, stiffness: 300 }),
          withSpring(1.0, { damping: 6, stiffness: 200 }),
        );
      } else {
        // Shrink slightly on unlike, then spring back
        scale.value = withSequence(
          withSpring(0.75, { damping: 4, stiffness: 300 }),
          withSpring(1.0, { damping: 6, stiffness: 200 }),
        );
      }
    }, [isLiked, scale]);

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={onPress}
        activeOpacity={0.9}>
        {/*
         * via.placeholder.com (the API's default) is blocked in iOS simulator.
         * picsum.photos/seed/:id gives a consistent REAL photo for each ID.
         * Using photo.id as the seed means photo #5 always shows the same image.
         * In production with a real API, you'd use the actual URL from the database.
         */}
        <Image
          source={{ uri: `https://picsum.photos/seed/${photo.id}/300/300` }}
          style={styles.image}
          resizeMode="cover"
        />

        {/* Like button — absolutely positioned over the image */}
        <TouchableOpacity
          style={styles.likeButton}
          onPress={onLikePress}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          {/*
           * Animated.View is Reanimated's wrapper for native animated components.
           * animatedStyle connects this view to the UI-thread worklet.
           * The scale transform runs entirely on the UI thread — 60fps guaranteed.
           */}
          <Animated.View style={animatedStyle}>
            <Text style={styles.likeIcon}>{isLiked ? '❤️' : '🤍'}</Text>
          </Animated.View>
        </TouchableOpacity>

        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={1}>
            {photo.title}
          </Text>
        </View>
      </TouchableOpacity>
    );
  },
);

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 16,
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    // Elevation for Android
    elevation: 3,
  },
  image: {
    width: '100%',
    height: CARD_WIDTH,
  },
  likeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  likeIcon: {
    fontSize: 16,
  },
  info: {
    padding: 10,
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
});

export default ImageCard;
