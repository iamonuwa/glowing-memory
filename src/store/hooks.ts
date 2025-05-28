import { useDispatch, useSelector } from "react-redux"
import type { RootState, AppDispatch } from "@/store"

/**
 * Custom hook that provides typed dispatch function for Redux actions
 * @returns {AppDispatch} A typed dispatch function that can be used to dispatch Redux actions
 * @example
 * const dispatch = useAppDispatch();
 * dispatch(someAction());
 */
export const useAppDispatch = () => useDispatch<AppDispatch>()

/**
 * Custom hook that provides typed selector function for accessing Redux state
 * @template T The type of the selected state
 * @param {function} selector A function that takes the Redux state and returns the selected value
 * @returns {T} The selected state value
 * @example
 * const drivers = useAppSelector(state => state.drivers);
 * const selectedDriver = useAppSelector(state => state.drivers[state.selectedDriverId]);
 */
export const useAppSelector = <T>(selector: (state: RootState) => T) =>
    useSelector(selector)
