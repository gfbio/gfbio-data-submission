import { Collapse, Modal, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { mapValueToField } from "../../utils/MapValueToField";

const CollapsibleSelector = (props) => {
  const {
    field_id,
    options,
    default_value,
    form,
    title,
    mandatory,
    description,
  } = props;
  const location = useLocation();

  const getDefaultOpt = () => {
    const submissionValue = mapValueToField(field_id);
    if (submissionValue !== "") {
      return submissionValue
        ? options.map((o) => o.option).filter((o) => o === submissionValue)
        : null;
    } else {
      return default_value
        ? options.map((o) => o.option).filter((o) => o === default_value)
        : null;
    }
  };

  const [value, setValue] = useState(
    getDefaultOpt() ? getDefaultOpt()[0] : options[0].option
  );

  useEffect(() => {
    form.setFieldValue(field_id, value);
  }, [value, form, field_id]);

  useEffect(() => {
    // Reset form state when URL changes
    setValue(getDefaultOpt() ? getDefaultOpt()[0] : options[0].option);
  }, [location]);

  const [opened, { toggle }] = useDisclosure(false);

  return (
    <div className="collapsible-selector-container">
      {title && (
        <h2>
          {title}{" "}
          {mandatory && (
            <span className="mantine-InputWrapper-required mantine-TextInput-required">
              *
            </span>
          )}
        </h2>
      )}
      {description && <label>{description}</label>}
      <div className="container">
        <div className="multi-select-row row btn-style" onClick={toggle}>
          <p className="col my-2 row-title">
            <i className="fa fa-balance-scale mr-2"></i>
            {value}
          </p>
          <p className="clickable-text col-auto text-right my-2">change</p>
        </div>
      </div>

      <Collapse
        className="container"
        in={opened}
        transitionDuration={100}
        transitionTimingFunction="linear"
      >
        {options.map((opt) => {
          const [dialog_opened, { open: open_dialog, close: close_dialog }] =
            useDisclosure(false);
          const choose_option = function () {
            setValue(opt.option);
          };
          return (
            <div className="multi-select-row row clickable-row">
              <p className="col my-2 row-title" onClick={choose_option}>
                {opt.option}
              </p>
              {(opt.description || opt.help_link) && (
                <>
                  <Modal
                    opened={dialog_opened}
                    onClose={close_dialog}
                    title={opt.option}
                    centered
                    size="auto"
                  >
                    <div className="modal-dialog-body">
                      {opt.description && (
                        <Text className="use-line-breaks">
                          {opt.description}
                        </Text>
                      )}
                    </div>
                    <div className="modal-dialog-footer container p-0">
                      {opt.help_link && (
                        <div className="row">
                          <div className="col-12">
                            <a
                              href={opt.help_link}
                              className="btn btn-light-blue-inverted btn-block"
                            >
                              More detail
                            </a>
                          </div>
                        </div>
                      )}
                      <div className="row">
                        <div className="col-12">
                          <p
                            className="btn btn-light-blue-inverted btn-block"
                            onClick={() => {
                              choose_option();
                              close_dialog();
                            }}
                          >
                            Choose this
                          </p>
                        </div>
                      </div>
                    </div>
                  </Modal>
                  <div
                    className="col-auto clickable-text"
                    onClick={open_dialog}
                  >
                    <p className="text-right my-2">details</p>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </Collapse>
    </div>
  );
};

CollapsibleSelector.defaultProps = {};

CollapsibleSelector.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  form: PropTypes.object.isRequired,
  field_id: PropTypes.string.isRequired,
};

export default CollapsibleSelector;
