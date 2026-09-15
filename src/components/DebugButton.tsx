import { router, usePathname } from 'expo-router';
import { Bug } from '@/components/icons';
import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStores } from '@/hooks/useStores';
import { colors } from '@/theme/tokens';
import { GlassIconButton } from './GlassIconButton';
import { useReducedMotion } from '@/hooks/useReducedMotion';

const SIZE = 48;
const MARGIN = 8;

export const DebugFab = observer(function DebugFab() {
  const { settings } = useStores();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const reduced = useReducedMotion();
  const path = usePathname();

  const minX = MARGIN, maxX = width - SIZE - MARGIN;
  const minY = insets.top + MARGIN, maxY = height - insets.bottom - SIZE - MARGIN;
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
      const px = x.value + e.velocityX * 0.1, py = y.value + e.velocityY * 0.1;
      const dl = px - minX, dr = maxX - px, dt = py - minY, db = maxY - py;
      const min = Math.min(dl, dr, dt, db);
      const spring = (v: number) => (reduced ? v : withSpring(v, { damping: 18, stiffness: 180 }));
      const clampX = Math.min(Math.max(px, minX), maxX), clampY = Math.min(Math.max(py, minY), maxY);
      if (min === dl) { x.value = spring(minX); y.value = spring(clampY); }
      else if (min === dr) { x.value = spring(maxX); y.value = spring(clampY); }
      else if (min === dt) { y.value = spring(minY); x.value = spring(clampX); }
      else { y.value = spring(maxY); x.value = spring(clampX); }
    });
  const style = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }, { translateY: y.value }] }));

  if (!settings.developerMode) return null;
  return (
    <GestureDetector gesture={pan}>
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
