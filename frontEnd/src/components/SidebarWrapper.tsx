import Sidebar from './Sidebar';
import { IconButton, Box } from '@mui/material';
import { ArrowLeft, ArrowRight } from '@mui/icons-material';

const SidebarWrapper = ({ open, toggleDrawer }: { open: boolean, toggleDrawer: () => void }) => {
  return (
    <Box>
      <IconButton
        onClick={toggleDrawer}
        sx={{
          position: 'fixed',
          top: '10%',
          left: open ? `230px` : `65px`,
          transform: 'translateY(-50%)',
          zIndex: 1300,
          backgroundColor: 'white',
          boxShadow: 2,
          transition: 'left 0.3s ease',
          width: 18,
          height: 34,
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {open ? <ArrowLeft /> : <ArrowRight />}
      </IconButton>

      <Sidebar open={open} handleDrawerClose={() => toggleDrawer()} />
    </Box>
  );
};

export default SidebarWrapper;