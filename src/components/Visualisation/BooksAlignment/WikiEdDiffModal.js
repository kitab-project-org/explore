import { useContext } from "react";
import { Box, Grid, IconButton, Modal, Typography } from "@mui/material";
import { Context } from "../../../App";

const WikiEdDiffModal = ({ data }) => {
  const { showWikiEdDiff, setWikiEdDiff } = useContext(Context);

  return (
    <Modal
      open={showWikiEdDiff}
      onClose={() => setWikiEdDiff(false)}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Grid
        container
        fontSize={"20px"}
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: {
            xs: "100%",
            sm: "80%",
            lg: "60%",
          },
          height: {
            xs: "100vh",
            sm: "max-content",
          },
          overflow: "scroll",
          bgcolor: "background.paper",
          boxShadow: 24,
          p: {
            xs: 2,
            sm: 5,
          },
        }}
      >
        <Grid item md={12} textAlign={"right"}>
          <Box
            sx={{ mb: "20px" }}
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography variant="h5" textAlign="left">
              Original inline wikEdDiff output:
            </Typography>
            <IconButton
              sx={{ width: "40px", height: "40px" }}
              onClick={() => setWikiEdDiff(false)}
            >
              <i className="fa-solid fa-xmark"></i>
            </IconButton>
          </Box>
          <Box fontSize="20px" sx={{ wordWrap: "break-word" }}>
            <div
              dangerouslySetInnerHTML={{
                __html: data,
              }}
            />
          </Box>
        </Grid>
      </Grid>
    </Modal>
  );
};

export default WikiEdDiffModal;
