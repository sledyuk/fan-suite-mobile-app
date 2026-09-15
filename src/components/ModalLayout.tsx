import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, X } from 'lucide-react-native';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing } from '@/theme/tokens';
import { AppText } from './AppText';
import { IconButton } from './IconButton';

interface Props {
  title: string;
  subtitle?: string;
  onClose: () => void;
  /** When set, a leading back arrow is shown (modal-internal stack). */
  onBack?: () => void;
  /** Optional contained icon action rendered left of the close button (iOS 26 toolbar style). */
  action?: React.ReactNode;
  /** Set when the body should not scroll (e.g. it owns its own list). */
  scroll?: boolean;
  children: React.ReactNode;
}

/**
 * Shared chrome for every modal sheet in the app, following iOS 26 conventions:
 * left-aligned title (+ optional subtitle), icon-only contained buttons on the
 * right, spacious padded body, and content that fades under the header on scroll.
 */
export function ModalLayout({ title, subtitle, onClose, onBack, action, scroll = true, children }: Props) {
  const insets = useSafeAreaInsets();
  const body = scroll ? (
    <ScrollView
      contentContainerStyle={[styles.body, { paddingBottom: insets.bottom + spacing.xl }]}
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior="never"
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.body, { flex: 1, paddingBottom: insets.bottom + spacing.xl }]}>{children}</View>
  );

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        {onBack && (
          <IconButton accessibilityLabel="Back" size={36} onPress={onBack} style={styles.back}>
            <ArrowLeft size={20} color={colors.textPrimary} strokeWidth={2} />
          </IconButton>
        )}
        <View style={styles.titles}>
          <AppText variant="title" color={colors.textHeading} style={styles.title} numberOfLines={1}>{title}</AppText>
          {subtitle !== undefined && <AppText variant="caption" color={colors.textMuted} numberOfLines={1}>{subtitle}</AppText>}
        </View>
        {action}
        <IconButton accessibilityLabel="Close" size={36} onPress={onClose} style={styles.close}>
          <X size={18} color={colors.bg} strokeWidth={2.5} />
        </IconButton>
      </View>
      <View style={styles.bodyWrap}>
        {body}
        <LinearGradient colors={[colors.bg, 'rgba(255,255,255,0)']} style={styles.fade} pointerEvents="none" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  header: { minHeight: 60, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
  titles: { flex: 1 },
  title: { fontSize: 20, lineHeight: 26 },
  close: { backgroundColor: colors.textSecondary, borderRadius: 18 },
  back: { marginLeft: -spacing.sm },
  bodyWrap: { flex: 1 },
  body: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, gap: spacing.lg },
  fade: { position: 'absolute', top: 0, left: 0, right: 0, height: 16 },
});
