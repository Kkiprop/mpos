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

export async function fetchDailyReport(dateString) {
  const response = await apiClient.get("/reports/daily/", {
    params: dateString ? { date: dateString } : {},
  });
  return response.data;
}
