import { configureStore, combineReducers } from "@reduxjs/toolkit";
import thunk from "redux-thunk";
import {
  projectDetailsReducer,
  projectListReducer,
} from "./reducers/projectReducers";
const middleware = [thunk];
const reducer = combineReducers({
  testDetails: projectDetailsReducer,
  testList: projectListReducer,
});

const initialState = {};

const store = configureStore({
  reducer,
  preloadedState: initialState,
  middleware: middleware,
});

export default store;
