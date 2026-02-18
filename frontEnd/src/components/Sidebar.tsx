import {
  Box,
  CssBaseline,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Drawer as MuiDrawer,
  styled,
  Typography
} from '@mui/material';
import { useEffect, useMemo } from 'react';

import {
  Home as DashboardIcon,
} from "./icons/CustomIcons"
import type { Theme, CSSObject } from '@mui/material/styles';
import Mohawk from '../assets/Mohawk.png';
import MohawkLogo from "../assets/Mohawk logo.png";
import { NavLink, useLocation, useNavigate } from 'react-router';
import { useAuth } from '../auth/useAuth';


const drawerWidth = 240;

const openedMixin = (theme: Theme): CSSObject => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
});

const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  [theme.breakpoints.up('xs')]: {
    width: `calc(${theme.spacing(9)} + 1px)`,
  },
});

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(0, 2, 0, 2),
  minHeight: '64px',
  backgroundColor: '#0080BC',
  color: 'white',
}));



const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    ...(open && {
      ...openedMixin(theme),
      '& .MuiDrawer-paper': {
        ...openedMixin(theme),
        borderRight: 'none',
        backgroundColor: '#0080BC',
        color: 'white',

      },
    }),
    ...(!open && {
      ...closedMixin(theme),
      '& .MuiDrawer-paper': {
        ...closedMixin(theme),
        borderRight: 'none',
        backgroundColor: '#0080BC',
        color: 'white',
        overflowX: 'hidden',
      },
    }),
  }),
);

const menuItems = [
  { text: 'Home', icon: <DashboardIcon />, path: '/', roles: ['eTendering.Vendor'] },
  { text: 'Templates', icon: <DashboardIcon />, path: '/templates', roles: ['eTendering.Admin'] },
  { text: 'Tenders', icon: <DashboardIcon />, path: '/tenders', roles: ['eTendering.Admin'] },

];


interface SidebarProps {
  open: boolean;
  handleDrawerClose?: () => void;
}

const Sidebar = ({ open }: SidebarProps) => {
  const { roles } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const menuToShow = useMemo(() => {
    const filtered = menuItems.filter((item) =>
      item.roles?.some((role) => roles.includes(role))
    );

    return filtered.length > 0 ? filtered : menuItems;
  }, [roles]);

  useEffect(() => {
    const firstPath = menuToShow[0]?.path;
    const isCurrentPathVisible = menuToShow.some((item) => item.path === location.pathname);

    if (firstPath && !isCurrentPathVisible) {
      navigate(firstPath, { replace: true });
    }
  }, [location.pathname, menuToShow, navigate]);

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <Drawer variant="permanent" open={open}>
        <DrawerHeader>
          {
            open ? (
              <Box sx={{ display: 'flex', alignItems: 'center', marginTop: '10px' }}>
                <img src={Mohawk} alt="Mohawk" width={200} style={{ backgroundColor: '#0080BC' }} />
              </Box>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', margin: '10px 0 0 10px' }}>
                <img src={MohawkLogo} alt="MohawkLogo" width={30} style={{ backgroundColor: '#0080BC' }} />
              </Box>
            )
          }

        </DrawerHeader>
        <List sx={{ py: 0, height: "100vh" }}>
          {menuToShow.map((item) => {
            const hasRoute = Boolean(item.path);


            return (
              <ListItem key={item.text} disablePadding sx={{ display: 'block' }}>
                <ListItemButton
                  component={hasRoute ? NavLink : 'button'}
                  to={hasRoute ? (item.path as string) : undefined}
                  end={hasRoute && item.path === '/' ? true : undefined}
                  sx={{
                    minHeight: 56,
                    justifyContent: open ? 'initial' : 'center',
                    px: 3.5,
                    width: "100%",
                    '&[aria-current="page"]': {
                      background: 'transparent',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        left: '14px',
                        right: '0px',
                        top: '8px',
                        bottom: '8px',
                        background: 'linear-gradient(135deg, #4FC3F7 0%, #0080BC 100%)',
                        borderRadius: '8px',
                        zIndex: 0,
                        borderBottomRightRadius: 0,
                        borderTopRightRadius: 0,

                      },
                      '& .MuiListItemIcon-root, & .MuiListItemText-root': {
                        background: 'transparent',
                        position: 'relative',
                        zIndex: 1,
                      },
                      '& .MuiListItemIcon-root': {
                        color: 'white',
                      },
                      '& .MuiListItemText-root .MuiTypography-root': {
                        color: 'white',
                        fontWeight: 600,

                      },
                      '&:hover::before': {
                        background: 'linear-gradient(135deg, #4FC3F7 0%, #0080BC 100%)'
                      },
                      '&:active::before': {
                        background: 'linear-gradient(135deg, #4FC3F7 0%, #0080BC 100%)'
                      },
                    },
                    '&:not([aria-current="page"])': {
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.1)'
                      },
                      '&:active': {
                        backgroundColor: 'rgba(255, 255, 255, 0.15)',
                        transform: 'scale(0.98)'
                      },
                    },
                    transition: 'all 0.2s ease-in-out',
                    position: 'relative',
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: open ? 2.5 : 'auto',
                      justifyContent: 'center',
                      color: '#B3E5FC',
                      '& .MuiSvgIcon-root': {
                        fontSize: 20,
                      },
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      variant: 'body1',
                      color: '#B3E5FC',
                      fontWeight: 400,
                      fontSize: '14px',
                    }}
                    sx={{ opacity: open ? 1 : 0 }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
          {
            open ? (
              <Typography sx={{
                position: "absolute", display: "block", width: "100%", padding: "10px 0",
                borderTop: "1px solid white", bottom: "0%", paddingLeft: "65px"
              }}>
                E-Tendering
              </Typography>
            ) : null
          }
        </List>
      </Drawer>
    </Box>
  );
};

export default Sidebar;