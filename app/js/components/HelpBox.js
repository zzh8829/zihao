import React, { useEffect, useState, useContext } from 'react';
import classNames from 'classnames';
import fetchResource from 'fetch-suspense';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card'
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import CircularProgress from '@material-ui/core/CircularProgress';
import { SettingsContext } from './SettingsContext';
import CloseIcon from '@material-ui/icons/Close';
import IconButton from '@material-ui/core/IconButton';
import { Typography } from '@material-ui/core';

const styles = theme => ({
    card: {
        background: "rgba(255, 255, 255, 0.7)",
        pointerEvents: 'auto',
        margin: 40,
        maxHeight: "calc(100% - 80px)",
        display: 'flex',
        flexDirection: 'column',
        padding: 16,
        maxWidth: '16rem'
    },
    root: {
        opacity: 1,
        transition: '1s'
    },
    hidden: {
        opacity: 0
    }
});

const HelpCard = (props) => {
    const { classes } = props;
    const [settings, dispatch] = useContext(SettingsContext);
    const [hidden, setHidden] = useState(false);

    useEffect(() => {
        if (settings.showHelpFirstTime) {
            setTimeout(() => setHidden(true), 15000);
            setTimeout(() => dispatch({ type: 'HIDE_HELP_FIRST_TIME' }), 16000);
        }
    }, [])

    return (settings.showHelp &&
        <div className={classNames(classes.root, { [classes.hidden]: hidden && settings.showHelpFirstTime })}>
            <Card className={classes.card}>
                <Typography className={classes.title} color="textSecondary">
                    Woooooooow
                </Typography>
                <Typography variant="h5">
                    What is this ?
                </Typography>
                <Typography>
                    ZZ's block world is a multiplayer interactive experience. Everything you see here is synchronized across all users in real-time.
                </Typography>
                <Typography style={{
                    // color: settings.material,
                    // textShadow: '-1px 0 black, 0 1px black, 1px 0 black, 0 -1px black'
                    textShadow: `0 0 3px ${settings.material}`
                }}>
                    Have fun and be creative!
                </Typography>
            </Card>
        </div>
    );
}

HelpCard.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(HelpCard);
