import { Box, IconButton, Typography } from "@mui/material";

const ContentHeader = ({
  handleOpen,
  data,
  bookNumber,
  ms,
  parsedBookAlignment,
  isLeft,
}) => {
  return (
    <Box
      display={"flex"}
      height={"50px"}
      width={"100%"}
      bgcolor={"#f3f4f6"}
      mb={1}
      borderRadius={"5px"}
      alignItems={"center"}
      justifyContent={"space-between"}
    >
      <Box px={"10px"}>
        <Typography variant="body1">
          {bookNumber === 1 ? "Book 1" : "Book 2"}: {data?.title}
          {" ( milestone "}
          {data?.ms} {")"}
        </Typography>
      </Box>

      <Box px={"10px"}>
        <IconButton
          sx={{ fontSize: "18px" }}
          onClick={() =>
            handleOpen(bookNumber, ms, parsedBookAlignment, isLeft)
          }
        >
          <i className="fa-solid fa-up-right-and-down-left-from-center"></i>
        </IconButton>
        <IconButton
          sx={{ fontSize: "18px" }}
          onClick={() =>
            handleOpen(bookNumber, ms, parsedBookAlignment, isLeft)
          }
        >
          <i className="fa-solid fa-up-right-and-down-left-from-center"></i>
        </IconButton>
      </Box>
    </Box>
  );
};

export default ContentHeader;
