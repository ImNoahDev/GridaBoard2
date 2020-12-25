export function get(api_uri2, request2) {
  fetch(api_uri2, request2)
    .then(res => res.json())
    .then(res => {
      this.setState({
        rightColumneData: [...res.results],
        rightNextKey: res.next,
      })
    })
    .catch((error) => {
      console.error(error);
    })
}