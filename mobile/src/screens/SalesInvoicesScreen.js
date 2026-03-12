import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { fetchTransactions } from "../services/api";

export function SalesInvoicesScreen({ onBack, onAddSale }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchTransactions();
        setItems(data || []);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <MaterialCommunityIcons name="chevron-left" size={22} color="#ffffff" />
          <Text style={styles.backText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.addButton} onPress={onAddSale}>
          <MaterialCommunityIcons name="plus" size={18} color="#000000" />
          <Text style={styles.addText}>Add sale</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.listContainer}>
        {items.map((tx) => (
          <View key={tx.id} style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>Sale #{tx.id}</Text>
              <Text style={styles.rowSub}>{new Date(tx.timestamp).toLocaleString()}</Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={styles.rowAmount}>{Number(tx.total_amount).toFixed(2)}</Text>
              {tx.customer?.name ? (
                <Text style={styles.rowSub}>{tx.customer.name}</Text>
              ) : null}
            </View>
          </View>
        ))}
        {!items.length && (
          <Text style={styles.placeholder}>
            Sales invoices list will appear here (most recent first).
          </Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000000", paddingHorizontal: 16, paddingTop: 14 },
  topRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  backButton: { flexDirection: "row", alignItems: "center" },
  backText: { color: "#ffffff", marginLeft: 4, fontSize: 13 },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#ffffff",
  },
  addText: { marginLeft: 4, color: "#000000", fontSize: 13, fontWeight: "600" },
  listContainer: { paddingTop: 10 },
  placeholder: { color: "#bbbbbb", fontSize: 13 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#222222",
  },
  rowTitle: { color: "#ffffff", fontSize: 14, fontWeight: "500" },
  rowSub: { color: "#777777", fontSize: 11, marginTop: 2 },
  rowAmount: { color: "#ffffff", fontWeight: "700", fontSize: 14 },
});
