import React, { useState } from 'react';

export const SettingsContext = React.createContext();

export const SettingsProvider = (props) => {
  const state = {
    showHistory: false,
    set: (newState) => {
      setSettings({
        ...state,
        ...newState
      });
    }
  }

  const [settings, setSettings] = useState(state);
  return (
    <SettingsContext.Provider value={settings}>
      {props.children}
    </SettingsContext.Provider>
  )
}
