import React, { useState } from "react";

// import { makeStyles } from '@material-ui/core/styles';


import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import { Button, makeStyles, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@material-ui/core";
import { t } from "../../Locales/i18n";


// const useStyles = makeStyles((theme) => ({
//   form: {
//     display: 'flex',
//     flexDirection: 'column',
//     margin: 'auto',
//     width: 'fit-content',
//   },
//   formControl: {
//     marginTop: theme.spacing(2),
//     minWidth: 120,
//   },
//   formControlLabel: {
//     marginTop: theme.spacing(1),
//   },
// }));
const useStyles = makeStyles({
  table: {
    minWidth: 400,
  },
});


const useStyles2 = makeStyles({
  table: {
    minWidth: 2000,
  },
});


type Props = {
  open: boolean,
  handleClose: any,
  pageNo: number,
}




const TAX_RATE = 0.07;


function ccyFormat(num: number) {
  return `${num.toFixed(2)}`;
}

function priceRow(qty: number, unit: number) {
  return qty * unit;
}

function createRow(desc: string, qty: number, unit: number) {
  const price = priceRow(qty, unit);
  return { desc, qty, unit, price };
}

interface Row {
  desc: string;
  qty: number;
  unit: number;
  price: number;
}

function subtotal(items: Row[]) {
  return items.map(({ price }) => price).reduce((sum, i) => sum + i, 0);
}

const rows = [
  createRow('Paperclips (Box)', 100, 1.15),
  createRow('Paper (Case)', 10, 45.99),
  createRow('Waste Basket', 2, 17.99),
];

const invoiceSubtotal = subtotal(rows);
const invoiceTaxes = TAX_RATE * invoiceSubtotal;
const invoiceTotal = invoiceTaxes + invoiceSubtotal;

type maxWidthType = "xs" | "sm" | "md" | "lg" | "xl";

export default function CalibrationDialog(props: Props) {
  const { open, handleClose, pageNo } = props;
  const classes = useStyles();
  const classes2 = useStyles2();

  const handleSave = (e) => {
    console.log("Save");
  }

  const onChange = (e) => {
    console.log(e.target.value);
  }


  const maxWidth = "md";

  const img_src = "https://www.k-voucher.kr/bbs/service/2020-09/16010263390201_1_1601026339.PNG";

  return (
    <div>
      <Dialog open={open} onClose={handleClose}
        fullWidth={true}
        maxWidth={maxWidth}
        aria-labelledby="form-dialog-title">

        <DialogTitle id="form-dialog-title">{t('calibration_dlg_title')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Dialog의 Body
          </DialogContentText>
        </DialogContent>





        <TableContainer component={Paper}>
          <Table className={classes.table} aria-label="spanning table">
            <TableHead>
              <TableRow>
                <TableCell align="center" colSpan={3}>
                  Details
            </TableCell>
                <TableCell align="right">Price</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Desc</TableCell>
                <TableCell align="right">Qty.</TableCell>
                <TableCell align="right">Unit</TableCell>
                <TableCell align="right">Sum</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.desc}>
                  <TableCell>{row.desc}</TableCell>
                  <TableCell align="right">{row.qty}</TableCell>
                  <TableCell align="right">{row.unit}</TableCell>
                  <TableCell align="right">{ccyFormat(row.price)}</TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell rowSpan={3} />
                <TableCell colSpan={2}>Subtotal</TableCell>
                <TableCell align="right">{ccyFormat(invoiceSubtotal)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Tax</TableCell>
                <TableCell align="right">{`${(TAX_RATE * 100).toFixed(0)} %`}</TableCell>
                <TableCell align="right">{ccyFormat(invoiceTaxes)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={2}>Total</TableCell>
                <TableCell align="right">{ccyFormat(invoiceTotal)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>






        <TableContainer component={Paper}>
          <Table className={classes2.table} aria-label="spanning table">


            <TableBody>
              <TableRow>
                <TableCell>
                  <img src={img_src} style={{ width: "400px", height: "400px" }} />
                </TableCell>
                <TableCell>
                  <img src={img_src} style={{ width: "400px", height: "400px" }} />
                </TableCell>
                <TableCell>
                  <img src={img_src} style={{ width: "400px", height: "400px" }} />
                </TableCell>
                <TableCell>
                  <img src={img_src} style={{ width: "400px", height: "400px" }} />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>


        <DialogActions>
          <Button autoFocus onClick={handleClose} color="primary">
            취소
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}