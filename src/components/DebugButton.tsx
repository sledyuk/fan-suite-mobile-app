import { router, usePathname } from 'expo-router';
import { Bug } from '@/components/icons';
import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStores } from '@/hooks/useStores';
import { colors } from '@/theme/tokens';
import { GlassIconButton } from './GlassIconButton';
import { useReducedMotion } from '@/hooks/useReducedMotion';

const SIZE = 48;
/** How much of the bubble may hide beyond the screen edge when tucked away. */
const TUCK = Math.round(SIZE * 0.45);

/**
 * Floating debug bubble, like Expo's dev-tools button: drag it anywhere, it
 * snaps to the nearest of the four edges and tucks ~45% off-screen there so it
 * never blocks content. Tap opens the
 * debug sheet with the open thread's id. Shown while More → Developer mode is on.
 */
export const DebugFab = observer(function DebugFab() {
  const { settings } = useStores();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const reduced = useReducedMotion();
  const path = usePathname();

  const minX = -TUCK, maxX = width - SIZE + TUCK;                                // may sit partly off-screen on any edge
  const minY = -TUCK, maxY = height - SIZE + TUCK;
  const x = useSharedValue(maxX);
  const y = useSharedValue(maxY - 220);
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);

  useEffect(() => { x.value = Math.min(x.value, maxX); y.value = Math.min(Math.max(y.value, minY), maxY); }, [maxX, minY, maxY, x, y]);

  const open = () => {
    const chatId = path.startsWith('/chat/') ? path.slice('/chat/'.length) : undefined;
    router.push({ pathname: '/dev', params: chatId ? { chatId } : {} });
  };

  const pan = Gesture.Pan()
    .onStart(() => { startX.value = x.value; startY.value = y.value; })
    .onUpdate((e) => {
      x.value = Math.min(Math.max(startX.value + e.translationX, minX), maxX);
      y.value = Math.min(Math.max(startY.value + e.translationY, minY), maxY);
    })
    .onEnd((e) => {
      // Snap to the nearest of the four edges, carrying a little of the fling.
      const px = x.value + e.velocityX * 0.1, py = y.value + e.velocityY * 0.1;
      const dl = px - minX, dr = maxX - px, dt = py - minY, db = maxY - py;
      const min = Math.min(dl, dr, dt, db);
      const spring = (v: number) => (reduced ? v : withSpring(v, { damping: 18, stiffness: 180 }));
      if (min === dl) { x.value = spring(minX); y.value = spring(Math.min(Math.max(py, insets.top), height - insets.bottom - SIZE)); }
      else if (min === dr) { x.value = spring(maxX); y.value = spring(Math.min(Math.max(py, insets.top), height - insets.bottom - SIZE)); }
      else if (min === dt) { y.value = spring(minY); x.value = spring(Math.min(Math.max(px, 0), width - SIZE)); }
      else { y.value = spring(maxY); x.value = spring(Math.min(Math.max(px, 0), width - SIZE)); }
    });
  const tap = Gesture.Tap().onEnd(() => runOnJS(open)());
  const gesture = Gesture.Exclusive(pan, tap);

  const style = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }, { translateY: y.value }] }));

  if (!settings.developerMode) return null;
  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.fab, style]} pointerEvents="box-none">
        <GlassIconButton size={SIZE} accessibilityLabel="Debug controls. Drag to move." onPress={open} style={styles.shadow}>
          <Bug size={22} color={colors.textPrimary} strokeWidth={2} />
        </GlassIconButton>
      </Animated.View>
    </GestureDetector>
  );
});

const styles = StyleSheet.create({
  fab: { position: 'absolute', left: 0, top: 0 },
  shadow: { shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 6 },
});
