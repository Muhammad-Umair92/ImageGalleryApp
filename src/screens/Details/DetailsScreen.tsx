import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RootStackParamList } from '../../types';
import useAppDispatch from '../../hooks/useAppDispatch';
import useAppSelector from '../../hooks/useAppSelector';
import { toggleLike } from '../../redux/slices/imagesSlice';

type Props = NativeStackScreenProps<RootStackParamList, 'Details'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');
// Full-width hero image — square proportions for a clean layout
const IMAGE_HEIGHT = SCREEN_WIDTH;

const DetailsScreen = ({ route, navigation }: Props) => {
  // route.params is fully typed — TypeScript guarantees photo is type Photo
  // No optional chaining needed — params are always present for this screen
  const { photo } = route.params;

  const dispatch = useAppDispatch();

  // Re-renders ONLY when likedImages array changes — not on any other Redux update
  const likedImages = useAppSelector(state => state.images.likedImages);
  const isLiked = likedImages.includes(photo.id);

  const handleLikePress = useCallback(() => {
    dispatch(toggleLike(photo.id));
  }, [dispatch, photo.id]);

  // Entrance animation is now handled by Reanimated's sharedTransitionTag.
  // The thumbnail in ImageCard morphs into the hero image here automatically.
  // No manual useSharedValue/useAnimatedStyle needed for the image transition.

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      {/* ─── Custom Header ────────────────────────────────────────────── */}
      {/*
       * We built a custom header instead of using React Navigation's default.
       * This gives full control over layout, fonts, and the like button position.
       * headerShown: false was set in RootNavigator for all screens.
       */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Photo Details
        </Text>
        {/* Like button in header — tappable with accessible hit target */}
        <TouchableOpacity
          onPress={handleLikePress}
          style={styles.likeButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.likeIcon}>{isLiked ? '❤️' : '🤍'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        bounces={true}>

        {/* ─── Hero Image — Shared Element Transition Target ────────── */}
        {/*
         * sharedTransitionTag MUST match the tag on ImageCard's Animated.Image.
         * Both use `photo-image-${photo.id}` — Reanimated connects them.
         *
         * What happens on navigate('Details'):
         *   1. Reanimated measures ImageCard thumbnail bounding box (small, in grid)
         *   2. Reanimated measures this hero image bounding box (full width, top)
         *   3. A "ghost" image morphs from box A → box B over ~300ms
         *   4. Gallery thumbnail + hero image are hidden during the morph
         *   5. When complete, this hero image becomes visible
         *
         * On goBack() — the reverse: hero → thumbnail, seamless.
         */}
        <Animated.Image
          source={{ uri: `https://picsum.photos/seed/${photo.id}/600/600` }}
          style={styles.heroImage}
          resizeMode="cover"
          sharedTransitionTag={`photo-image-${photo.id}`}
        />

        {/* ─── Content ──────────────────────────────────────────────── */}
        <View style={styles.content}>

          {/* Like status badge */}
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

          {/* Title */}
          <Text style={styles.title}>{photo.title}</Text>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Details rows */}
          <View style={styles.detailsGrid}>
            <DetailRow label="Photo ID" value={`#${photo.id}`} />
            <DetailRow label="Album" value={`Album ${photo.album.id}`} />
            <DetailRow
              label="Status"
              value={isLiked ? 'In your liked photos' : 'Not liked yet'}
            />
            <DetailRow
              label="Image Source"
              value="picsum.photos (Unsplash)"
            />
          </View>

          {/* Description — in a real app this would come from the API */}
          <View style={styles.descriptionBox}>
            <Text style={styles.descriptionLabel}>About this photo</Text>
            <Text style={styles.descriptionText}>
              This photo is part of Album {photo.album.id}. It showcases a
              carefully curated image from the collection. The title "
              {photo.title}" reflects the theme and content captured in
              this piece.
            </Text>
          </View>

          {/* Like CTA button at bottom */}
          <TouchableOpacity
            style={[styles.likeActionButton, isLiked && styles.likeActionButtonActive]}
            onPress={handleLikePress}
            activeOpacity={0.85}>
            <Text style={styles.likeActionText}>
              {isLiked ? '❤️  Remove from Liked' : '🤍  Add to Liked'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// ─── Sub-component ─────────────────────────────────────────────────────────────
// Small presentational component — no state, no logic.
// Extracted to keep the main component clean and readable.
// This is what "separation of concerns" looks like at component level.
const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrow: {
    fontSize: 24,
    color: '#111827',
  },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginHorizontal: 8,
  },
  likeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  likeIcon: {
    fontSize: 22,
  },
  scroll: {
    flex: 1,
  },
  heroImage: {
    width: SCREEN_WIDTH,
    height: IMAGE_HEIGHT,
    backgroundColor: '#f3f4f6',
  },
  content: {
    padding: 24,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
  },
  badgeLiked: {
    backgroundColor: '#fef2f2',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
  badgeTextLiked: {
    color: '#ef4444',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    lineHeight: 28,
    textTransform: 'capitalize',
  },
  divider: {
    height: 1,
    backgroundColor: '#f3f4f6',
    marginVertical: 20,
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
  detailLabel: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '600',
  },
  descriptionBox: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  descriptionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  descriptionText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 22,
  },
  likeActionButton: {
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    marginBottom: 8,
  },
  likeActionButtonActive: {
    backgroundColor: '#fef2f2',
  },
  likeActionText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
  },
});

export default DetailsScreen;
