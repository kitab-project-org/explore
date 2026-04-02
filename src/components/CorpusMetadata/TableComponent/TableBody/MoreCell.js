import { useContext } from "react";
import { Checkbox, TableCell, Tooltip } from "@mui/material";
import { Context } from "../../../../App";


const MoreCell = ({ classes, row }) => {
  const { checkedBooks, setCheckedBooks } = useContext(Context);

  // mark metadata row
  const handleChecked = (value) => {
    const filter = checkedBooks.filter((item) => {
      return (
        item?.release_version?.release_code ===
          value?.release_version?.release_code && item?.id === value?.id
      );
    });
    if (filter.length === 1) {
      const filter = checkedBooks.filter((item) => {
        return item?.id !== value?.id;
      });
      setCheckedBooks(filter);
    } else {
      setCheckedBooks([...checkedBooks, row]);
    }
  };

  const isChecked = (value) => {
    const filter = checkedBooks.filter((item) => {
      return item?.id === value?.id;
    });
    if (filter.length === 1) {
      return true;
    } else {
      return false;
    }
  };

  return (
    <TableCell
      className={classes.tableCell}
      sx={{
        width: {
          xs: "100%",
          md: "4%",
        },
        border: "none",
        display: "flex",
        justifyContent: {
          xs: "space-between !important",
          md: "center !important",
        },
        alignItems: "center",
        boxSizing: "border-box",
      }}
    >
      <Tooltip title="Select rows to view text reuse data / download metadata">
        <Checkbox
          size="small"
          checked={isChecked(row)}
          onChange={() => handleChecked(row)}
          sx={{ p: 0 }}
        />
      </Tooltip>
    </TableCell>
  );
};

export default MoreCell;
