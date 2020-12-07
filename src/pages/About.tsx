import React from "react";
import queryString from "query-string";

type Props = {
  location,
  match,
}

const About = (props: Props) => {
  const { location, match } = props;
  const query = queryString.parse(location.search);
  console.log(query);

  return (
    <div>
      <h2>About {match.params.name}</h2>
    </div>
  );
};

export default About;
