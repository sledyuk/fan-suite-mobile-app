import { NativeTabs } from "expo-router/unstable-native-tabs";
import { observer } from "mobx-react-lite";
import { useStores } from "@/hooks/useStores";
import { colors } from "@/theme/tokens";

/**
 * Native tab bar. Icons are Iconsax glyphs rendered to template PNGs by
 * `scripts/render-tab-icons.mjs` (Linear = default, Bold = selected); the
 * search tab keeps the system glyph so iOS 26 can morph it into the search field.
 * On iOS 26 it is Liquid Glass, minimizes while scrolling down,
 * and the `search` role splits into its own glass button on the right.
 */
const TabsLayout = observer(function TabsLayout() {
  const unread = useStores().demo.unreadTotal;
  return (
    <NativeTabs
      minimizeBehavior="onScrollDown"
      tintColor={colors.primary}
      labelStyle={{ selected: { color: colors.primary } }}
    >
      <NativeTabs.Trigger name="dashboard">
        <NativeTabs.Trigger.Label>Dashboard</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon src={{ default: require("@/assets/icons/tabs/dashboard.png"), selected: require("@/assets/icons/tabs/dashboard-selected.png") }} />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="messages">
        <NativeTabs.Trigger.Label>Messages</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon src={{ default: require("@/assets/icons/tabs/messages.png"), selected: require("@/assets/icons/tabs/messages-selected.png") }} />
        {unread > 0 && <NativeTabs.Trigger.Badge>{String(unread)}</NativeTabs.Trigger.Badge>}
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="wallet">
        <NativeTabs.Trigger.Label>Wallet</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon src={{ default: require("@/assets/icons/tabs/wallet.png"), selected: require("@/assets/icons/tabs/wallet-selected.png") }} />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="more">
        <NativeTabs.Trigger.Label>More</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon src={{ default: require("@/assets/icons/tabs/more.png"), selected: require("@/assets/icons/tabs/more-selected.png") }} />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="search" role="search">
        <NativeTabs.Trigger.Label>Search</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="magnifyingglass" md="search" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
});

export default TabsLayout;
