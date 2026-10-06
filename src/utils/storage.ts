export async function requestPersistentStorage() {
  if (!('storage' in navigator) || !navigator.storage.persist) return false
  try {
    if (await navigator.storage.persisted()) return true
    return await navigator.storage.persist()
  } catch {
    return false
  }
}

export async function persistentStorageStatus() {
  if (!('storage' in navigator) || !navigator.storage.persisted) return false
  try { return await navigator.storage.persisted() } catch { return false }
}
