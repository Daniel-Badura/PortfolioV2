import {
  configureStore,
  combineReducers,
  Middleware,
  ThunkAction,
  Action,
} from "@reduxjs/toolkit";
import thunk from "redux-thunk";

import {
  projectDetailsReducer,
  projectListReducer,
} from "../reducers/projectReducers";

// const middleware: Middleware[] = [thunk];

const reducer = combineReducers({
  projectDetails: projectDetailsReducer,
  projectList: projectListReducer,
});

const preloadedState = {
  projectList: {
    projects: [{ name: "initial", image: "images/testwowo.jpg" }],
    error: "initial",
  },
};

export const store = configureStore({
  reducer,
  preloadedState,
  // middleware: middleware,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
