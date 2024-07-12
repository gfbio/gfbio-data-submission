import { MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import PropTypes from "prop-types";
import { Link, Outlet } from "react-router-dom";
import "./App.css";

function App(props) {
  const base = props.baseUrl;

  // Use props here

  return (
    <MantineProvider>
      <Link to={base}>My Submissions</Link>
      <Link to={base + "form/"}>Create Submission</Link>
      <Outlet />
    </MantineProvider>
  );
}

App.propTypes = {
  baseUrl: PropTypes.string,
};

export default App;
