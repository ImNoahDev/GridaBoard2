import React from "react";
import { makeStyles } from '@material-ui/core/styles';
import { StorageRenderer, InkStorage } from "../neosmartpen";
import { PLAYSTATE } from "../neosmartpen/renderer/pageviewer/StorageRenderer";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@material-ui/core";

const useStyles = makeStyles({
  table: {
    minWidth: 480,
  },
});


const Home = () => {
  const classes = useStyles();

  return (
    <div>
      <hr />
      <TableContainer component={Paper}>
        <Table className={classes.table} size="small" aria-label="a dense table">
          {/* <TableHead>
            <TableRow>
              <TableCell>Dessert (100g serving)</TableCell>
              <TableCell align="right">Calories</TableCell>
              <TableCell align="right">Fat&nbsp;(g)</TableCell>
              <TableCell align="right">Carbs&nbsp;(g)</TableCell>
              <TableCell align="right">Protein&nbsp;(g)</TableCell>
            </TableRow>
          </TableHead> */}
          <TableBody>
            <TableRow key={1}>
              <TableCell rowSpan={2} colspan={2} component="th" scope="row">
                <StorageRenderer scale={1} pageId={"0.0.0.0"} playState={PLAYSTATE.live} width={1024} height={640} />
              </TableCell>

              <TableCell rowSpan={2} colspan={2} component="th" scope="row">
                <StorageRenderer scale={1} pageId={"0.0.0.0"} playState={PLAYSTATE.live} width={512} height={320} />
              </TableCell>
            </TableRow>

              {/* <TableCell component="th" scope="row">
                <StorageRenderer scale={1} inkStorage={null} pageId={"0.0.0.0"} playState={PLAYSTATE.live} width={240} height={320} />
              </TableCell>

              <TableCell component="th" scope="row">
                <StorageRenderer scale={1} inkStorage={ps} pageId={"0.0.0.0"} playState={PLAYSTATE.live} width={240} height={320} />
              </TableCell>
            </TableRow>
            <TableRow key={2}>
              <TableCell component="th" scope="row">
                <StorageRenderer scale={1} inkStorage={ps} pageId={"0.0.0.0"} playState={PLAYSTATE.live} width={240} height={320} />
              </TableCell>
              <TableCell component="th" scope="row">
                <StorageRenderer scale={1} inkStorage={ps} pageId={"0.0.0.0"} playState={PLAYSTATE.live} width={240} height={320} />
              </TableCell> */}

          </TableBody>
        </Table>
      </TableContainer>


    </div>
  );
};

export default Home;
