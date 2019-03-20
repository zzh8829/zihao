import React, { useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { withStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ThreeSixtyIcon from '@material-ui/icons/ThreeSixty';
import AddBoxIcon from '@material-ui/icons/AddBox';
import ColorLensIcon from '@material-ui/icons/ColorLens'
import ColorizeIcon from '@material-ui/icons/Colorize'
import GridOnIcon from '@material-ui/icons/GridOn'
import GridOffIcon from '@material-ui/icons/GridOff'
import ZoomInIcon from '@material-ui/icons/ZoomIn';
import ZoomOutIcon from '@material-ui/icons/ZoomOut';
import IndeterminateCheckBoxIcon from '@material-ui/icons/IndeterminateCheckBox';
import HistoryIcon from '@material-ui/icons/History';
import HelpIcon from '@material-ui/icons/Help';
import { TwitterPicker } from 'react-color'
import Popover from '@material-ui/core/Popover';
import TWEEN from '@tweenjs/tween.js'
import { SettingsContext } from './SettingsContext';

const styles = theme => ({
    drawer: {
        display: 'flex',
        height: '100%',
        alignItems: 'center',
        flexShrink: 0,
        whiteSpace: 'nowrap',
    },
    drawerOpen: {
        width: 190,
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    },
    drawerClose: {
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        overflowX: 'hidden',
        width: 58,
    },
    paper: {
        borderRadius: '0px 4px 4px 0',
        borderRight: 'none',
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        pointerEvents: 'auto'
    },
    chevron: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingLeft: '4px'
    },
    chevronOpen: {
        justifyContent: 'flex-end',
    },
    enabled: {
        color: '#5badf0'
    },
    title: {
        fontSize: '1rem'
    },
    text: {
        marginLeft: 2
    }
});

const LeftDrawer = ({ classes }) => {
    const [open, setOpen] = useState(false);
    const [tool, setTool] = useState('add');
    const [zoom, setZoom] = useState(1);
    const [material, setMaterial] = useState('#feb74c');
    const [pickerAnchor, setPickerAnchor] = useState(null);
    const [autoRotate, setAutoRotate] = useState(true);
    const [showGrid, setShowGrid] = useState(true);
    const settings = useContext(SettingsContext);

    useEffect(() => {
        if (tool === 'add') {
            window.craft.removingBlock = false;
        }
        if (tool === 'remove') {
            window.craft.removingBlock = true;
        }
    }, [tool]);

    useEffect(() => {
        window.craft.addMaterial = material;
    }, [material]);

    useEffect(() => {
        window.craft.autoRotate = autoRotate;
    }, [autoRotate]);

    useEffect(() => {
        window.craft.showGrid = showGrid;
    }, [showGrid]);

    useEffect(() => {
        window.craft.showGrid = showGrid;
    }, [showGrid]);

    const zoomIn = (ratio) => {
        setZoom(Math.max(0.7, Math.min(1.5, zoom * ratio)))
    }

    useEffect(() => {
        new TWEEN.Tween(window.craft.props) // Create a new tween that modifies 'coords'.
            .to({ zoom }, 400)
            .easing(TWEEN.Easing.Quadratic.Out) // Use an easing function to make the animation smooth.
            .start();
    }, [zoom])

    return (
        <Drawer
            variant="permanent"
            className={classes.drawer}
            classes={{
                paper: classNames(classes.paper, {
                    [classes.drawerOpen]: open,
                    [classes.drawerClose]: !open,
                }),
            }}
            PaperProps={{
                elevation: 2,
                style: { position: 'relative', flex: 'none', height: 'auto' }
            }}
            ModalProps={{
                style: { position: 'absolute' }
            }}
            open={open}
        >
            <div className={classNames(classes.chevron, { [classes.chevronOpen]: open })}>
                {open && <Typography className={classes.title}> {"ZZ's Block World"} </Typography>}
                <IconButton onClick={() => setOpen(!open)}>
                    {open ? <ChevronLeftIcon /> : <ChevronRightIcon />}
                </IconButton>
            </div>
            <Divider />
            <List>
                <ListItem button onClick={() => setTool('add')}>
                    <AddBoxIcon className={classNames({ [classes.enabled]: tool === 'add' })} />
                    <ListItemText className={classes.text} primary={'Add Block'} />
                </ListItem>
                <ListItem button onClick={() => setTool('remove')}>
                    <IndeterminateCheckBoxIcon className={classNames({ [classes.enabled]: tool === 'remove' })} />
                    <ListItemText className={classes.text} primary={'Remove Block'} />
                </ListItem>
                {/* <ListItem button onClick={() => setTool('colorpicker')}>
                    <ColorizeIcon className={classNames({ [classes.enabled]: tool === 'colorpicker' })} />
                    <ListItemText className={classes.text} primary={'Color Picker'} />
                </ListItem> */}
                <Divider />
                <ListItem button onClick={(e) => setPickerAnchor(e.currentTarget)}>
                    <ColorLensIcon style={{ color: material }} />
                    <ListItemText className={classes.text} primary={'Color Palette'} />
                </ListItem>
                <ListItem button onClick={() => setAutoRotate(!autoRotate)}>
                    <ThreeSixtyIcon className={classNames({ [classes.enabled]: autoRotate })} />
                    <ListItemText className={classes.text} primary={'Auto Rotation'} />
                </ListItem>
                <ListItem button onClick={() => setShowGrid(!showGrid)}>
                    {showGrid ?
                        <GridOnIcon className={classes.enabled} /> :
                        <GridOffIcon />
                    }
                    <ListItemText className={classes.text} primary={'Show Gird'} />
                </ListItem>
                <ListItem button onClick={() => settings.set({showHistory: !settings.showHistory})}>
                    <HistoryIcon className={classNames({ [classes.enabled]: settings.showHistory })}/>
                    <ListItemText className={classes.text} primary={'View History'} />
                </ListItem>
                <Divider />
                <ListItem button onClick={() => zoomIn(0.9)}>
                    <ZoomInIcon />
                    <ListItemText className={classes.text} primary={'Zoom In'} />
                </ListItem>
                <ListItem button onClick={() => zoomIn(1.1)}>
                    <ZoomOutIcon />
                    <ListItemText className={classes.text} primary={'Zoom Out'} />
                </ListItem>
                {/* <ListItem button onClick={() => null}>
                    <HelpIcon />
                    <ListItemText className={classes.text} primary={'View Help'} />
                </ListItem> */}
            </List>
            <Popover open={Boolean(pickerAnchor)} anchorEl={pickerAnchor} anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
            }} onClose={() => setPickerAnchor(null)}>
                <TwitterPicker color={material} onChange={(c) => {
                    setPickerAnchor(null); setMaterial(c.hex);
                }} />
            </Popover>
        </Drawer>

    );
}

LeftDrawer.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles, { withTheme: true })(LeftDrawer);
