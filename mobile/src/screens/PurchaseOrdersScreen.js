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
import {
  fetchPurchaseOrders,
  fetchVendors,
  fetchProductsForSync,
  createPurchaseOrder,
} from "../services/api";

export function PurchaseOrdersScreen({ onBack }) {
  const [items, setItems] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [products, setProducts] = useState([]);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedVendorId, setSelectedVendorId] = useState(null);
  const [lineItems, setLineItems] = useState([
    { key: 1, barcode: "", quantity: "1", unitCost: "" },
  ]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [orders, vendorList, productList] = await Promise.all([
          fetchPurchaseOrders(),
          fetchVendors(),
          fetchProductsForSync(),
        ]);
        setItems(orders || []);
        setVendors(vendorList || []);
        setProducts(productList || []);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  const reloadOrders = async () => {
    try {
      const data = await fetchPurchaseOrders();
      setItems(data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const openModal = () => {
    setSelectedVendorId(null);
    setLineItems([{ key: 1, barcode: "", quantity: "1", unitCost: "" }]);
    setModalVisible(true);
  };

  const addLineItem = () => {
    setLineItems((prev) => {
      const nextKey = prev.length ? prev[prev.length - 1].key + 1 : 1;
      return [...prev, { key: nextKey, barcode: "", quantity: "1", unitCost: "" }];
    });
  };

  const updateLineItem = (key, field, value) => {
    setLineItems((prev) =>
      prev.map((item) => (item.key === key ? { ...item, [field]: value } : item))
    );
  };

  const removeLineItem = (key) => {
    setLineItems((prev) => prev.filter((item) => item.key !== key));
  };

  const handleSaveOrder = async () => {
    if (!selectedVendorId) {
      Alert.alert("Vendor required", "Please select a vendor.");
      return;
    }

    if (!lineItems.length) {
      Alert.alert("No items", "Add at least one line item.");
      return;
    }

    const itemsPayload = [];
    for (const li of lineItems) {
      const qty = parseInt(li.quantity || "0", 10);
      if (!li.barcode.trim() || qty <= 0) {
        continue;
      }
      const product = products.find((p) => p.barcode === li.barcode.trim());
      if (!product) {
        Alert.alert(
          "Unknown product",
          `No product found with barcode ${li.barcode.trim()}.`
        );
        return;
      }
      const unitCostNumber = parseFloat(li.unitCost || "0");
      itemsPayload.push({
        product: product.id,
        quantity: qty,
        unit_cost: Number.isNaN(unitCostNumber) ? 0 : unitCostNumber,
      });
    }

    if (!itemsPayload.length) {
      Alert.alert("No valid items", "Please fill at least one valid item.");
      return;
    }

    try {
      setSaving(true);
      await createPurchaseOrder({ vendor_id: selectedVendorId, items: itemsPayload });
      await reloadOrders();
      setModalVisible(false);
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Failed to create purchase order.");
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
          <Text style={styles.addText}>Add order</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.listContainer}>
        {items.map((po) => (
          <View key={po.id} style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>PO #{po.id}</Text>
              <Text style={styles.rowSub}>{po.vendor?.name || "Unknown vendor"}</Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={styles.rowAmount}>{Number(po.total_amount).toFixed(2)}</Text>
              <Text style={styles.rowSub}>{new Date(po.created_at).toLocaleString()}</Text>
            </View>
          </View>
        ))}
        {!items.length && (
          <Text style={styles.placeholder}>
            Purchase orders from vendors will be listed here.
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
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>New purchase order</Text>

              <Text style={styles.modalLabel}>Vendor</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.vendorChipsRow}
              >
                {vendors.map((v) => {
                  const active = v.id === selectedVendorId;
                  return (
                    <TouchableOpacity
                      key={v.id}
                      style={[
                        styles.vendorChip,
                        active && styles.vendorChipActive,
                      ]}
                      onPress={() => setSelectedVendorId(v.id)}
                    >
                      <Text
                        style={[
                          styles.vendorChipText,
                          active && styles.vendorChipTextActive,
                        ]}
                      >
                        {v.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
                {!vendors.length && (
                  <Text style={styles.vendorHint}>
                    No vendors yet. Add vendors from the Vendors screen.
                  </Text>
                )}
              </ScrollView>

              <Text style={[styles.modalLabel, { marginTop: 12 }]}>Items</Text>
              {lineItems.map((li) => (
                <View key={li.key} style={styles.itemRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemFieldLabel}>Product barcode</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Scan or type barcode"
                      placeholderTextColor="#666666"
                      value={li.barcode}
                      onChangeText={(text) =>
                        updateLineItem(li.key, "barcode", text)
                      }
                    />
                  </View>
                  <View style={styles.itemNumberColumn}>
                    <Text style={styles.itemFieldLabel}>Qty</Text>
                    <TextInput
                      style={styles.input}
                      keyboardType="numeric"
                      value={li.quantity}
                      onChangeText={(text) =>
                        updateLineItem(li.key, "quantity", text)
                      }
                    />
                  </View>
                  <View style={styles.itemNumberColumn}>
                    <Text style={styles.itemFieldLabel}>Unit cost</Text>
                    <TextInput
                      style={styles.input}
                      keyboardType="numeric"
                      value={li.unitCost}
                      onChangeText={(text) =>
                        updateLineItem(li.key, "unitCost", text)
                      }
                    />
                  </View>
                  {lineItems.length > 1 && (
                    <TouchableOpacity
                      style={styles.removeItemButton}
                      onPress={() => removeLineItem(li.key)}
                    >
                      <MaterialCommunityIcons
                        name="close"
                        size={18}
                        color="#bbbbbb"
                      />
                    </TouchableOpacity>
                  )}
                </View>
              ))}

              <TouchableOpacity style={styles.addLineButton} onPress={addLineItem}>
                <MaterialCommunityIcons
                  name="plus-circle-outline"
                  size={18}
                  color="#ffffff"
                />
                <Text style={styles.addLineText}>Add line item</Text>
              </TouchableOpacity>

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
                  onPress={handleSaveOrder}
                  disabled={saving}
                >
                  <Text style={styles.modalButtonPrimaryText}>
                    {saving ? "Saving..." : "Save"}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
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
    paddingHorizontal: 16,
  },
  modalCard: {
    borderRadius: 20,
    padding: 16,
    backgroundColor: "#050505",
    maxHeight: "90%",
  },
  modalTitle: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  modalLabel: {
    color: "#bbbbbb",
    fontSize: 12,
    marginBottom: 4,
  },
  input: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "#111111",
    color: "#ffffff",
  },
  vendorChipsRow: {
    paddingVertical: 4,
  },
  vendorChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#111111",
    marginRight: 8,
  },
  vendorChipActive: {
    backgroundColor: "#ffffff",
  },
  vendorChipText: {
    color: "#ffffff",
    fontSize: 12,
  },
  vendorChipTextActive: {
    color: "#000000",
    fontWeight: "600",
  },
  vendorHint: {
    color: "#777777",
    fontSize: 11,
    paddingVertical: 4,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginTop: 10,
  },
  itemFieldLabel: {
    color: "#777777",
    fontSize: 11,
    marginBottom: 4,
  },
  itemNumberColumn: {
    width: 80,
    marginLeft: 8,
  },
  removeItemButton: {
    marginLeft: 8,
    padding: 4,
  },
  addLineButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },
  addLineText: {
    marginLeft: 6,
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "500",
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
