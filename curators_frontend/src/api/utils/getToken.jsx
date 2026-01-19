const getToken = () => {
  let token = "";
  if (window.props !== undefined) {
    token = window.props.token || "no-token-found";
  }
  return token;
};

export default getToken;
