import React, {useState} from "react";
import { IconButton, Button, SvgIcon, makeStyles, ClickAwayListener } from '@material-ui/core';
import getText from "../../language/language";
import { isWhiteSpace } from "../../../../public/pdf.worker.2.5.207";

const useStyle = makeStyles(theme => ({
  icon : {
    background: theme.custom.grey[0],
    width: "40px",
    height: "40px",
    padding: "0",
    "&:hover" : {
      background : theme.custom.grey[0],
    },
    "& > span" : {
      color: "white",
      fontFamily: "Roboto",
      fontStyle: "normal",
      fontWeight: "normal",
      fontSize: "24px",
      lineHeight: "28px",
      display: "flex",
      alignItems: "center",
      textAlign: "right",
      letterSpacing: "0.25px"
    }
  },
  dropDown : {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    width: "240px",
    marginLeft: "-220px",
    marginTop: "-90px",
    boxShadow: theme.custom.shadows[0],
    borderRadius: "12px",
    zIndex: 10000,
    color : theme.custom.icon.mono[0],
    background: theme.custom.white[0],
    padding: "8px",
    "& > a" : {
      width: "224px",
      height: "40px",
      padding: "4px 12px",
      justifyContent: "left",
      "&:hover" : {
        color : theme.palette.action.hover,
        background: theme.custom.icon.blue[3]
      },
      "&>span" : {
        height: "16px",
        "&:hover": {
          color : theme.palette.action.hover,
        }
      }
    }
  }
}));


const InformationButton = (props) => {
  const {className, ...rest} = props;
  const [isOpen, setIsOpen] = useState(false);
  const classes = useStyle();
  const selectArr = [
    {
      title : "go_to_neolab",
      link : "https://labs.neostudio.io/forum/15/"
    },
    {
      title : "go_to_guide",
      link : "https://neolabdev.gitbook.io/gridaboard/"
    }
  ]

  function handleClick() {
    setIsOpen((prev) => !prev);
  }
  function handleClickAway(){
    setIsOpen(false);
  }
  return (
    <ClickAwayListener onClickAway={handleClickAway}>
    <div className={className}>
      <IconButton className={classes.icon} onClick={handleClick} {...rest} >
        ?
      </IconButton>

      {isOpen ? (<div id="fitDrop" className={classes.dropDown}>
        {selectArr.map((el, idx)=>(
            <Button key={idx} target="_blank" href={el.link}>
                {getText(el.title)}
                {/* {el.title} */}
            </Button>
        ))}
        </div>) : null}
    </div>
    </ClickAwayListener>
  );
}

export default InformationButton