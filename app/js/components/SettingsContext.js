import React, { useReducer } from 'react';

export const SettingsContext = React.createContext();

const initialState = {
  showHistory: false,
  showHelp: true,
  showHelpFirstTime: true,
  material: '#feb74c'
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'SET':
      return {
        ...state,
        ...action.settings
      };
    case 'TOGGLE_RIGHT_BOX':
      if (action.toggle == 'history') {
        return {
          ...state,
          showHelpFirstTime: false,
          showHistory: !state.showHistory,
          showHelp: state.showHelp && state.showHistory
        }
      }
      else if (action.toggle == 'help') {
        return {
          ...state,
          showHelpFirstTime: false,
          showHelp: !state.showHelp,
          showHistory: state.showHistory && state.showHelp
        }
      }
      return state;
    case 'HIDE_HELP_FIRST_TIME':
      if (state.showHelpFirstTime) {
        return {
          ...state,
          showHelpFirstTime: false,
          showHelp: false
        }
      }
      return state;
    default:
      console.log('WARNING: unhandled transition', action, state)
      return state;
  }
};

export const SettingsProvider = (props) => {
  return (
    <SettingsContext.Provider value={useReducer(reducer, initialState)}>
      {props.children}
    </SettingsContext.Provider>
  )
}
