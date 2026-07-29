import PropTypes from "prop-types";
import {
    List,
    Card
} from "@mantine/core";

const ErrorBox = ({ errorList, title, helpText }) => {
    return (
        <div className="error-box w-100">
            {
                (errorList.length > 0) && (
                    <Card padding="md" className="w-100">
                        <div className="text-danger fs-5 pb-2">
                            <i className="fa fa-flash ps-2 pe-2"></i>
                            {title || "We could not submit your form"}
                        </div>
                        <List spacing="0" icon={<i className="fa fa-minus"></i>}>
                            {
                                errorList.map(
                                    (error, index) => (
                                        <List.Item className="error-item" key={`${error.field}-${index}`}>
                                            <span className="field">
                                                {error.field}
                                            </span>
                                            <i className="fa fa-arrow-right px-1"></i>
                                            <span className="error-message">
                                                {error.message}
                                            </span>
                                        </List.Item>
                                    )
                                )
                            }
                            <List.Item className="error-helptext">
                                {helpText || "Fix the issues above, then click Submit again."}
                            </List.Item>
                        </List>
                    </Card>
                )
            }
        </div>
    );
};

ErrorBox.defaultProps = {
    errorList: [],
    title: null,
    helpText: null,
};

ErrorBox.propTypes = {
    errorList: PropTypes.arrayOf(PropTypes.shape({
        field: PropTypes.string.isRequired,
        message: PropTypes.string.isRequired,
    })).isRequired,
    title: PropTypes.string,
    helpText: PropTypes.string,
};

export default ErrorBox;
