import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Image } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { HomeScreen } from "./src/screens/HomeScreen";
import { PosScreen } from "./src/screens/ScannerScreen";
import { CatalogueScreen } from "./src/screens/CatalogueScreen";
import { SalesInvoicesScreen } from "./src/screens/SalesInvoicesScreen";
import { PurchaseOrdersScreen } from "./src/screens/PurchaseOrdersScreen";
import { ShipmentsScreen } from "./src/screens/ShipmentsScreen";
import { PaymentsReceiptsScreen } from "./src/screens/PaymentsReceiptsScreen";
import { ExpensesScreen } from "./src/screens/ExpensesScreen";
import { CategoriesScreen } from "./src/screens/CategoriesScreen";
import { VendorsScreen } from "./src/screens/VendorsScreen";
import { CustomersScreen } from "./src/screens/CustomersScreen";
import { SummaryScreen } from "./src/screens/SummaryScreen";

const TABS = {
  HOME: "HOME",
  POS: "POS",
  CATALOGUE: "CATALOGUE",
};

const HOME_SCREENS = {
  DASHBOARD: "DASHBOARD",
  SALES_INVOICES: "SALES_INVOICES",
  PURCHASE_ORDERS: "PURCHASE_ORDERS",
  SHIPMENTS: "SHIPMENTS",
  PAYMENTS_RECEIPTS: "PAYMENTS_RECEIPTS",
  EXPENSES: "EXPENSES",
  CUSTOMERS: "CUSTOMERS",
  CATEGORIES: "CATEGORIES",
  VENDORS: "VENDORS",
  SUMMARY: "SUMMARY",
};

