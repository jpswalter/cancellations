'use client';
import {
  UploadState,
  BatchUploadAction,
  UPLOAD_ACTION_TYPES,
} from '../upload.types';

export const initialState: UploadState = {
  selectedRequestType: 'Cancellation',
};

export const uploadReducer = (
  state: UploadState,
  action: BatchUploadAction,
): UploadState => {
  switch (action.type) {
    case UPLOAD_ACTION_TYPES.SET_CSV_RESPONSE:
      return {
        ...state,
        csv: action.payload,
      };

    case UPLOAD_ACTION_TYPES.SET_UPLOADED_FILENAME:
      return {
        ...state,
        filename: action.payload,
      };

    case UPLOAD_ACTION_TYPES.RESET_CSV_UPLOAD:
      return {
        ...state,
        csv: undefined,
        filename: undefined,
      };

    case UPLOAD_ACTION_TYPES.SET_CSV_FORM_DATA:
      return {
        ...state,
        csvFormData: action.payload,
      };

    case UPLOAD_ACTION_TYPES.SET_SELECTED_PROVIDER:
      return {
        ...state,
        selectedProviderId: action.payload,
      };

    case UPLOAD_ACTION_TYPES.SET_SELECTED_REQUEST_TYPE:
      return {
        ...state,
        selectedRequestType: action.payload,
      };

    default:
      return state;
  }
};
