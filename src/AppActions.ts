import { useCallback, useEffect, useState } from "react";
import { Action, ActionType, AppState } from "./AppState";
import {
  addItem,
  addItems,
  deleteItem,
  getDB,
  getItem,
  getItems,
  getNextItem,
  updateItem,
  getAllItems
} from "./idb";
import { loadFromLocalStore, saveToLocalStore } from "./localStore";
import { saveAs } from "file-saver";

export function useAppActions(
  state: AppState,
  dispatch: (action: Action) => void
): {
  searchAction: (item: { word: string }) => void;
  addAction: (item: {
    word: string;
    description?: string;
    isKnown?: boolean;
  }) => void;
  loadAction: (
    items: {
      word: string;
      description?: string;
      isKnown?: boolean;
    }[]
  ) => void;
  editAction: (item: {
    id: string;
    isKnown?: boolean;
    description?: string;
  }) => void;
  nextAction: (item: { id: string }) => void;
  selectAction: (item: { id: string }) => void;
  deleteAction: (item: { id: string }) => void;
  downloadAction: () => void;
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
    async ({ word, description = "", isKnown = false }) => {
      dispatch({ type: ActionType.LOADING, payload: { isLoading: true } });

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

  const loadAction = useCallback(
    async (
      items: { word: string; description?: string; isKnown?: boolean }[]
    ) => {
      dispatch({ type: ActionType.LOADING, payload: { isLoading: true } });

      await addItems(
        dbPromise,
        items.map(({ word, description, isKnown }) => ({
          word,
          description: description || "",
          isKnown: isKnown != null ? isKnown : false
        }))
      );

      dispatch({ type: ActionType.LOADING, payload: { isLoading: false } });
    },
    [dbPromise]
  );

  const downloadAction = useCallback(async () => {
    dispatch({ type: ActionType.LOADING, payload: { isLoading: true } });

    const items = await getAllItems(dbPromise);
    const blob = new File([JSON.stringify(items)], "dictionary.json", {
      type: "application/json"
    });

    saveAs(blob, "dictionary.json");

    dispatch({ type: ActionType.LOADING, payload: { isLoading: false } });
  }, [dbPromise]);

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
    deleteAction,
    loadAction,
    downloadAction
  };
}
