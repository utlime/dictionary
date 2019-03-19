import { useCallback, useEffect, useState } from "react";
import { AppAction, ActionType, AppState, Item } from "./AppState";
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

export type SearchAction = (search: { search: string }) => void;

export type AddAction = (
  item: Pick<Item, "word"> & Partial<Pick<Item, "description" | "isKnown">>
) => void;

export type UploadAction = (
  items: (Pick<Item, "word"> &
    Partial<Pick<Item, "description" | "isKnown" | "id">>)[]
) => void;

export type EditAction = (
  item: Pick<Item, "id"> &
    Partial<Pick<Item, "isKnown" | "description" | "word">>
) => void;

export type NextAction = (item: Pick<Item, "id">) => void;

export type SelectAction = (item: Pick<Item, "id">) => void;

export type DeleteAction = (item: Pick<Item, "id">) => void;

export type DownloadAction = () => void;

export function useAppActions(
  state: AppState,
  dispatch: AppAction
): {
  searchAction: SearchAction;
  addAction: AddAction;
  uploadAction: UploadAction;
  editAction: EditAction;
  nextAction: NextAction;
  selectAction: SelectAction;
  deleteAction: DeleteAction;
  downloadAction: DownloadAction;
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

  const addAction: AddAction = useCallback(
    async ({
      word,
      description = "",
      isKnown = false
    }: Pick<Item, "word"> & Partial<Pick<Item, "description" | "isKnown">>) => {
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

  const uploadAction: UploadAction = useCallback(
    async (
      items: (Pick<Item, "word"> &
        Partial<Pick<Item, "description" | "isKnown">>)[]
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

  const downloadAction: DownloadAction = useCallback(async () => {
    dispatch({ type: ActionType.LOADING, payload: { isLoading: true } });

    const items = await getAllItems(dbPromise);
    const blob = new File([JSON.stringify(items)], "dictionary.json", {
      type: "application/json"
    });

    saveAs(blob, "dictionary.json");

    dispatch({ type: ActionType.LOADING, payload: { isLoading: false } });
  }, [dbPromise]);

  const editAction: EditAction = useCallback(
    async ({
      isKnown,
      description,
      word,
      id
    }: Pick<Item, "id"> &
      Partial<Pick<Item, "isKnown" | "description" | "word">>) => {
      dispatch({ type: ActionType.LOADING, payload: { isLoading: true } });

      const item = await updateItem(dbPromise, {
        isKnown,
        description,
        id,
        word
      });

      dispatch({ type: ActionType.ITEM, payload: { item } });
      dispatch({ type: ActionType.LOADING, payload: { isLoading: false } });
    },
    [dbPromise]
  );

  const nextAction: NextAction = useCallback(
    async ({ id }: Pick<Item, "id">) => {
      dispatch({ type: ActionType.LOADING, payload: { isLoading: true } });

      const item = await getNextItem(dbPromise, { id });

      if (item != null) {
        dispatch({ type: ActionType.ITEM, payload: { item } });
      }

      dispatch({ type: ActionType.LOADING, payload: { isLoading: false } });
    },
    [dbPromise]
  );

  const searchAction: SearchAction = useCallback(
    async ({ search }: { search: string }) => {
      dispatch({ type: ActionType.LOADING, payload: { isLoading: true } });
      dispatch({ type: ActionType.SEARCH, payload: { search } });
      dispatch({ type: ActionType.ITEM, payload: {} });

      let word;
      let id;

      if (search[0] === "#") {
        const tmpId = Number.parseInt(search.slice(1), 10);
        if (!Number.isNaN(tmpId)) {
          id = tmpId;
        }
      } else {
        word = search;
      }

      const searchResult = await getItems(dbPromise, { word, id });

      dispatch({ type: ActionType.SEARCH_RESULT, payload: { searchResult } });
      dispatch({ type: ActionType.LOADING, payload: { isLoading: false } });
    },
    [dbPromise]
  );

  const selectAction: SelectAction = useCallback(
    async ({ id }: Pick<Item, "id">) => {
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

  const deleteAction: DeleteAction = useCallback(
    async ({ id }: Pick<Item, "id">) => {
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
    uploadAction,
    downloadAction
  };
}
