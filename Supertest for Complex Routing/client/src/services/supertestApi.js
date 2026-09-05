const BASE_URL = "/api/records";

export async function fetchRecords() {
  const response = await fetch(BASE_URL);

  if (!response.ok) {
    throw new Error("Failed to load records. Please try again.");
  }

  const result = await response.json();
  return result.data;
}

export async function createRecord(payload) {
  const response = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const result = await response.json();

  if (!response.ok) {
    const error = new Error(result.message || "Failed to create record.");
    error.fieldErrors = result.errors || {};
    throw error;
  }

  return result.data;
}
