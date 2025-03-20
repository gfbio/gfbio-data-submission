import { Collapse, Modal, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import PropTypes from "prop-types";
import { useState } from "react";
const CollapsibleSelector = (props) => {
    const {
        field_id,
        options,
        form,
        title,
        mandatory,
        description,
    } = props;

    const [value, setValue] = useState(form.values[field_id]);
    const [opened, { toggle }] = useDisclosure(false);
    const [dialogOpened, { open: openDialog, close: closeDialog }] = useDisclosure(false);
    const [selectedOption, setSelectedOption] = useState(null);

    const handleOptionClick = (opt) => {
        const newValue = opt.option;
        setValue(newValue);
        form.setFieldValue(field_id, newValue);
        closeDialog();
    };

    const showOptionDetails = (opt) => {
        setSelectedOption(opt);
        openDialog();
    };

    return (
        <div className='collapsible-selector-container'>
            { title && ( <h2>{title} {mandatory && ( <span className="mantine-InputWrapper-required mantine-TextInput-required">*</span>)}</h2> ) }
            { description && ( <label>{description}</label> ) }
            <div className='container'>
                <div className='multi-select-row row btn-style' onClick={toggle}>
                    <p className='col my-2 row-title'><i className="fa fa-balance-scale me-3"></i>{value}</p>
                    <p className='clickable-text col-auto text-right my-2'>change</p>
                </div>
            </div>

            <Collapse className='container' in={opened} transitionDuration={100} transitionTimingFunction="linear">
                {options.map((opt) => (
                    <div key={opt.option} className='multi-select-row row clickable-row'>
                        <p className='col my-2 row-title' onClick={() => handleOptionClick(opt)}>{opt.option}</p>
                        {(opt.description || opt.help_link) && (
                            <div className='col-auto clickable-text' onClick={() => showOptionDetails(opt)}>
                                <p className='text-right my-2'>details</p>
                            </div>
                        )}
                    </div>
                ))}
            </Collapse>

            {selectedOption && (
                <Modal 
                    opened={dialogOpened}
                    onClose={closeDialog}
                    title={selectedOption.option + " Description"}
                    centered
                    size="auto"
                    classNames={{
                        header: 'collapsible-selector-modal-header',
                    }}>
                    <div className='modal-dialog-body'>
                        {selectedOption.description && (
                            <Text className='use-line-breaks collapsible-selector-modal-text'>{selectedOption.description}</Text>
                        )}
                    </div>
                    <div className='modal-dialog-footer container p-0 mt-3'>
                        {selectedOption.help_link && (
                            <div className='row'>
                                <div className='col-12'>
                                    <a href={selectedOption.help_link} className='btn btn-light-blue-inverted w-100 collapsible-selector-modal-button'>Read More</a>
                                </div>
                            </div>
                        )}
                        <div className='row'>
                            <div className='col-12'>
                                <button className='btn btn-light-blue-inverted w-100 mt-0 collapsible-selector-modal-button' 
                                    onClick={() => handleOptionClick(selectedOption)}>
                                    Choose this License
                                </button>
                            </div>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

CollapsibleSelector.propTypes = {
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    mandatory: PropTypes.bool.isRequired,
    form: PropTypes.object.isRequired,
    field_id: PropTypes.string.isRequired,
    options: PropTypes.arrayOf(PropTypes.shape({
        option: PropTypes.string.isRequired,
        description: PropTypes.string,
        help_link: PropTypes.string
    })).isRequired,
};

export default CollapsibleSelector;
