import {Divider, MantineProvider} from "@mantine/core";
import {ModalsProvider} from '@mantine/modals';
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import PropTypes from "prop-types";
import {Link, Outlet} from "react-router-dom";
import "./App.css";
import ScrollToTop from "./components/ScrollToTop.jsx";

import {Modal, Button} from '@mantine/core';
import {useDisclosure} from '@mantine/hooks';

function App(props) {
    const base = props.baseUrl;

    return (
        <MantineProvider>
            <ModalsProvider>
                <section className="sub-navi">
                    <div className="container">
                        <div className="row">
                            <div className="col-sm-12">
                                <nav className="nav">
                                    <Link to={base} className="nav-link">
                                        <i className="icon ion-ios-list"/>
                                        My Submissions
                                    </Link>
                                    <Link to={base + "form/"} className="nav-link">
                                        <i className="icon ion-ios-add-circle-outline"/>
                                        Create Submission
                                    </Link>
                                </nav>
                            </div>
                        </div>
                    </div>
                </section>
                <Outlet/>
                <ScrollToTop/>
            </ModalsProvider>
        </MantineProvider>
    );
}

App.propTypes = {
    baseUrl: PropTypes.string,
};

export default App;
