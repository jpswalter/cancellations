import { RequestType } from '@/lib/db/schema';

export interface StructuredCSVResponse {
  headers: string[];
  data: Record<string, string>[];
  error: string | null;
  status: 'success' | 'error';
}

export type UploadState = {
  selectedRequestType: RequestType;
  selectedProviderId?: string;
  filename?: string;
  csv?: StructuredCSVResponse;
  csvFormData?: FormData;
};

export const enum UPLOAD_ACTION_TYPES {
  SET_STEP = 'SET_STEP',
  SET_CSV_RESPONSE = 'SET_CSV_RESPONSE',
  SET_UPLOADED_FILENAME = 'SET_UPLOADED_FILENAME',
  RESET_CSV_UPLOAD = 'RESET_CSV_UPLOAD',
  SET_CSV_FORM_DATA = 'SET_CSV_FORM_DATA',
  SET_SELECTED_PROVIDER = 'SET_SELECTED_PROVIDER',
  SET_SELECTED_REQUEST_TYPE = 'SET_SELECTED_REQUEST_TYPE',
}

type SetStepAction = {
  type: UPLOAD_ACTION_TYPES.SET_STEP;
  payload: number;
};

type SetCsvAction = {
  type: UPLOAD_ACTION_TYPES.SET_CSV_RESPONSE;
  payload: StructuredCSVResponse;
};

type SetUploadedFilenameAction = {
  type: UPLOAD_ACTION_TYPES.SET_UPLOADED_FILENAME;
  payload?: string;
};

type ResetCsvAction = {
  type: UPLOAD_ACTION_TYPES.RESET_CSV_UPLOAD;
};

type SetSelectedRequestTypeAction = {
  type: UPLOAD_ACTION_TYPES.SET_SELECTED_REQUEST_TYPE;
  payload: RequestType;
};

type SetCsvFormDataAction = {
  type: UPLOAD_ACTION_TYPES.SET_CSV_FORM_DATA;
  payload: FormData;
};

type SetSelectedProviderAction = {
  type: UPLOAD_ACTION_TYPES.SET_SELECTED_PROVIDER;
  payload?: string;
};

export type BatchUploadAction =
  | SetStepAction
  | SetCsvAction
  | ResetCsvAction
  | SetUploadedFilenameAction
  | SetCsvFormDataAction
  | SetSelectedProviderAction
  | SetSelectedRequestTypeAction;
