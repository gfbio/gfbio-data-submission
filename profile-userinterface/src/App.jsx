import { Divider, MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import PropTypes from "prop-types";
import { Link, Outlet } from "react-router-dom";
import "./App.css";

function App(props) {
  const base = props.baseUrl;

  return (
    <MantineProvider>
      <nav className="nav">
        <Link to={base} className="nav-link">
          My Submissions
        </Link>
        <Link to={base + "form/"} className="nav-link">
          Create Submission
        </Link>
      </nav>
      <Divider my="xs" />
      <Outlet />
    </MantineProvider>
  );
}

App.propTypes = {
  baseUrl: PropTypes.string,
};

export default App;
