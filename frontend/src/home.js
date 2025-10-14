import { useState, useEffect } from "react";
import { makeStyles, withStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Avatar from "@material-ui/core/Avatar";
import Container from "@material-ui/core/Container";
import React from "react";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import {
  Paper,
  CardActionArea,
  CardMedia,
  Grid,
  TableContainer,
  Table,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  Button,
  CircularProgress,
  Snackbar,
} from "@material-ui/core";
// import image from "./bg.png";
import { DropzoneArea } from "material-ui-dropzone";
import { common } from "@material-ui/core/colors";
import Clear from "@material-ui/icons/Clear";
import RefreshIcon from "@material-ui/icons/Refresh";

const ColorButton = withStyles((theme) => ({
  root: {
    color: theme.palette.getContrastText(common.white),
    backgroundColor: common.white,
    "&:hover": {
      backgroundColor: "#ffffff7a",
    },
  },
}))(Button);

const axios = require("axios").default;

const useStyles = makeStyles((theme) => ({
  grow: {
    flexGrow: 1,
  },
  clearButton: {
    width: "-webkit-fill-available",
    borderRadius: "15px",
    padding: "15px 22px",
    color: "#000000a6",
    fontSize: "20px",
    fontWeight: 900,
  },
  root: {
    maxWidth: 345,
    flexGrow: 1,
  },
  media: {
    height: 400,
  },
  paper: {
    padding: theme.spacing(2),
    margin: "auto",
    maxWidth: 500,
  },
  gridContainer: {
    justifyContent: "center",
    padding: "4em 1em 0 1em",
  },
  mainContainer: {
    height: "93vh",
    marginTop: "8px",
  },
  imageCard: {
    margin: "auto",
    maxWidth: 400,
    height: 500,
    backgroundColor: "transparent",
    boxShadow: "0px 9px 70px 0px rgb(0 0 0 / 30%) !important",
    borderRadius: "15px",
  },
  imageCardEmpty: {
    height: "auto",
  },
  noImage: {
    margin: "auto",
    width: 400,
    height: "400 !important",
  },
  input: {
    display: "none",
  },
  uploadIcon: {
    background: "white",
  },
  tableContainer: {
    backgroundColor: "transparent !important",
    boxShadow: "none !important",
  },
  table: {
    backgroundColor: "transparent !important",
  },
  tableHead: {
    backgroundColor: "transparent !important",
  },
  tableRow: {
    backgroundColor: "transparent !important",
  },
  tableCell: {
    fontSize: "22px",
    backgroundColor: "transparent !important",
    borderColor: "transparent !important",
    color: "#000000a6 !important",
    fontWeight: "bolder",
    padding: "1px 24px 1px 16px",
  },
  tableCell1: {
    fontSize: "14px",
    backgroundColor: "transparent !important",
    borderColor: "transparent !important",
    color: "#000000a6 !important",
    fontWeight: "bolder",
    padding: "1px 24px 1px 16px",
  },
  tableBody: {
    backgroundColor: "transparent !important",
  },
  text: {
    color: "white !important",
    textAlign: "center",
  },
  buttonGrid: {
    maxWidth: "416px",
    width: "100%",
    marginTop: "10px",
  },
  detail: {
    backgroundColor: "white",
    display: "flex",
    justifyContent: "center",
    flexDirection: "column",
    alignItems: "center",
    padding: "15px",
  },
  appbar: {
    background: "#be6a77",
    boxShadow: "none",
    color: "white",
  },
  loader: {
    color: "#be6a77 !important",
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
  errorText: {
    color: "red",
    marginTop: "10px",
    textAlign: "center",
  },
  retryButton: {
    marginTop: "10px",
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

export const ImageUpload = () => {
  const [selectedFile, setSelectedFile] = useState();
  const [preview, setPreview] = useState();
  const [data, setData] = useState();
  const [image, setImage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    type: "success",
  });
  const confidence = data ? parseFloat(data.confidence) * 100 : 0;
  const classes = useStyles({ confidence, snackbarType: snackbar.type });

  const showSnackbar = (message, type = "success") => {
    setSnackbar({ open: true, message, type });
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const validateFile = (file) => {
    const validTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      throw new Error("Please upload a valid image file (JPG, JPEG, or PNG)");
    }
    if (file.size > 5 * 1024 * 1024) {
      throw new Error("File size should not exceed 5MB");
    }
  };

  const sendFile = async () => {
    if (!image || !selectedFile) return;

    try {
      setError(null);
      setIsLoading(true);

      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await axios({
        method: "post",
        url: process.env.REACT_APP_API_URL,
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
        validateStatus: function (status) {
          return status < 500;
        },
      });

      if (response.status === 200) {
        setData(response.data);
        if (response.data.confidence < 0.4) {
          showSnackbar(
            "Low confidence prediction. Please try with a clearer image.",
            "warning"
          );
        }
      } else {
        throw new Error(response.data.detail || "Failed to process image");
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.detail ||
        err.message ||
        "An error occurred while processing the image";
      setError(errorMessage);
      showSnackbar(errorMessage, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const clearData = () => {
    setData(null);
    setImage(false);
    setSelectedFile(null);
    setPreview(null);
    setError(null);
  };

  const retryRequest = () => {
    setError(null);
    sendFile();
  };

  useEffect(() => {
    if (!selectedFile) {
      setPreview(undefined);
      return;
    }
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  useEffect(() => {
    if (!preview) return;
    sendFile();
  }, [preview]);

  const onSelectFile = (files) => {
    if (!files || files.length === 0) {
      setSelectedFile(undefined);
      setImage(false);
      setData(undefined);
      setError(null);
      return;
    }

    try {
      validateFile(files[0]);
      setSelectedFile(files[0]);
      setData(undefined);
      setImage(true);
      setError(null);
    } catch (err) {
      showSnackbar(err.message, "error");
    }
  };

  return (
    <React.Fragment>
      <AppBar position="static" className={classes.appbar}>
        <Toolbar>
          <Typography className={classes.title} variant="h6" noWrap>
            Potato Disease Classification
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
            <Card
              className={`${classes.imageCard} ${
                !image ? classes.imageCardEmpty : ""
              }`}
            >
              {image && (
                <CardActionArea>
                  <CardMedia
                    className={classes.media}
                    image={preview}
                    component="image"
                    title="Potato Plant Leaf"
                  />
                </CardActionArea>
              )}

              {!image && (
                <CardContent className={classes.content}>
                  <DropzoneArea
                    acceptedFiles={["image/jpeg", "image/png", "image/jpg"]}
                    dropzoneText={
                      "Drag and drop an image of a potato plant leaf to process"
                    }
                    onChange={onSelectFile}
                    maxFileSize={5000000}
                    showPreviewsInDropzone={false}
                    showFileNames
                    filesLimit={1}
                  />
                </CardContent>
              )}

              {error && (
                <CardContent className={classes.detail}>
                  <Typography variant="body1" className={classes.errorText}>
                    {error}
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    className={classes.retryButton}
                    onClick={retryRequest}
                    startIcon={<RefreshIcon />}
                  >
                    Retry
                  </Button>
                </CardContent>
              )}

              {isLoading && (
                <CardContent className={classes.detail}>
                  <CircularProgress className={classes.loader} />
                  <Typography variant="body1" style={{ marginTop: "10px" }}>
                    Processing image...
                  </Typography>
                </CardContent>
              )}

              {data && !error && (
                <CardContent className={classes.detail}>
                  <TableContainer
                    component={Paper}
                    className={classes.tableContainer}
                  >
                    <Table
                      className={classes.table}
                      size="small"
                      aria-label="prediction results"
                    >
                      <TableHead className={classes.tableHead}>
                        <TableRow className={classes.tableRow}>
                          <TableCell className={classes.tableCell1}>
                            Disease:
                          </TableCell>
                          <TableCell
                            align="right"
                            className={classes.tableCell1}
                          >
                            Confidence:
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody className={classes.tableBody}>
                        <TableRow className={classes.tableRow}>
                          <TableCell
                            component="th"
                            scope="row"
                            className={classes.tableCell}
                          >
                            {data.class}
                          </TableCell>
                          <TableCell
                            align="right"
                            className={`${classes.tableCell} ${classes.confidence}`}
                          >
                            {confidence.toFixed(2)}%
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              )}
            </Card>
          </Grid>

          {(data || error) && (
            <Grid item className={classes.buttonGrid}>
              <ColorButton
                variant="contained"
                className={classes.clearButton}
                color="primary"
                component="span"
                size="large"
                onClick={clearData}
                startIcon={<Clear fontSize="large" />}
              >
                Clear
              </ColorButton>
            </Grid>
          )}
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
