import React from "react";
import PropTypes from "prop-types";
import { Collapse, Text, Container } from "@mantine/core";
import { filesize } from "filesize";

const UploadMessage = ({
                           showUploadLimitMessage,

                           maxTotalUploadSize,
                       }) => (
    <Collapse in={showUploadLimitMessage}>
        <Container className="form-group col-md-12">
            <Container role="alert" className="fade alert alert-light show">
                <Container className="alert-heading text-danger h4">
                    <i className="fa fa-bolt"></i> Upload limit exceeded
                </Container>
                <Text>
                    If you need to upload more than{" "}
                    {filesize(maxTotalUploadSize, { base: 2 })}, either provide a URL
                    in the field below, or leave a comment for the curator at the bottom.
                </Text>
            </Container>
        </Container>
    </Collapse>
);

UploadMessage.propTypes = {
    showUploadLimitMessage: PropTypes.bool.isRequired,
    maxTotalUploadSize: PropTypes.number.isRequired,
};

export default UploadMessage;
