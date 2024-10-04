'use client';
import { useContext } from 'react';
import { UPLOAD_ACTION_TYPES, StructuredCSVResponse } from '../upload.types';
import { UploadCSVContext } from './UploadCSVProvider';
import { RequestType } from '@/lib/db/schema';

export const useUpload = () => {
  const context = useContext(UploadCSVContext);

  if (context === null) {
    throw new Error('useUploadBatch must be used within an UploadBatchContext');
  }

  const { state, dispatch } = context;

  /**
   * Wraps the dispatch function with a transition function before executing the action.
   *
   * @param {BatchUploadAction} action - The action to be dispatched.
   * @returns {void}
   *
   * @description
   * The `action` will only be dispatched after the transition has started, which ensures that the transition completes before the state change occurs.
   *
   * Transitions let you keep the user interface updates responsive even on slow devices. With a transition,
   * your UI stays responsive in the middle of a re-render, which improves the user experience and gives the impression
   * of a smoother transition between UI states.
   * @see https://beta.reactjs.org/reference/react/useTransition#marking-a-state-update-as-a-non-blocking-transition
   */

  const setCsvFormData = (payload: FormData) => {
    dispatch({ type: UPLOAD_ACTION_TYPES.SET_CSV_FORM_DATA, payload });
  };

  const setCsvResponse = (payload: StructuredCSVResponse) => {
    dispatch({ type: UPLOAD_ACTION_TYPES.SET_CSV_RESPONSE, payload });
  };

  const setUploadedFilename = (payload: string | undefined) => {
    dispatch({
      type: UPLOAD_ACTION_TYPES.SET_UPLOADED_FILENAME,
      payload,
    });
  };

  const resetCsvFile = () => {
    dispatch({ type: UPLOAD_ACTION_TYPES.RESET_CSV_UPLOAD });
    dispatch({
      type: UPLOAD_ACTION_TYPES.SET_UPLOADED_FILENAME,
      payload: '',
    });
  };

  const setSelectedProvider = (payload: string | undefined) => {
    dispatch({
      type: UPLOAD_ACTION_TYPES.SET_SELECTED_PROVIDER,
      payload,
    });
  };

  const setSelectedRequestType = (payload: RequestType) => {
    dispatch({
      type: UPLOAD_ACTION_TYPES.SET_SELECTED_REQUEST_TYPE,
      payload,
    });
  };

  return {
    ...state,
    dispatch,
    setCsvResponse,
    resetCsvFile,
    setUploadedFilename,
    setCsvFormData,
    setSelectedProvider,
    setSelectedRequestType,
  };
};
