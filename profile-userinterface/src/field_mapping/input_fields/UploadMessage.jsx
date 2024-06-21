import React from "react";
import PropTypes from "prop-types";
import { Collapse, Text } from "@mantine/core";
import { MAX_TOTAL_UPLOAD_SIZE, MAX_UPLOAD_ITEMS } from "../../settings.jsx";
import filesize from "filesize";

const UploadMessage = ({ showUploadLimitMessage }) => (
  <Collapse in={showUploadLimitMessage}>
    <div className="form-group col-md-12">
      <div role="alert" className="fade alert alert-light show">
        <div className="alert-heading h4">
          <i className="fa fa-bolt"></i> Upload limit exceeded
        </div>
        <Text>
          If you need to upload more than {MAX_UPLOAD_ITEMS} files, or more than{" "}
          {filesize(MAX_TOTAL_UPLOAD_SIZE, { base: 10 })}, either provide a URL
          in the field below, or leave a comment for the curator at the bottom.
        </Text>
      </div>
    </div>
  </Collapse>
);

UploadMessage.propTypes = {
  showUploadLimitMessage: PropTypes.bool,
};

export default UploadMessage;
