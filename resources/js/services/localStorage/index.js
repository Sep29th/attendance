export function getLocalStorage(key) {
    const result = localStorage.getItem(key);
    return result !== null ? result : "";
  }

  export function setLocalStorage(key, value) {
    key !== "" && localStorage.setItem(key, value.toString());
  }

  export function deleteLocalStorage(key) {
    key !== "" && localStorage.removeItem(key);
  }

  export function deleteAllLocalStorage() {
    localStorage.clear();
  }
