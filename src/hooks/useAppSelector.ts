import { useSelector, TypedUseSelectorHook } from 'react-redux';
import { RootState } from '../redux/store';

// Pre-typed version of useSelector.
// Use this instead of plain useSelector() in every component.
// Every call automatically knows the full shape of the Redux state.
const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export default useAppSelector;
