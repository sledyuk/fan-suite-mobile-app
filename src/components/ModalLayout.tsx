import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, X } from '@/components/icons';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing } from '@/theme/tokens';
import { AppText } from './AppText';
import { IconButton } from './IconButton';

interface Props {
  title: string;
  subtitle?: string;
  onClose: () => void;
  onBack?: () => void;
  action?: React.ReactNode;
  scroll?: boolean;
  fitContent?: boolean;
  bodyGap?: number;
  appIcon?: boolean;
  children: React.ReactNode;
}

export function ModalLayout({ title, subtitle, onClose, onBack, action, scroll = true, fitContent = false, bodyGap = spacing.xl, appIcon, children }: Props) {
  const insets = useSafeAreaInsets();
  const body = scroll ? (
    <ScrollView
      contentContainerStyle={[styles.body, { gap: bodyGap, paddingBottom: insets.bottom + spacing.xl }]}
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior="never"
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.body, !fitContent && styles.flexBody, { gap: bodyGap, paddingBottom: insets.bottom + spacing.xl }]}>{children}</View>
  );

  return (
    <View style={[styles.screen, fitContent && styles.contentSized]}>
      <View style={styles.header}>
        {onBack && (
          <IconButton accessibilityLabel="Back" size={36} onPress={onBack} style={styles.back}>
            <ArrowLeft size={20} color={colors.textPrimary} strokeWidth={2} />
          </IconButton>
        )}
        {appIcon && <Image source={require('@/assets/images/icon.png')} style={styles.appIcon} />}
        <View style={styles.titles}>
          <AppText variant="title" color={colors.textHeading} style={styles.title} numberOfLines={1}>{title}</AppText>
          {subtitle !== undefined && <AppText variant="caption" color={colors.textMuted} numberOfLines={1}>{subtitle}</AppText>}
        </View>
        {action}
        <IconButton accessibilityLabel="Close" size={36} onPress={onClose} style={styles.close}>
          <X size={18} color={colors.textMuted} strokeWidth={2.5} />
        </IconButton>
      </View>
      <View style={[styles.bodyWrap, fitContent && styles.contentSized]}>
        {body}
        <LinearGradient colors={[colors.bg, 'rgba(255,255,255,0)']} style={styles.fade} pointerEvents="none" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  contentSized: { flexGrow: 0 },
  header: { minHeight: 60, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
  titles: { flex: 1 },
  title: { fontSize: 20, lineHeight: 26 },
  close: { backgroundColor: '#F2F2F7', borderRadius: 18 },
  appIcon: { width: 44, height: 44, borderRadius: 22 },
  back: { marginLeft: -spacing.sm },
  bodyWrap: { flex: 1 },
  flexBody: { flex: 1 },
  body: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, gap: spacing.xl },
  fade: { position: 'absolute', top: 0, left: 0, right: 0, height: 16 },
});
