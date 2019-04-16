import React, { memo, Suspense, useContext } from 'react';
import fetchResource from 'fetch-suspense';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card'
import CardHeader from '@material-ui/core/CardHeader';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import CircularProgress from '@material-ui/core/CircularProgress';
import { SettingsContext } from './SettingsContext';
import CloseIcon from '@material-ui/icons/Close';
import IconButton from '@material-ui/core/IconButton';

const styles = theme => ({
    card: {
        background: "rgba(255, 255, 255, 0.7)",
        pointerEvents: 'auto',
        margin: 40,
        maxHeight: "calc(100% - 80px)",
        display: 'flex',
        flexDirection: 'column'
    },
    cardHeader: {
        paddingBottom: 0,
        flex: '0 0 auto'
    },
    spinner: {
        display: 'flex',
        justifyContent: 'center',
        margin: 20,
    },
    list: {
        flex: '0 1 auto',
        overflowY: 'scroll'
    }
});

const MapCacheList = withStyles(styles)(memo(({ classes }) => {
    const cache = fetchResource('https://nodecraft.cloud.zihao.me/mapcache')
    return (
        <List className={classes.list}>
            {cache.slice().reverse().map(({ tag, data }, i) => {
                return <ListItem key={i} button onClick={() => {
                    window.craft.clearBlocks();
                    for (const pos of Object.keys(data)) {
                        window.craft.insertBlock(pos.split(',').map(Number), data[pos]);
                    }
                }}>
                    <ListItemText primary={`World #${cache.length - i}: ${tag}`} />
                </ListItem>
            })}
        </List>
    )
}))

const HistoryCard = memo((props) => {
    const { classes } = props;
    const [settings, dispatch] = useContext(SettingsContext);

    return (settings.showHistory &&
        <Card className={classes.card}>
            <CardHeader
                className={classes.cardHeader}
                title="Block History"
                subheader="restore block world to an old version"
                action={
                    <IconButton
                        className={classes.button} color="secondary" aria-label="Close"
                        onClick={() => dispatch({ type: 'SET', settings: { showHistory: false } })}
                    >
                        <CloseIcon />
                    </IconButton>
                }
            />
            <Suspense fallback={
                <div className={classes.spinner}>
                    <CircularProgress />
                </div>
            }>
                <MapCacheList />
            </Suspense>
        </Card>
    );
})

HistoryCard.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(HistoryCard);