export default function App() {
  const [tab, setTab] = useState(TABS.POS);
  const [homeScreen, setHomeScreen] = useState(HOME_SCREENS.DASHBOARD);

  let content = null;
  if (tab === TABS.HOME) {
    if (homeScreen === HOME_SCREENS.DASHBOARD) {
      content = (
        <HomeScreen
          onNavigateTab={setTab}
          onOpenSection={(key) => setHomeScreen(key)}
        />
      );
    } else if (homeScreen === HOME_SCREENS.SALES_INVOICES) {
      content = (
        <SalesInvoicesScreen
          onBack={() => setHomeScreen(HOME_SCREENS.DASHBOARD)}
          onAddSale={() => {
            setTab(TABS.POS);
            setHomeScreen(HOME_SCREENS.DASHBOARD);
          }}
        />
      );
    } else if (homeScreen === HOME_SCREENS.PURCHASE_ORDERS) {
      content = <PurchaseOrdersScreen onBack={() => setHomeScreen(HOME_SCREENS.DASHBOARD)} />;
    } else if (homeScreen === HOME_SCREENS.SHIPMENTS) {
      content = <ShipmentsScreen onBack={() => setHomeScreen(HOME_SCREENS.DASHBOARD)} />;
    } else if (homeScreen === HOME_SCREENS.PAYMENTS_RECEIPTS) {
      content = <PaymentsReceiptsScreen onBack={() => setHomeScreen(HOME_SCREENS.DASHBOARD)} />;
    } else if (homeScreen === HOME_SCREENS.EXPENSES) {
      content = <ExpensesScreen onBack={() => setHomeScreen(HOME_SCREENS.DASHBOARD)} />;
    } else if (homeScreen === HOME_SCREENS.CUSTOMERS) {
      content = <CustomersScreen onBack={() => setHomeScreen(HOME_SCREENS.DASHBOARD)} />;
    } else if (homeScreen === HOME_SCREENS.CATEGORIES) {
      content = <CategoriesScreen onBack={() => setHomeScreen(HOME_SCREENS.DASHBOARD)} />;
    } else if (homeScreen === HOME_SCREENS.VENDORS) {
      content = <VendorsScreen onBack={() => setHomeScreen(HOME_SCREENS.DASHBOARD)} />;
    } else if (homeScreen === HOME_SCREENS.SUMMARY) {
      content = <SummaryScreen onBack={() => setHomeScreen(HOME_SCREENS.DASHBOARD)} />;
    }
  } else if (tab === TABS.POS) {
    content = <PosScreen />;
  } else if (tab === TABS.CATALOGUE) {
    content = <CatalogueScreen />;
  }

  let subtitle = "";
  if (tab === TABS.HOME) {
    if (homeScreen === HOME_SCREENS.DASHBOARD) subtitle = "Summary dashboard";
    else if (homeScreen === HOME_SCREENS.SALES_INVOICES) subtitle = "Sales Invoices";
    else if (homeScreen === HOME_SCREENS.PURCHASE_ORDERS) subtitle = "Purchase Orders";
    else if (homeScreen === HOME_SCREENS.SHIPMENTS) subtitle = "Shipments";
    else if (homeScreen === HOME_SCREENS.PAYMENTS_RECEIPTS) subtitle = "Payments & Receipts";
    else if (homeScreen === HOME_SCREENS.EXPENSES) subtitle = "Expenses";
    else if (homeScreen === HOME_SCREENS.CUSTOMERS) subtitle = "Customers";
    else if (homeScreen === HOME_SCREENS.CATEGORIES) subtitle = "Categories";
    else if (homeScreen === HOME_SCREENS.VENDORS) subtitle = "Vendors";
    else if (homeScreen === HOME_SCREENS.SUMMARY) subtitle = "Summary";
  } else if (tab === TABS.POS) subtitle = "Point of Sale";
  else if (tab === TABS.CATALOGUE) subtitle = "Product catalogue";

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeTop}>
        <View style={styles.header}>
          <View style={styles.logoRow}>
            <Image
              source={require("./assets/logo.png")}
              style={styles.logoImage}
              resizeMode="contain"
            />
            <Text style={styles.logoText}>mPOS</Text>
          </View>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
      </SafeAreaView>
      <View style={styles.content}>{content}</View>
      <SafeAreaView style={styles.safeBottom}>
        <View style={styles.tabBar}>
          <TabButton
            label="Home"
            icon="view-dashboard-outline"
            active={tab === TABS.HOME}
            onPress={() => {
              setTab(TABS.HOME);
              setHomeScreen(HOME_SCREENS.DASHBOARD);
            }}
          />
          <TabButton
            label="POS"
            icon="line-scan"
            active={tab === TABS.POS}
            onPress={() => setTab(TABS.POS)}
          />
          <TabButton
            label="Catalogue"
            icon="view-list-outline"
            active={tab === TABS.CATALOGUE}
            onPress={() => setTab(TABS.CATALOGUE)}
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

function TabButton({ label, icon, active, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.tabButton, active ? styles.tabButtonActive : null]}
      onPress={onPress}
    >
      <MaterialCommunityIcons
        name={icon}
        size={24}
        color={active ? "#ffffff" : "#666666"}
      />
      <Text style={[styles.tabLabel, active ? styles.tabLabelActive : null]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000000" },
  safeTop: { backgroundColor: "#000000" },
  safeBottom: { backgroundColor: "#050505" },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#181818",
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoImage: {
    width: 28,
    height: 28,
    marginRight: 8,
    borderRadius: 6,
  },
  logoText: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "700",
  },
  subtitle: {
    marginTop: 4,
    color: "#888888",
    fontSize: 12,
  },
  tabBar: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 10,
    justifyContent: "space-between",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#222222",
    backgroundColor: "#050505",
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    marginHorizontal: 6,
    borderRadius: 999,
    backgroundColor: "#050505",
    borderWidth: 1,
    borderColor: "#111111",
    flexDirection: "column",
    gap: 2,
  },
  tabButtonActive: {
    borderColor: "#ffffff",
  },
  tabLabel: { color: "#888888", fontSize: 11 },
  tabLabelActive: { color: "#ffffff", fontWeight: "600" },
  content: { flex: 1, backgroundColor: "#000000" },
});
