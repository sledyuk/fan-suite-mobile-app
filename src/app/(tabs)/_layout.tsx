import { NativeTabs } from "expo-router/unstable-native-tabs";
import { observer } from "mobx-react-lite";
import { useStores } from "@/hooks/useStores";
import { colors } from "@/theme/tokens";

/**
 * Native tab bar. On iOS 26 it is Liquid Glass, minimizes while scrolling down,
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
        <NativeTabs.Trigger.Icon sf={{ default: "house", selected: "house.fill" }} md={{ default: "home", selected: "home" }} />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="chats">
        <NativeTabs.Trigger.Label>Chats</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: "bubble.left", selected: "bubble.left.fill" }} md={{ default: "chat_bubble_outline", selected: "chat_bubble" }} />
        {unread > 0 && <NativeTabs.Trigger.Badge>{String(unread)}</NativeTabs.Trigger.Badge>}
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="wallet">
        <NativeTabs.Trigger.Label>Wallet</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: "wallet.pass", selected: "wallet.pass.fill" }} md={{ default: "account_balance_wallet", selected: "account_balance_wallet" }} />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="more">
        <NativeTabs.Trigger.Label>More</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: "ellipsis.circle", selected: "ellipsis.circle.fill" }} md={{ default: "more_horiz", selected: "more_horiz" }} />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="search" role="search">
        <NativeTabs.Trigger.Label>Search</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="magnifyingglass" md="search" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
});

export default TabsLayout;
