import { UserMemory } from '../types';

const MEMORY_STORAGE_KEY = 'user_memory';

class MemoryManagerClass {
  private memory: UserMemory = this.loadMemory();

  private loadMemory(): UserMemory {
    try {
      const stored = localStorage.getItem(MEMORY_STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  }

  private saveMemory(): void {
    localStorage.setItem(MEMORY_STORAGE_KEY, JSON.stringify(this.memory));
  }

  processInput(input: string): void {
    const nameMatch = input.match(/benim adım\s+(\w+)/i);
    if (nameMatch) {
      this.memory.name = nameMatch[1];
      this.saveMemory();
    }
    
    this.memory.lastInteraction = new Date().toISOString();
    this.saveMemory();
  }

  getMemory(): UserMemory {
    return { ...this.memory };
  }

  clear(): void {
    this.memory = {};
    localStorage.removeItem(MEMORY_STORAGE_KEY);
  }
}

export const MemoryManager = new MemoryManagerClass();