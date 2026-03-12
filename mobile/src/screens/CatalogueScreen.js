import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { Camera, useCameraDevice, useCodeScanner } from "react-native-vision-camera";
import * as Haptics from "expo-haptics";
import { getProductsMap, syncProductsFromServer, upsertProductInCache } from "../services/productCache";
import { upsertProduct } from "../services/api";

export function CatalogueScreen() {
  const [products, setProducts] = useState([]);
  const [loadingSync, setLoadingSync] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const device = useCameraDevice("back");

  const [barcodeInput, setBarcodeInput] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [priceInput, setPriceInput] = useState("");
  const [brandInput, setBrandInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const map = getProductsMap();
    setProducts(Object.values(map));
  }, []);

  useEffect(() => {
    if (!showScanner) return;
    (async () => {
      const status = await Camera.requestCameraPermission();
      setHasPermission(status === "granted");
    })();
  }, [showScanner]);

  const reloadFromCache = () => {
    const map = getProductsMap();
    setProducts(Object.values(map));
  };

  const handleSync = async () => {
    if (loadingSync) return;
    setLoadingSync(true);
    try {
      await syncProductsFromServer();
      reloadFromCache();
      Alert.alert("Sync complete", "Product catalog updated from server.");
    } catch (error) {
      console.error(error);
      Alert.alert("Sync error", "Failed to sync products. Check network and try again.");
    } finally {
      setLoadingSync(false);
    }
  };

  const codeScanner = useCodeScanner({
    codeTypes: ["ean-13", "ean-8", "code-128", "code-39", "upc-a", "upc-e", "qr"],
    onCodeScanned: (codes) => {
      if (!codes?.length) return;
      const value = codes[0]?.value;
      if (!value) return;

      setBarcodeInput(value);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowScanner(false);
      setShowForm(true);
    },
  });

  const resetForm = () => {
    setBarcodeInput("");
    setNameInput("");
    setPriceInput("");
    setBrandInput("");
    setSaving(false);
  };

  const handleSaveProduct = async () => {
    if (!barcodeInput.trim()) {
      Alert.alert("Missing barcode", "Scan or enter a barcode.");
      return;
    }
    if (!nameInput.trim()) {
      Alert.alert("Missing name", "Please enter a product name.");
      return;
    }
    const parsedPrice = parseFloat(priceInput.replace(",", "."));
    if (Number.isNaN(parsedPrice) || parsedPrice <= 0) {
      Alert.alert("Invalid price", "Please enter a valid price above 0.");
      return;
    }

    try {
      setSaving(true);
      const product = await upsertProduct({
        barcode: barcodeInput.trim(),
        name: nameInput.trim(),
        price: parsedPrice,
        brand: brandInput.trim(),
      });
      upsertProductInCache(product);
      reloadFromCache();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Saved", "Product saved to catalogue.");
      resetForm();
      setShowForm(false);
    } catch (error) {
      console.error(error);
      Alert.alert("Save error", "Failed to save product. Please try again.");
      setSaving(false);
    }
  };

  const sortedProducts = [...products].sort((a, b) => {
    const nameA = (a.name || "").toLowerCase();
    const nameB = (b.name || "").toLowerCase();
    return nameA.localeCompare(nameB);
  });

  return (
    <View style={styles.container}>
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => setShowScanner(true)}
        >
          <Text style={styles.primaryButtonText}>Add product</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.secondaryButton, loadingSync && styles.secondaryButtonDisabled]}
          onPress={handleSync}
          disabled={loadingSync}
        >
          <Text style={styles.secondaryButtonText}>{loadingSync ? "Syncing..." : "Sync"}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.listBlock}>
        <Text style={styles.listTitle}>Catalogue</Text>
        <FlatList
          data={sortedProducts}
          keyExtractor={(item) => item.barcode}
          ListEmptyComponent={() => (
            <Text style={styles.emptyText}>No products yet. Sync or add a new one.</Text>
          )}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.productName}>{item.name}</Text>
                <Text style={styles.productMeta}>{item.barcode}</Text>
                {item.brand ? (
                  <Text style={styles.productMeta}>{item.brand}</Text>
                ) : null}
              </View>
              <Text style={styles.productPrice}>{Number(item.price).toFixed(2)}</Text>
            </View>
          )}
        />
      </View>

      {showForm && (
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.formOverlay}
        >
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Add or update product</Text>

            <Text style={styles.label}>Barcode</Text>
            <TextInput
              style={styles.input}
              placeholder="Scan or enter barcode"
              placeholderTextColor="#666666"
              value={barcodeInput}
              onChangeText={setBarcodeInput}
            />

            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Product name"
              placeholderTextColor="#666666"
              value={nameInput}
              onChangeText={setNameInput}
            />

            <Text style={styles.label}>Price</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              placeholderTextColor="#666666"
              keyboardType="decimal-pad"
              value={priceInput}
              onChangeText={setPriceInput}
            />

            <Text style={styles.label}>Brand (optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Brand"
              placeholderTextColor="#666666"
              value={brandInput}
              onChangeText={setBrandInput}
            />

            <View style={styles.formButtonsRow}>
              <TouchableOpacity
                style={[styles.formButton, styles.formButtonSecondary]}
                onPress={() => {
                  resetForm();
                  setShowForm(false);
                }}
                disabled={saving}
              >
                <Text style={styles.formButtonSecondaryText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.formButton, styles.formButtonPrimary, saving && styles.saveButtonDisabled]}
                onPress={handleSaveProduct}
                disabled={saving}
              >
                <Text style={styles.formButtonPrimaryText}>
                  {saving ? "Saving..." : "Save product"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      )}

      {showScanner && (
        <View style={styles.scannerOverlay}>
          {!device || !hasPermission ? (
            <View style={styles.scannerCenter}>
              <Text style={styles.scannerText}>
                {!device
                  ? "No camera device found"
                  : "Camera permission is required to scan."}
              </Text>
              <TouchableOpacity
                style={styles.closeScannerButton}
                onPress={() => setShowScanner(false)}
              >
                <Text style={styles.closeScannerText}>Close</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <Camera
                style={styles.scannerCamera}
                device={device}
                isActive
                codeScanner={codeScanner}
              />
              <View style={styles.scannerBottom}>
                <Text style={styles.scannerText}>Align a barcode to capture it.</Text>
                <TouchableOpacity
                  style={styles.closeScannerButton}
                  onPress={() => setShowScanner(false)}
                >
                  <Text style={styles.closeScannerText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  actionsRow: {
    flexDirection: "row",
    marginBottom: 16,
  },
  primaryButton: {
    flex: 1,
    marginRight: 10,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: "#ffffff",
    alignItems: "center",
  },
  primaryButtonText: { color: "#000000", fontWeight: "600" },
  secondaryButton: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 999,
    backgroundColor: "#111111",
    alignItems: "center",
  },
  secondaryButtonDisabled: { opacity: 0.6 },
  secondaryButtonText: { color: "#ffffff", fontWeight: "500" },
  formBlock: {
    borderRadius: 18,
    padding: 16,
    backgroundColor: "#050505",
    marginBottom: 16,
  },
  formTitle: {
    color: "#ffffff",
    fontWeight: "600",
    marginBottom: 8,
  },
  label: {
    marginTop: 8,
    marginBottom: 4,
    color: "#bbbbbb",
    fontSize: 12,
  },
  input: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "#111111",
    color: "#ffffff",
  },
  saveButton: {
    marginTop: 14,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: "#ffffff",
    alignItems: "center",
  },
  saveButtonDisabled: { opacity: 0.6 },
  saveButtonText: { color: "#000000", fontWeight: "600" },
  listBlock: {
    flex: 1,
    marginTop: 8,
  },
  listTitle: {
    color: "#ffffff",
    fontWeight: "600",
    marginBottom: 8,
  },
  emptyText: {
    color: "#777777",
    marginTop: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: "#101010",
    marginBottom: 8,
  },
  productName: {
    color: "#ffffff",
    fontWeight: "600",
    marginBottom: 2,
  },
  productMeta: {
    color: "#888888",
    fontSize: 12,
  },
  productPrice: {
    width: 80,
    textAlign: "right",
    color: "#ffffff",
  },
  scannerOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  scannerCamera: {
    width: "90%",
    aspectRatio: 3 / 4,
    borderRadius: 20,
    overflow: "hidden",
  },
  scannerBottom: {
    marginTop: 16,
    alignItems: "center",
  },
  scannerText: {
    color: "#ffffff",
    marginBottom: 10,
  },
  closeScannerButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "#ffffff",
  },
  closeScannerText: {
    color: "#000000",
    fontWeight: "600",
  },
  scannerCenter: {
    alignItems: "center",
  },
  formOverlay: {
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
  formCard: {
    width: "100%",
    borderRadius: 20,
    padding: 20,
    backgroundColor: "#050505",
  },
  formButtonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  formButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 999,
    alignItems: "center",
  },
  formButtonSecondary: {
    marginRight: 8,
    backgroundColor: "#111111",
  },
  formButtonPrimary: {
    marginLeft: 8,
    backgroundColor: "#ffffff",
  },
  formButtonSecondaryText: {
    color: "#ffffff",
    fontWeight: "500",
  },
  formButtonPrimaryText: {
    color: "#000000",
    fontWeight: "600",
  },
});
