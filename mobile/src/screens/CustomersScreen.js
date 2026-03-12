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
import { fetchCustomers, createCustomer } from "../services/api";

export function CustomersScreen({ onBack }) {
  const [items, setItems] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const data = await fetchCustomers();
      setItems(data || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openModal = () => {
    setName("");
    setPhone("");
    setEmail("");
    setNotes("");
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Missing name", "Customer name is required.");
      return;
    }

    try {
      setSaving(true);
      await createCustomer({ name, phone, email, notes });
      await load();
      setModalVisible(false);
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Failed to add customer.");
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
          <Text style={styles.addText}>Add customer</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.listContainer}>
        {items.map((c) => (
          <View key={c.id} style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>{c.name}</Text>
              <Text style={styles.rowSub}>{c.phone || c.email || "No contact"}</Text>
            </View>
            <Text style={styles.rowSub}>{c.notes}</Text>
          </View>
        ))}
        {!items.length && (
          <Text style={styles.placeholder}>Customers will be listed here.</Text>
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
            <Text style={styles.modalTitle}>New customer</Text>

            <Text style={styles.modalLabel}>Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Customer name"
              placeholderTextColor="#666666"
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.modalLabel}>Phone</Text>
            <TextInput
              style={styles.input}
              placeholder="Phone (optional)"
              placeholderTextColor="#666666"
              value={phone}
              onChangeText={setPhone}
            />

            <Text style={styles.modalLabel}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Email (optional)"
              placeholderTextColor="#666666"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />

            <Text style={styles.modalLabel}>Notes</Text>
            <TextInput
              style={[styles.input, { height: 70, textAlignVertical: "top" }]}
              multiline
              placeholder="Any notes about the customer"
              placeholderTextColor="#666666"
              value={notes}
              onChangeText={setNotes}
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
