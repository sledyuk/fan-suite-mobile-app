import type { ComponentType } from 'react';
import * as Iconsax from 'iconsax-react-native';
import Svg, { Path } from 'react-native-svg';

/**
 * Icon set: Iconsax (the family used in the FanSuite Figma), Linear by default.
 * Components keep the prop names the app already used (size, color, fill) so
 * call sites read the same. `fill` switches to the Bold variant.
 */
export interface IconProps { size?: number; color?: string; strokeWidth?: number; fill?: string; variant?: 'Linear' | 'Bold' | 'Outline' | 'Broken' | 'Bulk' | 'TwoTone'; stroke?: string }
export type IconComponent = ComponentType<IconProps>;

function wrap(Base: Iconsax.Icon): IconComponent {
  return function Icon({ size = 20, color = '#18181B', fill, variant, strokeWidth: _sw, stroke: _st, ...rest }: IconProps) {
    return <Base size={size} color={color} variant={variant ?? (fill ? 'Bold' : 'Linear')} {...rest} />;
  };
}

export const Sparkles: IconComponent = wrap(Iconsax.Magicpen);
export const Send: IconComponent = wrap(Iconsax.Send2);
export const RefreshCw: IconComponent = wrap(Iconsax.Refresh2);
export const Plus: IconComponent = wrap(Iconsax.Add);
export const Mail: IconComponent = wrap(Iconsax.Sms);
export const MailOpen: IconComponent = wrap(Iconsax.MessageText1);
export const Gift: IconComponent = wrap(Iconsax.Gift);
export const Clock: IconComponent = wrap(Iconsax.Clock);
export const ChevronRight: IconComponent = wrap(Iconsax.ArrowRight2);
export const Bug: IconComponent = wrap(Iconsax.Code);
export const Bell: IconComponent = wrap(Iconsax.Notification);
export const BellOff: IconComponent = wrap(Iconsax.NotificationBing);
export const ArrowLeft: IconComponent = wrap(Iconsax.ArrowLeft2);
export const AlertCircle: IconComponent = wrap(Iconsax.Danger);
export const WifiOff: IconComponent = wrap(Iconsax.WifiSquare);
export const Wallet: IconComponent = wrap(Iconsax.Wallet2);
export const Trash2: IconComponent = wrap(Iconsax.Trash);
export const Star: IconComponent = wrap(Iconsax.Star1);
export const Shield: IconComponent = wrap(Iconsax.ShieldTick);
export const Search: IconComponent = wrap(Iconsax.SearchNormal1);
export const RotateCcw: IconComponent = wrap(Iconsax.Refresh2);
export const Pin: IconComponent = wrap(Iconsax.Flag);
export const PinOff: IconComponent = wrap(Iconsax.Flag);
export const Pencil: IconComponent = wrap(Iconsax.Edit2);
export const MessageCircle: IconComponent = wrap(Iconsax.Message);
export const MapPin: IconComponent = wrap(Iconsax.Location);
export const Lock: IconComponent = wrap(Iconsax.Lock1);
export const Layers: IconComponent = wrap(Iconsax.Layer);
export const Info: IconComponent = wrap(Iconsax.InfoCircle);
export const Heart: IconComponent = wrap(Iconsax.Heart);
export const CircleHelp: IconComponent = wrap(Iconsax.MessageQuestion);
export const Banknote: IconComponent = wrap(Iconsax.Bank);
export const BadgeCheck: IconComponent = wrap(Iconsax.Verify);
export const ArrowUpRight: IconComponent = wrap(Iconsax.MoneySend);
export const ArrowRight: IconComponent = wrap(Iconsax.ArrowRight2);
export const ArrowDownLeft: IconComponent = wrap(Iconsax.MoneyRecive);
export const SlidersHorizontal: IconComponent = wrap(Iconsax.Setting4);
export const SquarePen: IconComponent = wrap(Iconsax.Edit2);
export const LayoutDashboard: IconComponent = wrap(Iconsax.Element3);

export const Slash: IconComponent = wrap(Iconsax.Slash);
export const MessageNotif: IconComponent = wrap(Iconsax.MessageNotif);
export const Cpu: IconComponent = wrap(Iconsax.Cpu);
export const Timer: IconComponent = wrap(Iconsax.TimerStart);
export const Wifi: IconComponent = wrap(Iconsax.Wifi);
export const Lamp: IconComponent = wrap(Iconsax.Lamp);

export const Play: IconComponent = wrap(Iconsax.Play);
export const Gallery: IconComponent = wrap(Iconsax.Gallery);
export const Video: IconComponent = wrap(Iconsax.Video);

/** Plain check mark (checkbox, delivered). Iconsax only ships ticks inside shapes. */
export const Check: IconComponent = ({ size = 20, color = '#18181B', strokeWidth = 2 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M20 6 9 17l-5-5" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" /></Svg>
);
/** Plain close mark for round close buttons. */
export const X: IconComponent = ({ size = 20, color = '#18181B', strokeWidth = 2 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M18 6 6 18M6 6l12 12" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" /></Svg>
);
