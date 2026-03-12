import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { syncProductsFromServer } from "../services/productCache";

export function SyncScreen() {
  const [loading, setLoading] = useState(false);

  const handleSync = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const map = await syncProductsFromServer();
      Alert.alert("Sync complete", `Synced ${Object.keys(map).length} products.`);
    } catch (error) {
      console.error(error);
      Alert.alert("Sync error", "Failed to sync products. Check network and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, loading ? styles.buttonDisabled : null]}
        onPress={handleSync}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Sync Product Catalog</Text>
        )}
      </TouchableOpacity>
      <Text style={styles.hint}>
        Download the latest product catalog to this device for fast offline scanning.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#000000",
  },
  button: {
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 999,
    backgroundColor: "#ffffff",
  },
  buttonDisabled: { backgroundColor: "#555555" },
  buttonText: { color: "#000000", fontWeight: "600" },
  hint: { marginTop: 18, color: "#777777", textAlign: "center" },
});
