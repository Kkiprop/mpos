import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { fetchDailyReport } from "../services/api";

export function SummaryScreen({ onBack }) {
  const [report, setReport] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchDailyReport();
        setReport(data);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  const today = report?.today || {};
  const lastWeek = report?.same_day_last_week || {};
  const lastYear = report?.same_day_last_year || {};

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <MaterialCommunityIcons name="chevron-left" size={22} color="#ffffff" />
          <Text style={styles.backText}>Home</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.listContainer}>
        <View style={styles.cardRow}>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Sales (today)</Text>
            <Text style={styles.cardValue}>{Number(today.sales_total || 0).toFixed(2)}</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Profit (today)</Text>
            <Text style={styles.cardValue}>{Number(today.profit || 0).toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.cardRow}>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Avg basket</Text>
            <Text style={styles.cardValue}>{Number(today.average_basket || 0).toFixed(2)}</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Expenses</Text>
            <Text style={styles.cardValue}>{Number(today.expenses_total || 0).toFixed(2)}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Compared to last week</Text>
        <Text style={styles.comparisonText}>
          Sales: {Number(lastWeek.sales_total || 0).toFixed(2)} • Profit: {Number(lastWeek.profit || 0).toFixed(2)}
        </Text>

        <Text style={styles.sectionTitle}>Compared to last year</Text>
        <Text style={styles.comparisonText}>
          Sales: {Number(lastYear.sales_total || 0).toFixed(2)} • Profit: {Number(lastYear.profit || 0).toFixed(2)}
        </Text>
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
  cardRow: { flexDirection: "row", marginBottom: 12 },
  card: {
    flex: 1,
    marginRight: 10,
    padding: 14,
    borderRadius: 16,
    backgroundColor: "#101010",
  },
  cardLabel: { color: "#888888", fontSize: 11, marginBottom: 4 },
  cardValue: { color: "#ffffff", fontSize: 18, fontWeight: "700" },
  sectionTitle: { marginTop: 12, color: "#ffffff", fontSize: 13, fontWeight: "600" },
  comparisonText: { color: "#bbbbbb", fontSize: 12, marginTop: 4 },
});
