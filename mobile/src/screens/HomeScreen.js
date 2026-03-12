import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { getProductsMap } from "../services/productCache";
import { useBasketStore } from "../store/basketStore";

export function HomeScreen() {
  const basket = useBasketStore((state) => state.basket);
  const productsCount = Object.keys(getProductsMap()).length;
  const basketItems = basket.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <View style={styles.container}>
      <View style={styles.cardRow}>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Products</Text>
          <Text style={styles.cardValue}>{productsCount}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Items in basket</Text>
          <Text style={styles.cardValue}>{basketItems}</Text>
        </View>
      </View>
      <View style={styles.summaryBlock}>
        <Text style={styles.summaryTitle}>Today</Text>
        <Text style={styles.summaryText}>Quick snapshot of your store at a glance.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  cardRow: {
    flexDirection: "row",
    marginBottom: 20,
  },
  card: {
    flex: 1,
    marginRight: 12,
    padding: 16,
    borderRadius: 18,
    backgroundColor: "#101010",
  },
  cardLabel: {
    color: "#888888",
    fontSize: 12,
    marginBottom: 6,
  },
  cardValue: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "700",
  },
  summaryBlock: {
    marginTop: 12,
    padding: 16,
    borderRadius: 18,
    backgroundColor: "#050505",
  },
  summaryTitle: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  summaryText: {
    color: "#777777",
    fontSize: 13,
  },
});
