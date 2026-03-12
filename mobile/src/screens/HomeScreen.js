import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, Alert } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const MENU_ITEMS = [
  { key: "SALES_INVOICES", label: "Sales Invoices", icon: "file-chart-outline" },
  { key: "PURCHASE_ORDERS", label: "Purchase Order", icon: "cart-arrow-down" },
  { key: "SHIPMENTS", label: "Shipments", icon: "truck-delivery-outline" },
  { key: "PAYMENTS_RECEIPTS", label: "Payments & Receipts", icon: "cash-multiple" },
  { key: "EXPENSES", label: "Expenses", icon: "cash-minus" },
  { key: "low_stocks", label: "Low Stocks", icon: "alert-outline" },
  { key: "CATEGORIES", label: "Categories", icon: "view-grid-outline" },
  { key: "products", label: "Products", icon: "view-list-outline" },
  { key: "CUSTOMERS", label: "Customer", icon: "account-group-outline" },
  { key: "VENDORS", label: "Vendor", icon: "account-tie-outline" },
  { key: "receipt_settings", label: "Receipt Settings", icon: "receipt" },
  { key: "SUMMARY", label: "Summary", icon: "chart-bar" },
  { key: "sales_order", label: "Sales Order", icon: "briefcase-outline" },
  { key: "cash_ledger", label: "Cash Ledger", icon: "swap-vertical" },
  { key: "more", label: "More", icon: "dots-horizontal" },
];

export function HomeScreen({ onNavigateTab, onOpenSection }) {
  const today = new Date();
  const formattedDate = today.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "long",
    year: "numeric",
    weekday: "long",
  });

  const handlePress = (key) => {
    if (key === "products" || key === "low_stocks") {
      if (onNavigateTab) onNavigateTab("CATALOGUE");
      return;
    }

    if (key === "sales_order" || key === "cash_ledger" || key === "receipt_settings" || key === "more") {
      Alert.alert("Coming soon", "This screen will be available soon.");
      return;
    }

    if (onOpenSection && typeof onOpenSection === "function") {
      onOpenSection(key);
      return;
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.menuItem} onPress={() => handlePress(item.key)}>
      <View style={styles.menuIconWrapper}>
        <MaterialCommunityIcons name={item.icon} size={22} color="#1f1645" />
      </View>
      <Text style={styles.menuLabel}>{item.label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.heroCard}>
        <View style={styles.heroAvatarWrapper}>
          <Image
            source={require("../../assets/logo.png")}
            style={styles.heroAvatar}
            resizeMode="cover"
          />
        </View>
        <Text style={styles.heroTitle}>MC-POS</Text>
        <Text style={styles.heroDate}>{formattedDate}</Text>
      </View>
      <View style={styles.menuCard}>
        <FlatList
          data={MENU_ITEMS}
          numColumns={3}
          keyExtractor={(item) => item.key}
          renderItem={renderItem}
          scrollEnabled={false}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
    paddingHorizontal: 16,
    paddingTop: 18,
  },
  heroCard: {
    borderRadius: 22,
    backgroundColor: "#101028",
    paddingVertical: 24,
    alignItems: "center",
    marginBottom: 16,
  },
  heroAvatarWrapper: {
    width: 96,
    height: 96,
    borderRadius: 48,
    overflow: "hidden",
    marginBottom: 12,
    backgroundColor: "#ffffff",
  },
  heroAvatar: {
    width: "100%",
    height: "100%",
  },
  heroTitle: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  heroDate: {
    marginTop: 4,
    color: "#d0d0f5",
    fontSize: 12,
  },
  menuCard: {
    flex: 1,
    borderRadius: 22,
    backgroundColor: "#ffffff",
    paddingVertical: 14,
    paddingHorizontal: 8,
  },
  menuItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 14,
  },
  menuIconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#f1f1ff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  menuLabel: {
    textAlign: "center",
    fontSize: 11,
    color: "#222222",
  },
});
