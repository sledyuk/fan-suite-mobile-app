import { BadgeCheck, Layers } from 'lucide-react-native';
import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/AppText';
import { Avatar } from '@/components/Avatar';
import { Checkbox } from '@/components/Checkbox';
import type { Participant } from '@/services/mock/participants';
import type { Suite } from '@/services/mock/suites';
import { colors, radii, spacing } from '@/theme/tokens';

type Props =
  | { kind: 'suite'; suite: Suite; selected: boolean; onToggle: () => void }
  | { kind: 'fan'; id: string; fan: Participant; selected: boolean; onToggle: () => void };

/** Bordered 64pt card row with a leading checkbox; selected = primary border + tint (Figma). */
export const PickerRow = memo(function PickerRow(props: Props) {
  const { selected, onToggle } = props;
  const label = props.kind === 'suite' ? `${props.suite.name}, ${props.suite.fanCount} fans` : `${props.fan.name} ${props.fan.handle}`;
  return (
    <Pressable
      onPress={onToggle}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={label}
      style={({ pressed }) => [styles.card, selected && styles.selected, pressed && styles.pressed]}
    >
      <Checkbox checked={selected} />
      {props.kind === 'suite' ? (
        <>
          <View style={styles.suiteIcon}><Layers size={20} color={colors.textPrimary} strokeWidth={2} /></View>
          <View style={styles.body}>
            <AppText variant="name">{props.suite.name}</AppText>
            <AppText variant="caption" color={colors.textMuted}>{props.suite.fanCount.toLocaleString()} fans</AppText>
          </View>
        </>
      ) : (
        <>
          <Avatar source={props.fan.avatar} name={props.fan.name} size={40} />
          <View style={styles.body}>
            <View style={styles.nameLine}>
              <AppText variant="name" numberOfLines={1} style={styles.name}>{props.fan.name}</AppText>
              {props.fan.verified && <BadgeCheck size={16} color={colors.verified} fill={colors.verified} strokeWidth={2} stroke={colors.bg} />}
            </View>
            <AppText variant="caption" color={colors.textMuted}>{props.fan.handle}</AppText>
          </View>
        </>
      )}
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: { minHeight: 64, borderWidth: 1, borderColor: colors.border, borderRadius: radii.lg, paddingHorizontal: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.bg },
  selected: { borderColor: colors.primary, backgroundColor: '#F7F7FD' },
  pressed: { opacity: 0.85 },
  suiteIcon: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  body: { flex: 1 },
  nameLine: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  name: { flexShrink: 1 },
});
