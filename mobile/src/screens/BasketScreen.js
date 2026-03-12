import React, { useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from "react-native";
import { useBasketStore } from "../store/basketStore";
import { checkoutBasket } from "../services/api";

export function BasketScreen() {
  const basket = useBasketStore((state) => state.basket);
  const increment = useBasketStore((state) => state.increment);
  const decrement = useBasketStore((state) => state.decrement);
  const clear = useBasketStore((state) => state.clear);
  const total = useBasketStore((state) => state.total);
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    if (!basket.length || loading) return;
    setLoading(true);
    try {
      const itemsPayload = basket.map((item) => ({
        barcode: item.barcode,
        quantity: item.quantity,
      }));

      const result = await checkoutBasket({
        cashierId: "terminal-1", // replace with real cashier/user id
        items: itemsPayload,
      });

      Alert.alert(
        "Checkout successful",
        `Transaction #${result.id} Total: ${result.total_amount}`,
      );
      clear();
    } catch (error) {
      console.error(error);
      const message =
        error?.response?.data?.detail || "Checkout failed. Please try again.";
      Alert.alert("Checkout error", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={basket}
        keyExtractor={(item) => item.barcode}
        ListEmptyComponent={() => (
          <Text style={styles.empty}>Basket is empty. Scan items to create basket.</Text>
        )}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.barcode}>{item.barcode}</Text>
            </View>
            <Text style={styles.price}>{Number(item.price ?? 0).toFixed(2)}</Text>
            <View style={styles.qtyContainer}>
              <TouchableOpacity
                style={styles.qtyButton}
                onPress={() => decrement(item.barcode)}
              >
                <Text style={styles.qtyButtonText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.qtyText}>{item.quantity}</Text>
              <TouchableOpacity
                style={styles.qtyButton}
                onPress={() => increment(item.barcode)}
              >
                <Text style={styles.qtyButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
      <View style={styles.footer}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>{total().toFixed(2)}</Text>
        </View>
        <TouchableOpacity
          style={[styles.checkoutBtn, !basket.length || loading ? styles.btnDisabled : null]}
          onPress={handleCheckout}
          disabled={!basket.length || loading}
        >
          <Text style={styles.checkoutText}>{loading ? "Processing..." : "Checkout"}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#000000" },
  empty: { textAlign: "center", marginTop: 40, color: "#777777" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: "#101010",
    marginBottom: 10,
  },
  name: { fontWeight: "600", marginBottom: 2, color: "#ffffff" },
  barcode: { color: "#888888", fontSize: 12 },
  price: { width: 80, textAlign: "right", color: "#ffffff" },
  qtyContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
  },
  qtyButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: "#1f1f1f",
    borderRadius: 999,
  },
  qtyButtonText: { fontSize: 16, fontWeight: "600", color: "#ffffff" },
  qtyText: { marginHorizontal: 8, minWidth: 24, textAlign: "center", color: "#ffffff" },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#222222",
    marginTop: 4,
  },
  totalContainer: { flex: 1 },
  totalLabel: { fontWeight: "500", color: "#888888", marginBottom: 2 },
  totalValue: { fontWeight: "700", fontSize: 20, color: "#ffffff" },
  checkoutBtn: {
    marginLeft: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#ffffff",
    borderRadius: 999,
  },
  btnDisabled: { backgroundColor: "#555555" },
  checkoutText: { color: "#000000", fontWeight: "600" },
});
