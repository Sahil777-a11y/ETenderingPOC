import { combineReducers } from "@reduxjs/toolkit";
import ApproverMatrixDataAPI from "../../api/eTenderingApi";
const rootReducer = combineReducers({
  [ApproverMatrixDataAPI.reducerPath]: ApproverMatrixDataAPI.reducer,
});

export default rootReducer;
