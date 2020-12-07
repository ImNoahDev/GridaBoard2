import React from 'react';
import { Link, Route } from 'react-router-dom';
import { Post } from ".";


type Props = {
  location: any,
  match: any,
}
const Posts = (props: Props) => {
  const { location, match } = props;

  console.log(`location.pathname = ${location.pathname}`);
  console.log(`match.url = ${match.url}`);
  console.log(`match.path = ${match.path}`);
  return (
    <div>
      <h2>Post List</h2>
      <ul>
        <li><Link to={`${match.url}/1`}>Post #1</Link></li>
        <li><Link to={`${match.url}/2`}>Post #2</Link></li>
        <li><Link to={`${match.url}/3`}>Post #3</Link></li>
        <li><Link to={`${match.url}/4`}>Post #4</Link></li>
      </ul>
      <Route exact path={match.url} render={() => (<h3>Please select any post</h3>)} />
      <Route path={`${match.url}/:id`} component={Post} />
    </div>
  );
};

export default Posts;