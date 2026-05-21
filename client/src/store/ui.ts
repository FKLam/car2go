import { create } from 'zustand';

interface UIState {
  showCustomerList: boolean;
  toggleCustomerList: () => void;
}

export const useUiStore = create<UIState>((set) => ({
  showCustomerList: true,
  toggleCustomerList: () => set((state) => ({ showCustomerList: !state.showCustomerList })),
}));
