import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { fetchPayments, fetchExpenses } from "../services/api";

export function PaymentsReceiptsScreen({ onBack }) {
  const [payments, setPayments] = useState([]);
  const [expenses, setExpenses] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const [p, e] = await Promise.all([fetchPayments(), fetchExpenses()]);
        setPayments(p || []);
        setExpenses(e || []);
      } catch (err) {
        console.error(err);
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
      </View>
      <ScrollView contentContainerStyle={styles.listContainer}>
        <Text style={styles.sectionTitle}>Payments</Text>
        {payments.map((p) => (
          <View key={p.id} style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>{p.method.toUpperCase()}</Text>
              <Text style={styles.rowSub}>Tx #{p.transaction}</Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={styles.rowAmount}>{Number(p.amount).toFixed(2)}</Text>
              <Text style={styles.rowSub}>{new Date(p.timestamp).toLocaleString()}</Text>
            </View>
          </View>
        ))}

        <Text style={[styles.sectionTitle, { marginTop: 18 }]}>Expenses</Text>
        {expenses.map((ex) => (
          <View key={ex.id} style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>{ex.category}</Text>
              <Text style={styles.rowSub}>{ex.description || "No description"}</Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={styles.rowAmount}>{Number(ex.amount).toFixed(2)}</Text>
              <Text style={styles.rowSub}>{new Date(ex.created_at).toLocaleString()}</Text>
            </View>
          </View>
        ))}

        {!payments.length && !expenses.length && (
          <Text style={styles.placeholder}>
            Payments and receipts for sales, vendors and expenses will appear here.
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
  listContainer: { paddingTop: 10 },
  placeholder: { color: "#bbbbbb", fontSize: 13 },
  sectionTitle: { color: "#ffffff", fontSize: 14, fontWeight: "600", marginBottom: 6 },
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
