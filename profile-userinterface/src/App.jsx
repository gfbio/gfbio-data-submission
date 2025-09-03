import {MantineProvider} from "@mantine/core";
import {ModalsProvider} from '@mantine/modals';
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import PropTypes from "prop-types";
import {Link, Outlet} from "react-router-dom";
import "./App.css";
import ScrollToTop from "./components/ScrollToTop.jsx";

function App(props) {
    const base = props.baseUrl;

    return (
        <MantineProvider>
            <ModalsProvider>
                <Outlet />
                <ScrollToTop/>
            </ModalsProvider>
        </MantineProvider>
    );
}

App.propTypes = {
    baseUrl: PropTypes.string,
};

export default App;
