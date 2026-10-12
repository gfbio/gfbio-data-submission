import { Radio } from "@mantine/core";
import PropTypes from "prop-types";
import {useEffect, useState} from "react";

const AgreeToNagoyaProtocol = ({ title, description, form, options, field_id, mandatory }) => {
    const [disableSecondOption, setDisableSecondOption] = useState(false);
    form.register((values, profileData, validations) => {
        let field = profileData.form_fields.find(
            ({ field }) => field.field_id === field_id
        );
        let value = values[field_id];
        if (field.mandatory && !value) {
            validations[field_id] = "This field is required. Please fill it in before submitting.";
        }
    });


    useEffect(() => {
        const currentValue = form?.values?.[field_id];
        if(currentValue == "yes") {
            setDisableSecondOption(true);
        }
    }, [form?.values?.[field_id]]);

    return (
        <div>
            <Radio.Group
                label={title}
                description={description}
                key={form.key(field_id)}
                className={ mandatory ? "mantine-InputWrapper-required mandatory" : "" }
                {...form.getInputProps(field_id)}
            >
                {options.map((opt, index) => (
                    <div className="d-flex">
                        <Radio
                            key={index}
                            value={opt.option}
                            disabled={index==1 && disableSecondOption}
                        />
                        <div className="ms-3" dangerouslySetInnerHTML={{ __html: opt.description}}></div>
                    </div>
                ))}
            </Radio.Group>
        </div>
    );
};

AgreeToNagoyaProtocol.propTypes = {
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    form: PropTypes.object.isRequired,
    field_id: PropTypes.string.isRequired,
    options: PropTypes.arrayOf(PropTypes.shape({
        option: PropTypes.string.isRequired
    })).isRequired,
};

export default AgreeToNagoyaProtocol;
