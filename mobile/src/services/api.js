import axios from "axios";

// Adjust to your backend base URL
export const API_BASE_URL = "http://127.0.0.1:8000/api/v1"; // Android emulator default

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

export async function fetchProductsForSync() {
  const response = await apiClient.get("/sync/");
  return response.data;
}

export async function checkoutBasket({ cashierId, items }) {
  const response = await apiClient.post("/checkout/", {
    cashier_id: cashierId,
    items,
  });
  return response.data;
}

export async function upsertProduct({ barcode, name, price, brand }) {
  const response = await apiClient.post("/products/", {
    barcode,
    name,
    price,
    brand,
  });
  return response.data;
}

export async function recordPayment({ transactionId, amount, method }) {
  const response = await apiClient.post("/payments/", {
    transaction_id: transactionId,
    amount,
    method,
  });
  return response.data;
}

export async function createExpense({ category, amount, description, recordedBy }) {
  const response = await apiClient.post("/expenses/", {
    category,
    amount,
    description,
    recorded_by: recordedBy,
  });
  return response.data;
}

export async function fetchExpenses() {
  const response = await apiClient.get("/expenses/");
  return response.data;
}

export async function fetchPayments() {
  const response = await apiClient.get("/payments/");
  return response.data;
}

export async function fetchTransactions() {
  const response = await apiClient.get("/transactions/");
  return response.data;
}

export async function fetchCustomers() {
  const response = await apiClient.get("/customers/");
  return response.data;
}

export async function createCustomer({ name, phone, email, notes }) {
  const response = await apiClient.post("/customers/", {
    name,
    phone,
    email,
    notes,
  });
  return response.data;
}

export async function fetchVendors() {
  const response = await apiClient.get("/vendors/");
  return response.data;
}

export async function createVendor({ name, phone, email, address, notes }) {
  const response = await apiClient.post("/vendors/", {
    name,
    phone,
    email,
    address,
    notes,
  });
  return response.data;
}

export async function fetchPurchaseOrders() {
  const response = await apiClient.get("/purchase-orders/");
  return response.data;
}

export async function createPurchaseOrder(payload) {
  const response = await apiClient.post("/purchase-orders/", payload);
  return response.data;
}

export async function fetchShipments() {
  const response = await apiClient.get("/shipments/");
  return response.data;
}

export async function fetchCategoriesSummary() {
  const response = await apiClient.get("/categories/");
  return response.data;
}

export async function fetchDailyReport(dateString) {
  const response = await apiClient.get("/reports/daily/", {
    params: dateString ? { date: dateString } : {},
  });
  return response.data;
}
