import type { ComponentType } from 'react';
import * as Iconsax from 'iconsax-react-native';
import Svg, { Path } from 'react-native-svg';

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

export const Check: IconComponent = ({ size = 20, color = '#18181B', strokeWidth = 2 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M20 6 9 17l-5-5" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" /></Svg>
);
export const Bug: IconComponent = ({ size = 20, color = '#18181B', strokeWidth = 1.5 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M8 2l1.88 1.88M14.12 3.88 16 2M9 7.13v-1a3.003 3.003 0 1 1 6 0v1" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6ZM12 20v-9" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M6.53 9C4.6 8.8 3 7.1 3 5M6 13H2M3 21c0-2.1 1.7-3.9 3.8-4M20.97 5c0 2.1-1.6 3.8-3.5 4M22 13h-4M17.2 17c2.1.1 3.8 1.9 3.8 4" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
export const LinkedIn: IconComponent = ({ size = 20, color = '#18181B' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24"><Path fill={color} d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></Svg>
);
export const GitHub: IconComponent = ({ size = 20, color = '#18181B' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24"><Path fill={color} d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" /></Svg>
);
export const X: IconComponent = ({ size = 20, color = '#18181B', strokeWidth = 2 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M18 6 6 18M6 6l12 12" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" /></Svg>
);
