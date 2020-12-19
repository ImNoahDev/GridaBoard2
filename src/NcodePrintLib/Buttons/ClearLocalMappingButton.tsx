import React from "react";
import { Button, ButtonProps, } from "@material-ui/core";
import { MappingStorage } from "../SurfaceMapper";


export default function ClearLocalMappingButton(props: ButtonProps) {
  const clear = () => {
    const instance = MappingStorage.getInstance();
    instance.clear();
  }

  return (
    <Button {...props} onClick={clear}>
      {props.children}
    </Button>
  );
}



