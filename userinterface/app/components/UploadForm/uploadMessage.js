/**
 *
 * UploadMessage
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import Collapse from 'react-bootstrap/Collapse';
import Button from 'react-bootstrap/Button';

// import styled from 'styled-components';

function UploadMessage(showUploadLimitMessage, dismissMessage) {
  return (
    <Collapse
      in={showUploadLimitMessage}
    >
      {/*<div className="col-12 mx-auto">*/}
      {/*<div className="row">*/}
      {/*<div className="col-1 mx-auto">*/}
      {/*  <i*/}
      {/*    className="icon ion-md-checkmark-circle-outline align-bottom" />*/}
      {/*</div>*/}
      {/*<div className="col-8">*/}
      {/*<h5>Your submission was saved</h5>*/}
      {/*<p>*/}
      {/*  Anim pariatur cliche reprehenderit, enim eiusmod high life*/}
      {/*  accusamus*/}
      {/*  terry richardson ad squid. Nihil anim keffiyeh helvetica,*/}
      {/*  craft*/}
      {/*  beer*/}
      {/*  labore wes anderson cred nesciunt sapiente ea proident.*/}
      {/*</p>*/}

      <div className="form-group col-md-12">
        <div role="alert" className="fade alert alert-light show">
          <div className="alert-heading h4"><i
            className="fa  fa-bolt"></i> Upload limit exceeded
          </div>
          <p>
            If you need to a upload more than 20 files, or more than 200 MB,
            either provide a URL in the field below, or leave a comment for
            the curator at the bottom.
          </p>
          {/*<Button variant="secondary"*/}
          {/*        onClick={dismissMessage}>*/}
          {/*  Close*/}
          {/*</Button>*/}
        </div>
      </div>

      {/*

      <div class="form-group col-md-12"><div role="alert" class="fade alert alert-light show"><div class="alert-heading h4"><i class="fa  fa-bolt"></i> There are some validation errors you need to take care of</div><ul class="list-group list-group-flush"><li class="list-group-item"><span class="validation-error-item"><i class="ti-layout-line-solid icon "></i>title<i class="ti-arrow-right icon pl-1"></i>This field is required</span></li><li class="list-group-item"><span class="validation-error-item"><i class="ti-layout-line-solid icon "></i>description<i class="ti-arrow-right icon pl-1"></i>This field is required</span></li><li class="list-group-item"><span class="validation-error-item">Once all errors are resolved, try to 'save' or 'start' again.</span></li></ul></div></div>
      */}

      {/*  </div>*/}
      {/*  <div className="col-2">*/}
      {/*    <Button variant="secondary"*/}
      {/*            onClick={dismissMessage}>*/}
      {/*      Close*/}
      {/*    </Button>*/}
      {/*  </div>*/}
      {/*</div>*/}
      {/*</div>*/}
    </Collapse>
  );
}

UploadMessage.propTypes = {
  showUploadLimitMessage: PropTypes.bool,
  dismissMessage: PropTypes.func,
};

export default UploadMessage;
