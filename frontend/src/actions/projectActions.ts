import axios from "axios";
import {
  PROJECT_LIST_REQUEST,
  PROJECT_LIST_SUCCESS,
  PROJECT_LIST_FAIL,
  PROJECT_DETAILS_REQUEST,
  PROJECT_DETAILS_SUCCESS,
  PROJECT_DETAILS_FAIL,
} from "../constants/projectConstants";

import { Dispatch } from "redux";

export const listProjects =
  (keyword: string = "") =>
  async (dispatch: Dispatch) => {
    try {
      dispatch({ type: PROJECT_LIST_REQUEST });
      const { data } = await axios.get(`/api/projects?keyword=${keyword}`);
      dispatch({
        type: PROJECT_LIST_SUCCESS,
        payload: data,
      });
    } catch (error: any) {
      dispatch({
        type: PROJECT_LIST_FAIL,
        payload:
          error.response && error.response.data.message
            ? error.response.data.message
            : error.message,
      });
    }
  };

export const listProjectDetails =
  (id: string) => async (dispatch: Dispatch) => {
    try {
      dispatch({
        type: PROJECT_DETAILS_REQUEST,
      });
      const { data } = await axios.get(`/api/projects/${id}`);
      dispatch({
        type: PROJECT_DETAILS_SUCCESS,
        payload: data,
      });
    } catch (error: any) {
      dispatch({
        type: PROJECT_DETAILS_FAIL,
        payload:
          error.response && error.response.data.message
            ? error.response.data.message
            : error.message,
      });
    }
  };
