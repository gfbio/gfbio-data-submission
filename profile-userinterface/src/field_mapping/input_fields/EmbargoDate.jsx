import { Button, Group, Modal } from "@mantine/core";
import { DatePicker } from "@mantine/dates";
import { useDisclosure } from "@mantine/hooks";
import PropTypes from "prop-types";
import { useState } from "react";
import { formatDateToYYYYMMDD } from "../../utils/dateUtils";

const EmbargoDate = ({title, mandatory, form, field_id}) => {
    const today = new Date();
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    const defaultDate = new Date();
    defaultDate.setFullYear(defaultDate.getFullYear() + 1);
    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() + 2);
    const [opened, {open, close}] = useDisclosure(false);
    const [tempDate, setTempDate] = useState(() => {
        if (form.values[field_id]) {
            const [year, month, day] = form.values[field_id].split('-');
            return new Date(year, month - 1, day);
        }
        return defaultDate;
    });

    const [displayDate, setDisplayDate] = useState(
        form.values[field_id]
            ? new Date(form.values[field_id])
            : defaultDate
    );

    const addMonthsToDate = (months) => {
        const newDate = new Date(today);
        newDate.setMonth(today.getMonth() + months);
        setTempDate(newDate);
    };

    const formattedDate = (date) => {
        return String(date.getDate()).padStart(2, '0') + ' ' +
            date.toLocaleString('en-GB', {month: 'long'}) + ' ' +
            date.getFullYear().toString();
    };

    const handleAccept = () => {
        const formattedValue = formatDateToYYYYMMDD(tempDate);
        form.setFieldValue(field_id, formattedValue);
        setDisplayDate(tempDate);
        close();
    };

    const setToTomorrow = () => {
        const newDate = new Date(today);
        newDate.setDate(today.getDate() + 1);
        const formattedValue = formatDateToYYYYMMDD(newDate);
        form.setFieldValue(field_id, formattedValue);
        setDisplayDate(newDate);
    };

    const handleCancel = () => {
        setTempDate(form.values[field_id] ? new Date(form.values[field_id]) : defaultDate);
        close();
    };

    return (
        <div className="embargo-date">
            <h2>{title} {mandatory && (
                <span className="mantine-InputWrapper-required mantine-TextInput-required">*</span>)}</h2>
            <h4 className="text-center">{formattedDate(displayDate)}</h4>
            <Button fullWidth justify="space-between" onClick={open} variant="default" className="link-style">
                <i className="icon ion-md-calendar align-top"></i>
                Change embargo date
            </Button>
            <Button fullWidth justify="space-between" variant="default" className="link-style" onClick={setToTomorrow}>
                <i className="fa fa-calendar-check-o align-top fs-5" />
                Release tomorrow
            </Button>

            <Modal 
                opened={opened}
                onClose={handleCancel}
                title="Select Embargo Date"
                centered
                classNames={{
                    root: 'embargo-modal',
                }}
            >
                <Group justify="center" className="mt-3">
                    <p>New Embargo: <b>{formattedDate(tempDate)}</b></p>
                </Group>
                <Group grow justify="center" className="embargo-quick-select">
                    <Button size="compact-md" className='button-inverted blue-button' variant="default"
                            onClick={() => addMonthsToDate(6)}>
                        6 months
                    </Button>
                    <Button size="compact-md" className='button-inverted blue-button' variant="default"
                            onClick={() => addMonthsToDate(12)}>
                        12 months
                    </Button>
                    <Button size="compact-md" className='button-inverted blue-button' variant="default"
                            onClick={() => addMonthsToDate(18)}>
                        18 months
                    </Button>
                </Group>
                <Group className='embargo-picker' justify="center">
                    <DatePicker
                        defaultDate={tempDate}
                        minDate={tomorrow}
                        maxDate={maxDate}
                        value={tempDate}
                        onChange={setTempDate}
                        classNames={{
                            weekday: 'mantine-DatePicker-weekday',
                        }}
                    />
                </Group>
                <Group grow justify="center" className="embargo-footer">
                    <Button size="compact-md" className='button-inverted green-button' variant="default" onClick={handleAccept}>
                        Accept
                    </Button>
                    <Button size="compact-md" className='button-inverted red-button' variant="default" onClick={handleCancel}>
                        Cancel
                    </Button>
                </Group>
            </Modal>
        </div>
    );
};

EmbargoDate.propTypes = {
    title: PropTypes.string.isRequired,
    mandatory: PropTypes.bool.isRequired,
    form: PropTypes.object.isRequired,
    field_id: PropTypes.string.isRequired,
};

export default EmbargoDate;
