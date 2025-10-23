import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UserUIState {
	showCustomHeader: boolean;
}

type UserUIActions = {};

type UserUIStore = UserUIState & UserUIActions;

export const useUserStore = create<UserUIStore>()(
	persist(
		(set) => ({
			// State

			showCustomHeader: false,
		}),
		{
			name: "user-ui-storage",
			partialize: (state) => ({}),
		},
	),
);
