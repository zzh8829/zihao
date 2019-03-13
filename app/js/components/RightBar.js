import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card'
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';
import Switch from '@material-ui/core/Switch';
import WifiIcon from '@material-ui/icons/Wifi';
import ThreeDRotation from '@material-ui/icons/ThreeDRotation';
import BluetoothIcon from '@material-ui/icons/Bluetooth';

const styles = theme => ({
    card: {
        background: "rgba(255, 255, 255, 0.7)",
        pointerEvents: 'auto'
    },
    list: {
        minWidth: 120,
        backgroundColor: theme.palette.background.paper
    },
});

const SwitchListSecondary = ({ classes }) => {
    const [autoRotate, setAutoRotate] = useState(true);

    return (
        <Card className={classes.card}>
            <List subheader={<ListSubheader>Settings</ListSubheader>} className={classes.list}>
                <ListItem>
                    <ListItemIcon>
                        <ThreeDRotation />
                    </ListItemIcon>
                    <ListItemSecondaryAction>
                        <Switch
                            onChange={() => setAutoRotate(!autoRotate)}
                            checked={autoRotate}
                        />
                    </ListItemSecondaryAction>
                </ListItem>
            </List>
        </Card>
    );
}

SwitchListSecondary.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(SwitchListSecondary);
