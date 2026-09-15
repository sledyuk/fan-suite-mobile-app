import { NativeTabs } from "expo-router/unstable-native-tabs";
import { observer } from "mobx-react-lite";
import { useStores } from "@/hooks/useStores";
import { colors } from "@/theme/tokens";

/**
 * Native tab bar. Icons are the Figma glyphs (assets/icons/tabs/src) rendered to
 * template PNGs by `scripts/render-tab-icons.mjs`; the tab bar tints them for the
 * selected state. The search tab keeps the system glyph so iOS 26 can morph it.
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
        <NativeTabs.Trigger.Icon src={require("@/assets/icons/tabs/dashboard.png")} renderingMode="template" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="wallet">
        <NativeTabs.Trigger.Label>Wallet</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon src={require("@/assets/icons/tabs/wallet.png")} renderingMode="template" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="messages">
        <NativeTabs.Trigger.Label>Messages</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon src={require("@/assets/icons/tabs/messages.png")} renderingMode="template" />
        {unread > 0 && <NativeTabs.Trigger.Badge>{String(unread)}</NativeTabs.Trigger.Badge>}
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="more">
        <NativeTabs.Trigger.Label>More</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon src={require("@/assets/icons/tabs/more.png")} renderingMode="template" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="search" role="search">
        <NativeTabs.Trigger.Label>Search</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="magnifyingglass" md="search" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
});

export default TabsLayout;
