import React, { StrictMode, memo, Suspense, useEffect, lazy } from 'react';
import { render } from 'react-dom'
import { withStyles } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import Grid from '@material-ui/core/Grid';
import LeftBar from './components/LeftBar';
import RightBar from './components/RightBar';
import LeftDrawer from './components/LeftDrawer';

const styles = {
    container: {
        padding: '61px 20px 20px 20px',
        width: '100%',
        margin: 0,
    }
};

const Container = withStyles(styles)(memo(({ classes }) => {
    return (
        <>
            <LeftDrawer />
        </>
    )
//     <Grid container spacing={24} className={classes.container} justify="space-between">
//     <Grid item>
//         {/* <LeftBar /> */}
//     </Grid>
//     <Grid item>
//         <RightBar />
//     </Grid>
// </Grid>
}));

const App = memo(() => {
    return (
        <>
            <CssBaseline />
            <Container />
        </>
    )
})

export default (root) => {
    render(
        <App />,
        document.getElementById(root)
    )
}
