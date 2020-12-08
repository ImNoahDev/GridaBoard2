import React from "react";

export const PortraitOrientation = () => (
  <style type="text/css">
    {"@media print{" +
        "html, body { background-color: #fff; }" +
        "-webkit-print-color-adjust: exact; "+
        "@page {" +
          "size: portrait;" +
          "margin: 0;" +
        "}" +
      "}"
    }
  </style>
);

export const LandscapeOrientation = () => (
  <style type="text/css">
    {"@media print{" +
        "html, body { background-color: #fff; }" +
        "-webkit-print-color-adjust: exact; "+
        "@page {" +
          "size: landscape;" +
          "margin: 0;" +
        "}" +
      "}"
    }
  </style>
);

