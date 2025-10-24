import { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Container from "@material-ui/core/Container";
import React from "react";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import {
  Paper,
  Grid,
  TableContainer,
  Table,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  CircularProgress,
  Snackbar,
  Button,
  // Pagination,
} from "@material-ui/core";
import { common } from "@material-ui/core/colors";

const axios = require("axios").default;

const useStyles = makeStyles((theme) => ({
  grow: {
    flexGrow: 1,
  },
  root: {
    maxWidth: "100%",
    flexGrow: 1,
  },
  paper: {
    padding: theme.spacing(2),
    margin: "auto",
    maxWidth: "100%",
  },
  gridContainer: {
    justifyContent: "center",
    padding: "2em 1em 0 1em",
  },
  mainContainer: {
    height: "93vh",
    marginTop: "8px",
  },
  predictionsCard: {
    margin: "auto",
    maxWidth: "100%",
    backgroundColor: "transparent",
    boxShadow: "0px 9px 70px 0px rgb(0 0 0 / 30%) !important",
    borderRadius: "15px",
  },
  tableContainer: {
    backgroundColor: "transparent !important",
    boxShadow: "none !important",
    maxHeight: 600,
    overflowY: "auto",
  },
  table: {
    backgroundColor: "transparent !important",
    minWidth: 650,
  },
  tableHead: {
    backgroundColor: "#be6a77 !important",
  },
  tableRow: {
    backgroundColor: "transparent !important",
  },
  tableCell: {
    fontSize: "16px",
    backgroundColor: "transparent !important",
    borderColor: "transparent !important",
    color: "#000000a6 !important",
    fontWeight: "bolder",
    padding: "12px 16px",
  },
  tableCellHeader: {
    fontSize: "18px",
    backgroundColor: "#be6a77 !important",
    borderColor: "transparent !important",
    color: "white !important",
    fontWeight: "bolder",
    padding: "12px 16px",
  },
  appbar: {
    background: "#be6a77",
    boxShadow: "none",
    color: "white",
  },
  loader: {
    color: "#be6a77 !important",
    margin: "20px auto",
    display: "block",
  },
  errorText: {
    color: "red",
    marginTop: "10px",
    textAlign: "center",
  },
  paginationContainer: {
    display: "flex",
    justifyContent: "center",
    padding: "20px 0",
  },
  confidence: {
    color: (props) =>
      props.confidence >= 70
        ? "green"
        : props.confidence >= 40
        ? "orange"
        : "red",
    fontWeight: "bold",
  },
  snackbar: {
    backgroundColor: (props) =>
      props.snackbarType === "error"
        ? "#f44336"
        : props.snackbarType === "warning"
        ? "#ff9800"
        : "#4caf50",
    color: "white",
  },
}));

export const PredictionsDashboard = () => {
  const [predictions, setPredictions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    type: "success",
  });
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    total: 0,
    pages: 0,
  });

  const classes = useStyles({ snackbarType: snackbar.type });

  const showSnackbar = (message, type = "success") => {
    setSnackbar({ open: true, message, type });
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const fetchPredictions = async (page = 1, pageSize = 20) => {
    try {
      setError(null);
      setIsLoading(true);

      const response = await axios({
        method: "get",
        url: `${process.env.REACT_APP_API_URL}/predictions`,
        params: {
          page: page,
          page_size: pageSize,
        },
        validateStatus: function (status) {
          return status < 500;
        },
      });

      if (response.status === 200) {
        setPredictions(response.data.data);
        setPagination({
          page: response.data.pagination.page,
          pageSize: response.data.pagination.page_size,
          total: response.data.pagination.total,
          pages: response.data.pagination.pages,
        });
      } else {
        throw new Error(response.data.detail || "Failed to fetch predictions");
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.detail ||
        err.message ||
        "An error occurred while fetching predictions";
      setError(errorMessage);
      showSnackbar(errorMessage, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (event, value) => {
    fetchPredictions(value, pagination.pageSize);
  };

  useEffect(() => {
    fetchPredictions();
  }, []);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <React.Fragment>
      <AppBar position="static" className={classes.appbar}>
        <Toolbar>
          <Typography className={classes.title} variant="h6" noWrap>
            Prediction History
          </Typography>
          <div className={classes.grow} />
        </Toolbar>
      </AppBar>
      <Container
        maxWidth={false}
        className={classes.mainContainer}
        disableGutters={true}
      >
        <Grid
          className={classes.gridContainer}
          container
          direction="row"
          justifyContent="center"
          alignItems="center"
          spacing={2}
        >
          <Grid item xs={12}>
            <Card className={classes.predictionsCard}>
              {isLoading && (
                <CardContent>
                  <CircularProgress className={classes.loader} />
                  <Typography
                    variant="body1"
                    style={{ marginTop: "10px", textAlign: "center" }}
                  >
                    Loading predictions...
                  </Typography>
                </CardContent>
              )}

              {error && (
                <CardContent>
                  <Typography variant="body1" className={classes.errorText}>
                    {error}
                  </Typography>
                </CardContent>
              )}

              {!isLoading && !error && (
                <CardContent>
                  <TableContainer
                    component={Paper}
                    className={classes.tableContainer}
                  >
                    <Table
                      className={classes.table}
                      aria-label="predictions table"
                    >
                      <TableHead className={classes.tableHead}>
                        <TableRow className={classes.tableRow}>
                          <TableCell className={classes.tableCellHeader}>
                            Timestamp
                          </TableCell>
                          <TableCell className={classes.tableCellHeader}>
                            Predicted Class
                          </TableCell>
                          <TableCell className={classes.tableCellHeader}>
                            Confidence
                          </TableCell>
                          <TableCell className={classes.tableCellHeader}>
                            Filename
                          </TableCell>
                          <TableCell className={classes.tableCellHeader}>
                            File Size
                          </TableCell>
                          <TableCell className={classes.tableCellHeader}>
                            Input Shape
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody className={classes.tableBody}>
                        {predictions.length === 0 ? (
                          <TableRow className={classes.tableRow}>
                            <TableCell
                              colSpan={6}
                              align="center"
                              className={classes.tableCell}
                            >
                              No predictions found
                            </TableCell>
                          </TableRow>
                        ) : (
                          predictions.map((prediction, index) => (
                            <TableRow className={classes.tableRow} key={index}>
                              <TableCell className={classes.tableCell}>
                                {formatDate(prediction.timestamp)}
                              </TableCell>
                              <TableCell className={classes.tableCell}>
                                {prediction.predicted_class}
                              </TableCell>
                              <TableCell
                                className={`${classes.tableCell} ${classes.confidence}`}
                              >
                                {(prediction.confidence * 100).toFixed(2)}%
                              </TableCell>
                              <TableCell className={classes.tableCell}>
                                {prediction.file_metadata.filename}
                              </TableCell>
                              <TableCell className={classes.tableCell}>
                                {formatFileSize(prediction.file_metadata.size)}
                              </TableCell>
                              <TableCell className={classes.tableCell}>
                                {prediction.processing_details.input_shape.join(
                                  "x"
                                )}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  {pagination.pages > 1 && (
                    <div className={classes.paginationContainer}></div>
                  )}
                </CardContent>
              )}
            </Card>
          </Grid>
        </Grid>
      </Container>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        ContentProps={{
          className: classes.snackbar,
        }}
        message={snackbar.message}
      />
    </React.Fragment>
  );
};
