export function saveOfflineResult(result: any) {
  const offlineResults = JSON.parse(
    localStorage.getItem("offlineResults") || "[]",
  );
  offlineResults.push(result);
  localStorage.setItem("offlineResults", JSON.stringify(offlineResults));
}

export async function syncOfflineData() {
  if (!navigator.onLine) return;

  const offlineResults = JSON.parse(
    localStorage.getItem("offlineResults") || "[]",
  );
  if (offlineResults.length === 0) return;

  try {
    const response = await fetch("/api/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ results: offlineResults }),
    });

    if (response.ok) {
      localStorage.removeItem("offlineResults");
      console.log("Successfully synced offline data");
    }
  } catch (error) {
    console.error("Failed to sync offline data:", error);
  }
}

// Add event listeners for online/offline
window.addEventListener("online", syncOfflineData);

// Periodically check and sync
setInterval(syncOfflineData, 60000); // Every minute
