// Mock localStorage for Zustand persist
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock });

import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { useMarketplaceStore } from '@/store/useMarketplaceStore';

beforeEach(() => {
  useMarketplaceStore.setState({
    savedPropertyIds: [],
    viewHistory: [],
    contactedPropertyIds: [],
  });
});

describe('Marketplace Store — Property 5: Save/unsave round-trip', () => {
  // Feature: real-estate-marketplace, Property 5: Save/unsave round-trip
  it('save adds ID to savedPropertyIds, unsave removes it, no duplicates after repeated saves', () => {
    fc.assert(
      fc.property(fc.string(), (id) => {
        // Reset state for each run
        useMarketplaceStore.setState({ savedPropertyIds: [] });

        const { saveProperty, unsaveProperty } = useMarketplaceStore.getState();

        // Save once — ID should appear
        saveProperty(id);
        expect(useMarketplaceStore.getState().savedPropertyIds).toContain(id);

        // Save again — no duplicates
        saveProperty(id);
        const afterDoubleSave = useMarketplaceStore.getState().savedPropertyIds;
        const occurrences = afterDoubleSave.filter((sid) => sid === id).length;
        expect(occurrences).toBe(1);

        // Unsave — ID should be gone
        unsaveProperty(id);
        expect(useMarketplaceStore.getState().savedPropertyIds).not.toContain(id);
      }),
      { numRuns: 100 }
    );
  });

  it('unsaving a non-saved ID leaves the list unchanged', () => {
    fc.assert(
      fc.property(fc.string(), fc.string(), (savedId, otherId) => {
        fc.pre(savedId !== otherId);
        useMarketplaceStore.setState({ savedPropertyIds: [savedId] });

        useMarketplaceStore.getState().unsaveProperty(otherId);
        expect(useMarketplaceStore.getState().savedPropertyIds).toEqual([savedId]);
      }),
      { numRuns: 100 }
    );
  });
});

describe('Marketplace Store — Property 6: View history records visits', () => {
  // Feature: real-estate-marketplace, Property 6: View history records visits
  it('recorded ID appears at front of viewHistory, no duplicates on repeated visits', () => {
    fc.assert(
      fc.property(fc.string(), (id) => {
        useMarketplaceStore.setState({ viewHistory: [] });

        const { recordView } = useMarketplaceStore.getState();

        // First visit — ID should be at front
        recordView(id);
        const afterFirst = useMarketplaceStore.getState().viewHistory;
        expect(afterFirst[0]).toBe(id);

        // Second visit — still at front, no duplicate
        recordView(id);
        const afterSecond = useMarketplaceStore.getState().viewHistory;
        expect(afterSecond[0]).toBe(id);
        const occurrences = afterSecond.filter((vid) => vid === id).length;
        expect(occurrences).toBe(1);
      }),
      { numRuns: 100 }
    );
  });

  it('visiting a second property moves it to front while keeping prior entry', () => {
    fc.assert(
      fc.property(fc.string(), fc.string(), (idA, idB) => {
        fc.pre(idA !== idB);
        useMarketplaceStore.setState({ viewHistory: [] });

        const { recordView } = useMarketplaceStore.getState();

        recordView(idA);
        recordView(idB);

        const history = useMarketplaceStore.getState().viewHistory;
        expect(history[0]).toBe(idB);
        expect(history).toContain(idA);

        // No duplicates overall
        const unique = new Set(history);
        expect(unique.size).toBe(history.length);
      }),
      { numRuns: 100 }
    );
  });
});
