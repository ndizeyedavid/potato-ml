import React, { useState } from "react";
import { ImageUpload } from "./home";
import { PredictionsDashboard } from "./predictions";
import { makeStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";

const useStyles = makeStyles((theme) => ({
  appbar: {
    background: "#be6a77",
    boxShadow: "none",
    color: "white",
  },
  title: {
    flexGrow: 1,
  },
  navButton: {
    margin: theme.spacing(1),
    color: "white",
    borderColor: "white",
  },
}));

function App() {
  const [currentPage, setCurrentPage] = useState("upload"); // "upload" or "predictions"
  const classes = useStyles();

  return (
    <div>
      <AppBar position="static" className={classes.appbar}>
        <Toolbar>
          <Typography variant="h6" className={classes.title}>
            Potato Disease Classification
          </Typography>
          <Button
            variant={currentPage === "upload" ? "contained" : "outlined"}
            className={classes.navButton}
            onClick={() => setCurrentPage("upload")}
          >
            Upload Image
          </Button>
          <Button
            variant={currentPage === "predictions" ? "contained" : "outlined"}
            className={classes.navButton}
            onClick={() => setCurrentPage("predictions")}
          >
            Prediction History
          </Button>
        </Toolbar>
      </AppBar>
      {currentPage === "upload" ? <ImageUpload /> : <PredictionsDashboard />}
    </div>
  );
}

export default App;
