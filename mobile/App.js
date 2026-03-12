import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Image } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { HomeScreen } from "./src/screens/HomeScreen";
import { PosScreen } from "./src/screens/ScannerScreen";
import { CatalogueScreen } from "./src/screens/CatalogueScreen";

const TABS = {
  HOME: "HOME",
  POS: "POS",
  CATALOGUE: "CATALOGUE",
};

export default function App() {
  const [tab, setTab] = useState(TABS.POS);

  let content = null;
  if (tab === TABS.HOME) content = <HomeScreen />;
  else if (tab === TABS.POS) content = <PosScreen />;
  else if (tab === TABS.CATALOGUE) content = <CatalogueScreen />;

  let subtitle = "";
  if (tab === TABS.HOME) subtitle = "Summary dashboard";
  else if (tab === TABS.POS) subtitle = "Point of Sale";
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
            onPress={() => setTab(TABS.HOME)}
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
    backgroundColor: "#111111",
    flexDirection: "column",
    gap: 2,
  },
  tabButtonActive: { backgroundColor: "#ffffff" },
  tabLabel: { color: "#888888", fontSize: 11 },
  tabLabelActive: { color: "#000000", fontWeight: "600" },
  content: { flex: 1, backgroundColor: "#000000" },
});
