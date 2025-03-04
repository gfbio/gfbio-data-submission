import PropTypes from "prop-types";
import {
    List,
    Card
} from "@mantine/core";

const ErrorBox = ({ errorList }) => {
    return (
        <div className="error-box w-100">
            {
                (errorList.length > 0) && (
                    <Card padding="md" className="w-100">
                        <div className="text-danger fs-5 pb-2">
                            <i className="fa fa-flash ps-2 pe-2"></i>
                            There are some validation errors
                        </div>
                        <List spacing="0" icon={<i className="fa fa-minus"></i>}>
                            {
                                errorList.map(
                                    (error) => (
                                        <List.Item className="error-item">
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
                                Once all errors are resolved, try to submit again.
                            </List.Item>
                        </List>
                    </Card>
                )
            }
        </div>
    );
};

ErrorBox.defaultProps = {
    errorList: []
};

ErrorBox.propTypes = {
    errorList: PropTypes.arrayOf(PropTypes.shape({
        field: PropTypes.string.isRequired,
        message: PropTypes.string.isRequired,
    })).isRequired,
};

export default ErrorBox;
