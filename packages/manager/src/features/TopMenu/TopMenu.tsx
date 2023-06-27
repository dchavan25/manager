import MenuIcon from '@mui/icons-material/Menu';
import * as React from 'react';
import AppBar from 'src/components/core/AppBar';
import Hidden from 'src/components/core/Hidden';
import { IconButton } from 'src/components/IconButton';
import { makeStyles } from '@mui/styles';
import { Theme, useTheme } from '@mui/material/styles';
import clsx from 'clsx';
import { Toolbar } from 'src/components/Toolbar';
import Typography from 'src/components/core/Typography';
import { AddNewMenu } from './AddNewMenu/AddNewMenu';
import Community from './Community';
import Help from './Help';
import NotificationMenu from './NotificationMenu';
import SearchBar from './SearchBar';
import TopMenuIcon from './TopMenuIcon';
import UserMenu from './UserMenu';

const useStyles = makeStyles((theme: Theme) => ({
  appBar: {
    height: 50,
    color: theme.palette.text.primary,
    backgroundColor: theme.bg.bgPaper,
    position: 'relative',
    paddingRight: '0 !important',
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  toolbar: {
    padding: 0,
    height: `50px !important`,
    width: '100%',
  },
}));

interface Props {
  isSideMenuOpen: boolean;
  openSideMenu: () => void;
  desktopMenuToggle: () => void;
  isLoggedInAsCustomer: boolean;
  username: string;
}

const TopMenu = (props: Props) => {
  const {
    isSideMenuOpen,
    openSideMenu,
    username,
    isLoggedInAsCustomer,
    desktopMenuToggle,
  } = props;

  const theme = useTheme();
  const classes = useStyles();

  const communityIconStyles = {
    [theme.breakpoints.down(370)]: {
      ...theme.visually.hidden,
    },
  };

  const navHoverText = isSideMenuOpen
    ? 'Collapse side menu'
    : 'Expand side menu';

  return (
    <React.Fragment>
      {isLoggedInAsCustomer && (
        <div
          style={{
            backgroundColor: 'pink',
            padding: '1em',
            textAlign: 'center',
          }}
        >
          <Typography style={{ fontSize: '1.2em', color: 'black' }}>
            You are logged in as customer: <strong>{username}</strong>
          </Typography>
        </div>
      )}
      <AppBar className={classes.appBar}>
        <Toolbar className={classes.toolbar} variant="dense">
          <Hidden mdDown>
            <IconButton
              color="inherit"
              aria-label="open menu"
              onClick={desktopMenuToggle}
              size="large"
              data-testid="open-nav-menu"
            >
              <TopMenuIcon title={navHoverText} key={navHoverText}>
                <MenuIcon />
              </TopMenuIcon>
            </IconButton>
          </Hidden>
          <Hidden mdUp>
            <IconButton
              color="inherit"
              aria-label="open menu"
              onClick={openSideMenu}
              size="large"
            >
              <TopMenuIcon title={navHoverText} key={navHoverText}>
                <MenuIcon />
              </TopMenuIcon>
            </IconButton>
          </Hidden>
          <AddNewMenu />
          <SearchBar />
          <Help />
          <Community className={clsx(communityIconStyles)} />
          <NotificationMenu />
          <UserMenu />
        </Toolbar>
      </AppBar>
    </React.Fragment>
  );
};

export default React.memo(TopMenu);
