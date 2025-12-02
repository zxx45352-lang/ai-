import { ClothingItem } from '../types';

const DB_NAME = 'AI_Wardrobe_DB';
const STORE_NAME = 'clothing_items';
const DB_VERSION = 1;

export const initDB = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject('Database error');

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve();
  });
};

export const saveItem = (item: ClothingItem): Promise<void> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      // Ensure defaults
      if (item.isDeleted === undefined) item.isDeleted = false;
      if (item.isWishlist === undefined) item.isWishlist = false;
      
      store.put(item);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject('Save failed');
    };
  });
};

export const getAllItems = (): Promise<ClothingItem[]> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const getAllReq = store.getAll();
      getAllReq.onsuccess = () => {
        const items = getAllReq.result as ClothingItem[];
        items.sort((a, b) => b.createdAt - a.createdAt);
        resolve(items);
      };
      getAllReq.onerror = () => reject('Get all failed');
    };
  });
};

export const softDeleteItem = (id: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onsuccess = () => {
            const db = request.result;
            const tx = db.transaction(STORE_NAME, 'readwrite');
            const store = tx.objectStore(STORE_NAME);
            const getReq = store.get(id);
            getReq.onsuccess = () => {
                const item = getReq.result as ClothingItem;
                if(item) {
                    item.isDeleted = true;
                    item.deletedAt = Date.now();
                    store.put(item);
                }
                resolve();
            };
        };
    });
};

export const restoreItem = (id: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onsuccess = () => {
            const db = request.result;
            const tx = db.transaction(STORE_NAME, 'readwrite');
            const store = tx.objectStore(STORE_NAME);
            const getReq = store.get(id);
            getReq.onsuccess = () => {
                const item = getReq.result as ClothingItem;
                if(item) {
                    item.isDeleted = false;
                    item.deletedAt = undefined;
                    store.put(item);
                }
                resolve();
            };
        };
    });
};

export const permanentDeleteItem = (id: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.delete(id);
      tx.oncomplete = () => resolve();
    };
  });
};

export const updateItemWearCount = (id: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onsuccess = () => {
        const db = request.result;
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const getReq = store.get(id);
        
        getReq.onsuccess = () => {
            const item = getReq.result as ClothingItem;
            if(item) {
                item.wearCount = (item.wearCount || 0) + 1;
                store.put(item);
            }
            resolve();
        }
        tx.onerror = () => reject('Update failed');
      };
    });
  };

export const toggleWishlist = (id: string, isWishlist: boolean): Promise<void> => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onsuccess = () => {
            const db = request.result;
            const tx = db.transaction(STORE_NAME, 'readwrite');
            const store = tx.objectStore(STORE_NAME);
            const getReq = store.get(id);
            getReq.onsuccess = () => {
                const item = getReq.result as ClothingItem;
                if(item) {
                    item.isWishlist = isWishlist;
                    // If moving to wishlist, ensure it's not deleted and vice versa logic if needed
                    store.put(item);
                }
                resolve();
            };
        };
    });
};