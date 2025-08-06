import { Box, Grid } from "@mui/material";
import NavigationBar from "../NavigationBar";
import Footer from "../Footer";

const Layout = ({ children }) => {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <NavigationBar />
        </Grid>
        <Grid item xs={12}>
          {children}
        </Grid>
        <Grid item xs={12}>
          <Footer />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Layout;
