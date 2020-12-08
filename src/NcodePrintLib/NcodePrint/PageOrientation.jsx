import React from "react";

const mediaString = (direction) => {
  const str =
    `@media print{` +
    `html, body { background-color: #fff; }` +
    `-webkit-print-color-adjust: exact; ` +
    `@page {` +
    `size: ${direction};` +
    `margin: 0;` +
    `}` +
    `}`;

  return str;
}

const mediaSizeDirectionString = (sizeName, direction) => {
  const str =
    `@media print{` +
    `html, body { background-color: #fff; }` +
    `-webkit-print-color-adjust: exact; ` +
    `@page {` +
    `size: ${sizeName} ${direction};` +
    `margin: 0;` +
    `}` +
    `}`;

  return str;
}


export const MediaSizeAndDirection = (props) => {
  const { direction, size } = props;
  const str = mediaSizeDirectionString(size, direction);
}

export const PortraitOrientation = () => {
  const str = mediaString("portrait");
  return (<> {str} </> );

  // return (
  //   <style type="text/css">
  //     {"@media print{" + 
  //       "html, body { background-color: #fff; }" +
  //       "-webkit-print-color-adjust: exact; " +
  //       "@page {" +
  //       "size: portrait;" +
  //       "margin: 0;" +
  //       "}" +
  //       "}"
  //     }
  //   </style>
  // )
}

export const LandscapeOrientation = () => {
  const str = mediaString("landscape");
  return (<> {str} </> );

  // return (
  //   <style type="text/css">
  //     {"@media print{" +
  //       "html, body { background-color: #fff; }" +
  //       "-webkit-print-color-adjust: exact; " +
  //       "@page {" +
  //       "size: landscape;" +
  //       "margin: 0;" +
  //       "}" +
  //       "}"
  //     }
  //   </style>
  // );
}

