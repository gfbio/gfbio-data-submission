import React from "react";
import PropTypes from "prop-types";
import { Collapse, Text, Container } from "@mantine/core";

const InvalidFilenameMessage = ({ showInvalidFilenameMessage, allowedCharacters }) => (
    <Collapse in={showInvalidFilenameMessage}>
        <Container className="form-group col-md-12">
            <Container role="alert" className="fade alert alert-light show">
                <Container className="alert-heading text-danger h4">
                    <i className="fa fa-exclamation-triangle"></i> Invalid Filename
                </Container>
                <Text>
                    One or more files have invalid names. Please remove or rename these files.
                    Allowed characters: {allowedCharacters}.
                </Text>
            </Container>
        </Container>
    </Collapse>
);

InvalidFilenameMessage.propTypes = {
    showInvalidFilenameMessage: PropTypes.bool.isRequired,
    allowedCharacters: PropTypes.string.isRequired,
};

export default InvalidFilenameMessage;