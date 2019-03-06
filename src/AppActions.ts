import { useCallback, useEffect, useState } from "react";
import { Action, ActionType, AppState } from "./AppState";
import {
  addItem,
  deleteItem,
  getDB,
  getItem,
  getItems,
  getNextItem,
  updateItem
} from "./idb";
import { loadFromLocalStore, saveToLocalStore } from "./localStore";

export function useAppActions(
  state: AppState,
  dispatch: (action: Action) => void
): {
  searchAction: (item: { word: string }) => void;
  addAction: (item: { word: string }) => void;
  editAction: (item: {
    id: string;
    isKnown?: boolean;
    description?: string;
  }) => void;
  nextAction: (item: { id: string }) => void;
  selectAction: (item: { id: string }) => void;
  deleteAction: (item: { id: string }) => void;
} {
  const [dbPromise] = useState(getDB);

  useEffect(() => {
    const savedState = loadFromLocalStore();
    if (savedState != null) {
      dispatch({
        type: ActionType.INIT,
        payload: { state: savedState }
      });
    }
  }, []);

  useEffect(() => {
    saveToLocalStore(state);
  }, [state]);

  const addAction = useCallback(
    async ({ word }) => {
      dispatch({ type: ActionType.LOADING, payload: { isLoading: true } });

      const isKnown = false;
      const description = "";

      const item = await addItem(dbPromise, { word, isKnown, description });

      dispatch({ type: ActionType.ITEM, payload: { item } });
      dispatch({ type: ActionType.SEARCH, payload: { search: "" } });
      dispatch({
        type: ActionType.SEARCH_RESULT,
        payload: { searchResult: [] }
      });
      dispatch({ type: ActionType.LOADING, payload: { isLoading: false } });
    },
    [dbPromise]
  );

  const editAction = useCallback(
    async ({
      isKnown,
      description,
      id
    }: {
      isKnown?: boolean;
      description?: string;
      id: string;
    }) => {
      dispatch({ type: ActionType.LOADING, payload: { isLoading: true } });

      const item = await updateItem(dbPromise, { isKnown, description, id });

      dispatch({ type: ActionType.ITEM, payload: { item } });
      dispatch({ type: ActionType.LOADING, payload: { isLoading: false } });
    },
    [dbPromise]
  );

  const nextAction = useCallback(
    async ({ id }: { id: string }) => {
      dispatch({ type: ActionType.LOADING, payload: { isLoading: true } });

      const item = await getNextItem(dbPromise, { id });

      if (item != null) {
        dispatch({ type: ActionType.ITEM, payload: { item } });
      }

      dispatch({ type: ActionType.LOADING, payload: { isLoading: false } });
    },
    [dbPromise]
  );

  const searchAction = useCallback(
    async ({ word }) => {
      dispatch({ type: ActionType.LOADING, payload: { isLoading: true } });
      dispatch({ type: ActionType.SEARCH, payload: { search: word } });
      dispatch({ type: ActionType.ITEM, payload: {} });

      const searchResult = await getItems(dbPromise, { word });

      dispatch({ type: ActionType.SEARCH_RESULT, payload: { searchResult } });
      dispatch({ type: ActionType.LOADING, payload: { isLoading: false } });
    },
    [dbPromise]
  );

  const selectAction = useCallback(
    async ({ id }: { id: string }) => {
      dispatch({ type: ActionType.LOADING, payload: { isLoading: true } });

      const item = await getItem(dbPromise, { id });

      if (item != null) {
        dispatch({ type: ActionType.ITEM, payload: { item } });
      }

      dispatch({ type: ActionType.SEARCH, payload: { search: "" } });
      dispatch({
        type: ActionType.SEARCH_RESULT,
        payload: { searchResult: [] }
      });
      dispatch({ type: ActionType.LOADING, payload: { isLoading: false } });
    },
    [dbPromise]
  );

  const deleteAction = useCallback(
    async ({ id }: { id: string }) => {
      dispatch({ type: ActionType.LOADING, payload: { isLoading: true } });

      await deleteItem(dbPromise, { id });
      const item = (await getNextItem(dbPromise, { id })) || undefined;

      dispatch({ type: ActionType.ITEM, payload: { item } });
      dispatch({ type: ActionType.LOADING, payload: { isLoading: false } });
    },
    [dbPromise]
  );

  return {
    searchAction,
    addAction,
    editAction,
    nextAction,
    selectAction,
    deleteAction
  };
}
