import { Link } from "react-router-dom";
import { ROUTER_URL_CREATE, ROUTER_URL_LIST } from "../settings.jsx";

const NavigationMenu = (props) => {

    return <section className="sub-navi">
        <div className="container">
            <div className="row">
                <div className="col-sm-12 px-0">
                    <nav className="nav">
                        <Link to={ROUTER_URL_LIST} className="nav-link">
                            <i className="icon ion-ios-list"/>
                            My Submissions
                        </Link>
                        <Link to={ROUTER_URL_CREATE} className="nav-link">
                            <i className="icon ion-ios-add-circle-outline"/>
                            Create Submission
                        </Link>
                        {props.children}
                    </nav>
                </div>
            </div>
        </div>
    </section>
}

export default NavigationMenu;