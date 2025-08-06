import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableRow, 
  Paper 
} from "@mui/material";

export default function NameElementsTable({ data }) {
  return (
    <TableContainer component={Paper} sx={{ mt: "3px" }}>
      <Table size="small">
        <TableBody>
          <TableRow>
            <TableCell
              align="left"
              sx={{ border: "1px solid rgba(224, 224, 224, 1)" }}
            >
              Language
            </TableCell>
            <TableCell
              align="right"
              sx={{ border: "1px solid rgba(224, 224, 224, 1)" }}
            >
              Shuhra
            </TableCell>
            <TableCell
              align="right"
              sx={{ border: "1px solid rgba(224, 224, 224, 1)" }}
            >
              Ism
            </TableCell>
            <TableCell
              align="right"
              sx={{ border: "1px solid rgba(224, 224, 224, 1)" }}
            >
              Nasab
            </TableCell>
            <TableCell
              align="right"
              sx={{ border: "1px solid rgba(224, 224, 224, 1)" }}
            >
              Kunya
            </TableCell>
            <TableCell
              align="right"
              sx={{ border: "1px solid rgba(224, 224, 224, 1)" }}
            >
              Laqab
            </TableCell>
            <TableCell
              align="right"
              sx={{ border: "1px solid rgba(224, 224, 224, 1)" }}
            >
              Nisba
            </TableCell>
          </TableRow>
          {data.map((item, i) =>
            item.language === "AR" ? (
              <TableRow key={i}>
                <TableCell
                  scope="row"
                  align="left"
                  sx={{ border: "1px solid rgba(224, 224, 224, 1)" }}
                >
                  Arabic
                </TableCell>
                <TableCell
                  scope="row"
                  align="right"
                  sx={{ border: "1px solid rgba(224, 224, 224, 1)" }}
                >
                  {item.shuhra}
                </TableCell>
                <TableCell
                  scope="row"
                  align="right"
                  sx={{ border: "1px solid rgba(224, 224, 224, 1)" }}
                >
                  {item.ism}
                </TableCell>
                <TableCell
                  scope="row"
                  align="right"
                  sx={{ border: "1px solid rgba(224, 224, 224, 1)" }}
                >
                  {item.nasab}
                </TableCell>
                <TableCell
                  scope="row"
                  align="right"
                  sx={{ border: "1px solid rgba(224, 224, 224, 1)" }}
                >
                  {item.kunya}
                </TableCell>
                <TableCell
                  scope="row"
                  align="right"
                  sx={{ border: "1px solid rgba(224, 224, 224, 1)" }}
                >
                  {item.laqab}
                </TableCell>
                <TableCell
                  scope="row"
                  align="right"
                  sx={{ border: "1px solid rgba(224, 224, 224, 1)" }}
                >
                  {item.nisba}
                </TableCell>
              </TableRow>
            ) : (
              <TableRow key={i}>
                <TableCell
                  scope="row"
                  align="left"
                  sx={{ border: "1px solid rgba(224, 224, 224, 1)" }}
                >
                  Transcription
                </TableCell>
                <TableCell
                  scope="row"
                  align="right"
                  sx={{ border: "1px solid rgba(224, 224, 224, 1)" }}
                >
                  {item.shuhra}
                </TableCell>
                <TableCell
                  scope="row"
                  align="right"
                  sx={{ border: "1px solid rgba(224, 224, 224, 1)" }}
                >
                  {item.ism}
                </TableCell>
                <TableCell
                  scope="row"
                  align="right"
                  sx={{ border: "1px solid rgba(224, 224, 224, 1)" }}
                >
                  {item.nasab}
                </TableCell>
                <TableCell
                  scope="row"
                  align="right"
                  sx={{ border: "1px solid rgba(224, 224, 224, 1)" }}
                >
                  {item.kunya}
                </TableCell>
                <TableCell
                  scope="row"
                  align="right"
                  sx={{ border: "1px solid rgba(224, 224, 224, 1)" }}
                >
                  {item.laqab}
                </TableCell>
                <TableCell
                  scope="row"
                  align="right"
                  sx={{ border: "1px solid rgba(224, 224, 224, 1)" }}
                >
                  {item.nisba}
                </TableCell>
              </TableRow>
            )
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
