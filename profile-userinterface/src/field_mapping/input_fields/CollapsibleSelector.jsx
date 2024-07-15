import React, {useState, useEffect} from 'react';
import { useDisclosure } from '@mantine/hooks';
import { Text, Collapse, Modal } from '@mantine/core';
import PropTypes from "prop-types";

const CollapsibleSelector = (props) => {
    const {title, description, form, options, default_value, field_id, mandatory, } = props;

    var default_opt = default_value ? options.map(o => o.option).filter(o => o == default_value) : null
    const [value, setValue] = useState(default_opt ? default_opt[0] : options[0].option);
    useEffect(() => {
        form.setFieldValue(field_id, value);
    }, []);

    const [opened, { toggle }] = useDisclosure(false);

    return (
        <div className='collapsible-selector-container'>
            { title && ( <h2>{title} {mandatory && ( <span class="mantine-InputWrapper-required mantine-TextInput-required">*</span>)}</h2> ) }
            { description && ( <label>{description}</label> ) }
            <div className='container'>
                <div className='multi-select-row row btn-style' onClick={toggle}>
                    <p className='col my-2 row-title'><i class="fa fa-balance-scale mr-2"></i>{value}</p>
                    <p className='clickable-text col-auto text-right my-2'>change</p>
                </div>
            </div>

            <Collapse className='container' in={opened} transitionDuration={100} transitionTimingFunction="linear">
                {
                    options.map(
                        opt => {
                            const [dialog_opened, { open: open_dialog, close: close_dialog }] = useDisclosure(false);
                            const choose_option = function() { setValue(opt.option); };
                            return (
                                <div className='multi-select-row row clickable-row'>
                                    <p className='col my-2 row-title' onClick={choose_option}>{opt.option}</p>
                                    {
                                        (opt.description || opt.help_link) && (
                                            <>
                                                <Modal opened={dialog_opened} onClose={close_dialog} title={opt.option} centered size="auto">
                                                    <div className='modal-dialog-body'>
                                                        { opt.description && ( <Text className='use-line-breaks'>{opt.description}</Text> ) }
                                                    </div>
                                                    <div className='modal-dialog-footer container p-0'>
                                                        {
                                                            opt.help_link && (
                                                                <div className='row'>
                                                                    <div className='col-12'>
                                                                        <a href={opt.help_link} className='btn btn-light-blue-inverted btn-block'>More detail</a>
                                                                    </div>
                                                                </div>
                                                            )
                                                        }
                                                        <div className='row'>
                                                            <div className='col-12'>
                                                                <p className='btn btn-light-blue-inverted btn-block' onClick={ () => { choose_option(); close_dialog(); } }>
                                                                    Choose this
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Modal>
                                                <div className='col-auto clickable-text' onClick={open_dialog}>
                                                    <p className='text-right my-2'>details</p>
                                                </div>
                                            </>
                                        )
                                    }
                                </div>
                            )
                        }
                    )
                }
            </Collapse>
        </div>
    );
}

CollapsibleSelector.defaultProps = {}

CollapsibleSelector.propTypes = {
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    form: PropTypes.object.isRequired,
    field_id: PropTypes.string.isRequired,
}

export default CollapsibleSelector;
