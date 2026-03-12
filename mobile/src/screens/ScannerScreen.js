import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Camera, useCameraDevice, useCodeScanner } from "react-native-vision-camera";
import * as Haptics from "expo-haptics";
import { useBasketStore } from "../store/basketStore";
import { getProductByBarcode } from "../services/productCache";
import { checkoutBasket, recordPayment } from "../services/api";

const DEBOUNCE_MS = 1500;

export function PosScreen() {
  const device = useCameraDevice("back");
  const [hasPermission, setHasPermission] = useState(false);
  const lastScanRef = useRef({});
  const addItem = useBasketStore((state) => state.addItem);
  const basket = useBasketStore((state) => state.basket);
  const increment = useBasketStore((state) => state.increment);
  const decrement = useBasketStore((state) => state.decrement);
  const clear = useBasketStore((state) => state.clear);
  const total = useBasketStore((state) => state.total);
  const [checkingOut, setCheckingOut] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [savingPayment, setSavingPayment] = useState(false);

  useEffect(() => {
    (async () => {
      const status = await Camera.requestCameraPermission();
      setHasPermission(status === "granted");
    })();
  }, []);

  const codeScanner = useCodeScanner({
    codeTypes: ["ean-13", "ean-8", "code-128", "code-39", "upc-a", "upc-e", "qr"],
    onCodeScanned: (codes) => {
      if (!codes?.length) return;
      const value = codes[0]?.value;
      if (!value) return;

      const now = Date.now();
      const last = lastScanRef.current[value] || 0;
      if (now - last < DEBOUNCE_MS) {
        return;
      }
      lastScanRef.current[value] = now;

      const product = getProductByBarcode(value);
      if (!product) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        Alert.alert(
          "Not in catalogue",
          "This barcode is not in your catalogue yet. Add it from the Catalogue screen.",
        );
        return;
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      addItem(product);
    },
  });

  const handleCheckout = async () => {
    if (!basket.length || checkingOut) return;
    setCheckingOut(true);
    try {
      const itemsPayload = basket.map((item) => ({
        barcode: item.barcode,
        quantity: item.quantity,
      }));

      const result = await checkoutBasket({
        cashierId: "terminal-1",
        items: itemsPayload,
      });
      setCurrentTransaction(result);
      setPaymentAmount(String(Number(result.total_amount)));
      setShowPayment(true);
    } catch (error) {
      console.error(error);
      const message =
        error?.response?.data?.detail || "Checkout failed. Please try again.";
      Alert.alert("Checkout error", message);
    } finally {
      setCheckingOut(false);
    }
  };

  const handleConfirmPayment = async () => {
    if (!currentTransaction || savingPayment) return;
    const parsedAmount = Number(paymentAmount.replace(",", "."));
    if (!parsedAmount || parsedAmount <= 0) {
      Alert.alert("Invalid amount", "Enter a payment amount greater than 0.");
      return;
    }

    try {
      setSavingPayment(true);
      const payload = await recordPayment({
        transactionId: currentTransaction.id,
        amount: parsedAmount,
        method: paymentMethod,
      });

      const outstandingNumber = Number(payload.outstanding);
      const isPartial = outstandingNumber > 0.0001;

      Alert.alert(
        isPartial ? "Payment recorded (credit)" : "Payment complete",
        isPartial
          ? `Paid ${parsedAmount.toFixed(2)}. Outstanding balance: ${outstandingNumber.toFixed(2)}.`
          : `Transaction #${currentTransaction.id} fully paid.`,
      );

      clear();
      setShowPayment(false);
      setCurrentTransaction(null);
      setPaymentAmount("");
    } catch (error) {
      console.error(error);
      Alert.alert("Payment error", "Failed to record payment. Please try again.");
    } finally {
      setSavingPayment(false);
    }
  };

  if (!device) {
    return (
      <View style={styles.center}>
        <Text>No camera device found</Text>
      </View>
    );
  }

  if (!hasPermission) {
    return (
      <View style={styles.center}>
        <Text>Camera permission is required.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive
        codeScanner={codeScanner}
      />
      <View style={styles.overlayPanel}>
        <Text style={styles.panelTitle}>Current basket</Text>
        <FlatList
          data={basket}
          keyExtractor={(item) => item.barcode}
          ListEmptyComponent={() => (
            <Text style={styles.emptyText}>Scan a product to begin.</Text>
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
            style={[
              styles.checkoutBtn,
              (!basket.length || checkingOut) && styles.btnDisabled,
            ]}
            onPress={handleCheckout}
            disabled={!basket.length || checkingOut}
          >
            <Text style={styles.checkoutText}>
              {checkingOut ? "Processing..." : "Checkout"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {showPayment && currentTransaction && (
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.paymentOverlay}
        >
          <View style={styles.paymentCard}>
            <Text style={styles.paymentTitle}>Payment</Text>
            <Text style={styles.paymentSubtitle}>
              Transaction #{currentTransaction.id} • Total {Number(currentTransaction.total_amount).toFixed(2)}
            </Text>

            <Text style={styles.paymentLabel}>Amount</Text>
            <TextInput
              style={styles.paymentInput}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor="#666666"
              value={paymentAmount}
              onChangeText={setPaymentAmount}
            />

            <Text style={styles.paymentLabel}>Method</Text>
            <View style={styles.methodRow}>
              {[
                { key: "cash", label: "Cash" },
                { key: "mpesa", label: "M-Pesa" },
                { key: "airtel", label: "Airtel" },
                { key: "card", label: "Card" },
                { key: "credit", label: "Credit" },
              ].map((m) => (
                <TouchableOpacity
                  key={m.key}
                  style={[
                    styles.methodChip,
                    paymentMethod === m.key && styles.methodChipActive,
                  ]}
                  onPress={() => setPaymentMethod(m.key)}
                  disabled={savingPayment}
                >
                  <Text
                    style={[
                      styles.methodChipText,
                      paymentMethod === m.key && styles.methodChipTextActive,
                    ]}
                  >
                    {m.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.paymentButtonsRow}>
              <TouchableOpacity
                style={[styles.paymentButton, styles.paymentButtonSecondary]}
                onPress={() => {
                  setShowPayment(false);
                  setCurrentTransaction(null);
                }}
                disabled={savingPayment}
              >
                <Text style={styles.paymentButtonSecondaryText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.paymentButton, styles.paymentButtonPrimary]}
                onPress={handleConfirmPayment}
                disabled={savingPayment}
              >
                <Text style={styles.paymentButtonPrimaryText}>
                  {savingPayment ? "Saving..." : "Confirm"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "black" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  overlayPanel: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    backgroundColor: "rgba(0,0,0,0.8)",
  },
  panelTitle: {
    color: "#ffffff",
    fontWeight: "600",
    marginBottom: 8,
  },
  emptyText: { color: "#777777", marginTop: 12 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: "#101010",
    marginBottom: 8,
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
    paddingTop: 10,
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
  paymentOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  paymentCard: {
    width: "100%",
    borderRadius: 20,
    padding: 20,
    backgroundColor: "#050505",
  },
  paymentTitle: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "700",
  },
  paymentSubtitle: {
    marginTop: 4,
    marginBottom: 14,
    color: "#888888",
    fontSize: 12,
  },
  paymentLabel: {
    marginTop: 8,
    marginBottom: 4,
    color: "#bbbbbb",
    fontSize: 12,
  },
  paymentInput: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "#111111",
    color: "#ffffff",
  },
  methodRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 4,
  },
  methodChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#111111",
    marginRight: 8,
    marginTop: 6,
  },
  methodChipActive: {
    backgroundColor: "#ffffff",
  },
  methodChipText: {
    color: "#ffffff",
    fontSize: 12,
  },
  methodChipTextActive: {
    color: "#000000",
    fontWeight: "600",
  },
  paymentButtonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 18,
  },
  paymentButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 999,
    alignItems: "center",
  },
  paymentButtonSecondary: {
    marginRight: 8,
    backgroundColor: "#111111",
  },
  paymentButtonPrimary: {
    marginLeft: 8,
    backgroundColor: "#ffffff",
  },
  paymentButtonSecondaryText: {
    color: "#ffffff",
    fontWeight: "500",
  },
  paymentButtonPrimaryText: {
    color: "#000000",
    fontWeight: "600",
  },
});
