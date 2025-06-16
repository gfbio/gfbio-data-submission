import { Link } from "react-router-dom";
import { ROUTER_BASE_URL as base } from "../settings.jsx";

const NavigationMenu = (props) => {

    return <section className="sub-navi">
        <div className="container">
            <div className="row">
                <div className="col-sm-12 px-0">
                    <nav className="nav">
                        <Link to={base} className="nav-link">
                            <i className="icon ion-ios-list"/>
                            My Submissions
                        </Link>
                        <Link to={base + "form/"} className="nav-link">
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