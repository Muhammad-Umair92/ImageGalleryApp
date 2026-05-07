import { useDispatch } from 'react-redux';
import { AppDispatch } from '../redux/store';

// Pre-typed version of useDispatch.
// Use this instead of plain useDispatch() in every component.
// This ensures dispatch understands async thunk action types.
const useAppDispatch = () => useDispatch<AppDispatch>();

export default useAppDispatch;
