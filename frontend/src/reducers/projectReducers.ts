import {
  PROJECT_LIST_REQUEST,
  PROJECT_LIST_SUCCESS,
  PROJECT_LIST_FAIL,
  PROJECT_DETAILS_REQUEST,
  PROJECT_DETAILS_SUCCESS,
  PROJECT_DETAILS_FAIL,
} from "../constants/projectConstants";

interface ProjectListState {
  loading: boolean;
  projects: any[]; // Update the type of 'projects' as needed
  error?: string;
}

export const projectListReducer = (
  state: ProjectListState = { loading: false, projects: [] },
  action: any // Update the type of 'action' as needed
): ProjectListState => {
  switch (action.type) {
    case PROJECT_LIST_REQUEST:
      return { loading: true, projects: [] };
    case PROJECT_LIST_SUCCESS:
      return {
        loading: false,
        projects: action.payload.projects,
      };
    case PROJECT_LIST_FAIL:
      return { loading: false, error: action.payload, projects: [] };
    default:
      return state;
  }
};

interface ProjectDetailsState {
  loading: boolean;
  project: any; // Update the type of 'project' as needed
  error?: string;
}

export const projectDetailsReducer = (
  state: ProjectDetailsState = { loading: false, project: {} },
  action: any // Update the type of 'action' as needed
): ProjectDetailsState => {
  switch (action.type) {
    case PROJECT_DETAILS_REQUEST:
      return { ...state, loading: true };
    case PROJECT_DETAILS_SUCCESS:
      return { loading: false, project: action.payload };
    case PROJECT_DETAILS_FAIL:
      return { loading: false, error: action.payload, project: {} };
    default:
      return state;
  }
};
