import React, { StrictMode, memo, Suspense, useEffect, lazy } from 'react';
import { render } from 'react-dom'
import { withStyles } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import RightBox from './components/RightBox';
import LeftDrawer from './components/LeftDrawer';
import { SettingsProvider } from './components/SettingsContext';

const styles = {
    container: {
        position: 'relative',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingTop: 41,
        width: '100%',
        height: '100%',
        margin: 0,
    }
};

const Container = withStyles(styles)(memo(({ classes }) => {
    return (
        <div className={classes.container}>
            <LeftDrawer />
            <RightBox />
        </div>
    )
}));

const App = memo(() => {
    return (
        <SettingsProvider>
            <CssBaseline />
            <Container />
        </SettingsProvider>
    )
})

export default (root) => {
    render(
        <App />,
        document.getElementById(root)
    )
}
