import {
  PROJECT_LIST_REQUEST,
  PROJECT_LIST_SUCCESS,
  PROJECT_LIST_FAIL,
  PROJECT_DETAILS_REQUEST,
  PROJECT_DETAILS_SUCCESS,
  PROJECT_DETAILS_FAIL,
} from "../constants/projectConstants";

interface ProjectListState {
  projects: any[];
  error?: string;
}

export const projectListReducer = (
  state: ProjectListState = { projects: [] },
  action: any
): ProjectListState => {
  switch (action.type) {
    case PROJECT_LIST_REQUEST:
      return { projects: [] };
    case PROJECT_LIST_SUCCESS:
      return {
        projects: action.payload,
        error: "",
      };
    case PROJECT_LIST_FAIL:
      return { error: action.payload, projects: [] };
    default:
      return state;
  }
};

interface ProjectDetailsState {
  project: any;
  error?: string;
}

export const projectDetailsReducer = (
  state: ProjectDetailsState = { project: {} },
  action: any
): ProjectDetailsState => {
  switch (action.type) {
    case PROJECT_DETAILS_REQUEST:
      return { ...state };
    case PROJECT_DETAILS_SUCCESS:
      return { project: action.payload };
    case PROJECT_DETAILS_FAIL:
      return { error: action.payload, project: {} };
    default:
      return state;
  }
};
