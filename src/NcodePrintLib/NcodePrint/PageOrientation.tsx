import React from "react";

const mediaString = (direction) => {
  const str =
    `@media print{` +
    `@page {` +
    `size: ${direction} !important;` +
    `margin: 0 !important;` +
    `}` +
    `}`;

  return str;
}

const mediaSizeDirectionString = (sizeName, direction) => {
  const str =
    `@media print{` +
    `@page {` +
    `size: ${sizeName} ${direction} !important;` +
    `margin: 0 !important;` +
    `}` +
    `}`;

  return str;
}

type Props = {
  orientation: "landscape" | "portrait",
  size?: "a4" | "a3" | "a5" | "b4" | "b5" | "letter",
}

export const PageOrientation = (props: Props) => {
  let { size } = props;
  if (!size) size = "a4";

  return (
    <style type="text/css">
      {"@media print{" +
        "@page {" +
        "size: "} { size} { " "} {props.orientation}{" !important;" +
          "margin: 0 !important;" +
          "}" +
          "}"
      }
    </style>
  )
}


export const PortraitOrientation = (props: { size?: string }) => {
  // console.log("<PortraitOrientation />");
  // const str = mediaSizeDirectionString("a4", "portrait");
  // return (<> {str} </> );
  let { size } = props;
  if (!size) size = "a4";

  return (
    <style type="text/css">
      {"@media print{" +
        "@page {" +
        "size: "} { size} { " portrait !important;" +
          "margin: 0 !important;" +
          "}" +
          "}"
      }
    </style>
  )
}

export const LandscapeOrientation = (props: { size?: string }) => {
  // console.log("<LandscapeOrientation />");
  // const str = mediaSizeDirectionString("a4", "landscape");
  // return (<> {str} </>);

  let { size } = props;
  if (!size) size = "a4";

  return (
    <style type="text/css">
      {"@media print{" +
        "@page {" +
        "size: "} { size} { " landscape !important;" +
          "margin: 0 !important;" +
          "}" +
          "}"
      }
    </style>
  );
}


export const ForceOverflow = (props: { overflow: "visible" | "hidden" }) => {
  return (
    <style type="text/css">
      { " html, body" +
        "{" +
            "overflow: "} {props.overflow} {";" +
        "}"};
    </style>
  );
}

export default PageOrientation;
