/**
 * Mock Synchronization Service
 * Simulates data updates and uploads to represent production cloud sync features.
 */

export interface SyncStatus {
  lastSyncedAt: string | null;
  status: 'idle' | 'syncing' | 'error' | 'success';
  pendingItemsCount: number;
}

export class MockSyncService {
  private listeners: Set<(status: SyncStatus) => void> = new Set();
  private currentStatus: SyncStatus = {
    lastSyncedAt: localStorage.getItem('mock_sync_last_time') || null,
    status: 'idle',
    pendingItemsCount: 0
  };

  constructor() {
    // Periodically checks if there are mock unsynced items
    setInterval(() => {
      this.checkPendingItems();
    }, 15000);
  }

  // Subscribe to synchronization status changes
  subscribe(callback: (status: SyncStatus) => void): () => void {
    this.listeners.add(callback);
    callback(this.currentStatus); // emit current status immediately
    return () => this.listeners.delete(callback);
  }

  private notify() {
    this.listeners.forEach(cb => cb({ ...this.currentStatus }));
  }

  // Set count of mock unsynced records
  setPendingItemsCount(count: number) {
    this.currentStatus.pendingItemsCount = count;
    this.notify();
  }

  private checkPendingItems() {
    // Simulates dynamic background generation of transaction logs for testing
    if (this.currentStatus.status === 'idle' && Math.random() > 0.85) {
      this.currentStatus.pendingItemsCount += Math.floor(Math.random() * 3) + 1;
      this.notify();
    }
  }

  // Simulate pushing transactions to the cloud
  async syncNow(): Promise<void> {
    if (this.currentStatus.status === 'syncing') return;

    this.currentStatus.status = 'syncing';
    this.notify();

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulates a 95% success rate for network syncing
        const isSuccessful = Math.random() < 0.95;

        if (isSuccessful) {
          const timestamp = new Date().toLocaleTimeString();
          localStorage.setItem('mock_sync_last_time', timestamp);
          this.currentStatus.lastSyncedAt = timestamp;
          this.currentStatus.status = 'success';
          this.currentStatus.pendingItemsCount = 0;
          this.notify();
          
          // Reset to idle status after showing success message
          setTimeout(() => {
            if (this.currentStatus.status === 'success') {
              this.currentStatus.status = 'idle';
              this.notify();
            }
          }, 3000);
          
          resolve();
        } else {
          this.currentStatus.status = 'error';
          this.notify();
          
          // Reset to idle status after showing error message
          setTimeout(() => {
            if (this.currentStatus.status === 'error') {
              this.currentStatus.status = 'idle';
              this.notify();
            }
          }, 4000);

          reject(new Error('Network connection timeout. Re-queueing transactions.'));
        }
      }, 1200);
    });
  }
}

export const syncService = new MockSyncService();
