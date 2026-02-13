import storage from "redux-persist/lib/storage";
import { configureStore } from "@reduxjs/toolkit";
import type { Middleware } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import type { PersistConfig } from "redux-persist";
import rootReducer from "../reducers";
import ApproverMatrixDataAPI from "../../api/eTenderingApi";


export type RootState = ReturnType<typeof rootReducer>;

const persistConfig: PersistConfig<RootState> = {
  key: "root",
  storage,
  whitelist: [""],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const middleware: Middleware[] = [ApproverMatrixDataAPI.middleware];
const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(middleware),
});

const persistor = persistStore(store);

export type AppDispatch = typeof store.dispatch;
export { store, persistor };
