import { NativeTabs } from "expo-router/unstable-native-tabs";

const PRIMARY_COLOR = "#5863DE";

export default function TabsLayout() {
  return (
    <NativeTabs
      disableTransparentOnScrollEdge
      tintColor={PRIMARY_COLOR}
      labelStyle={{ selected: { color: PRIMARY_COLOR } }}
    >
      <NativeTabs.Trigger name="dashboard/index">
        <NativeTabs.Trigger.Label>Dashboard</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: "house", selected: "house.fill" }}
          md={{ default: "home", selected: "home" }}
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="chats">
        <NativeTabs.Trigger.Label>Chats</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: "bubble.left", selected: "bubble.left.fill" }}
          md={{ default: "chat_bubble_outline", selected: "chat_bubble" }}
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="wallet/index">
        <NativeTabs.Trigger.Label>Wallet</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: "wallet.pass", selected: "wallet.pass.fill" }}
          md={{ default: "account_balance_wallet", selected: "account_balance_wallet" }}
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="more/index">
        <NativeTabs.Trigger.Label>More</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: "ellipsis.circle", selected: "ellipsis.circle.fill" }}
          md={{ default: "more_horiz", selected: "more_horiz" }}
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
