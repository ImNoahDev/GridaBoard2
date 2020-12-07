import React from "react";

type Props = {
  match
}
const Post = (props: Props) => {
  const { match } = props;
  return <div>포스트 {match.params.id}</div>;
};

export default Post;
