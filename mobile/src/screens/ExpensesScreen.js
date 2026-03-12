import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  TextInput,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { createExpense, fetchExpenses } from "../services/api";

export function ExpensesScreen({ onBack }) {
  const [items, setItems] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [category, setCategory] = useState("other");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [recordedBy, setRecordedBy] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const data = await fetchExpenses();
      setItems(data || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openModal = () => {
    setCategory("other");
    setAmount("");
    setDescription("");
    setRecordedBy("");
    setModalVisible(true);
  };

  const handleSave = async () => {
    const parsedAmount = Number(amount.replace(",", "."));
    if (!parsedAmount || parsedAmount <= 0) {
      Alert.alert("Invalid amount", "Enter an amount greater than 0.");
      return;
    }

    try {
      setSaving(true);
      await createExpense({
        category,
        amount: parsedAmount,
        description,
        recordedBy: recordedBy || "terminal-1",
      });
      await load();
      setModalVisible(false);
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Failed to save expense.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <MaterialCommunityIcons name="chevron-left" size={22} color="#ffffff" />
          <Text style={styles.backText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.addButton} onPress={openModal}>
          <MaterialCommunityIcons name="plus" size={18} color="#000000" />
          <Text style={styles.addText}>Add expense</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.listContainer}>
        {items.map((ex) => (
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
        {!items.length && (
          <Text style={styles.placeholder}>
            Expenses will be tracked here (utilities, payrolls, etc.).
          </Text>
        )}
      </ScrollView>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>New expense</Text>

            <Text style={styles.modalLabel}>Category</Text>
            <View style={styles.chipRow}>
              {["stock", "payroll", "utilities", "other"].map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[
                    styles.chip,
                    category === c && styles.chipActive,
                  ]}
                  onPress={() => setCategory(c)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      category === c && styles.chipTextActive,
                    ]}
                  >
                    {c.charAt(0).toUpperCase() + c.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.modalLabel}>Amount</Text>
            <TextInput
              style={styles.input}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor="#666666"
              value={amount}
              onChangeText={setAmount}
            />

            <Text style={styles.modalLabel}>Description</Text>
            <TextInput
              style={[styles.input, { height: 70, textAlignVertical: "top" }]}
              multiline
              placeholder="Optional note"
              placeholderTextColor="#666666"
              value={description}
              onChangeText={setDescription}
            />

            <Text style={styles.modalLabel}>Recorded by</Text>
            <TextInput
              style={styles.input}
              placeholder="Cashier / staff (optional)"
              placeholderTextColor="#666666"
              value={recordedBy}
              onChangeText={setRecordedBy}
            />

            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSecondary]}
                onPress={() => setModalVisible(false)}
                disabled={saving}
              >
                <Text style={styles.modalButtonSecondaryText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={handleSave}
                disabled={saving}
              >
                <Text style={styles.modalButtonPrimaryText}>
                  {saving ? "Saving..." : "Save"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  modalCard: {
    borderRadius: 20,
    padding: 18,
    backgroundColor: "#050505",
  },
  modalTitle: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
  },
  modalLabel: {
    color: "#bbbbbb",
    fontSize: 12,
    marginTop: 8,
    marginBottom: 4,
  },
  input: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#111111",
    color: "#ffffff",
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#111111",
    marginRight: 8,
    marginBottom: 6,
  },
  chipActive: {
    backgroundColor: "#ffffff",
  },
  chipText: {
    color: "#ffffff",
    fontSize: 12,
  },
  chipTextActive: {
    color: "#000000",
    fontWeight: "600",
  },
  modalButtonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 999,
    alignItems: "center",
  },
  modalButtonSecondary: {
    marginRight: 8,
    backgroundColor: "#111111",
  },
  modalButtonPrimary: {
    marginLeft: 8,
    backgroundColor: "#ffffff",
  },
  modalButtonSecondaryText: {
    color: "#ffffff",
    fontWeight: "500",
  },
  modalButtonPrimaryText: {
    color: "#000000",
    fontWeight: "600",
  },
});
