import React, {useState} from 'react';
import {Button, Group, Modal} from '@mantine/core';
import {useDisclosure} from '@mantine/hooks';
import {DatePicker} from '@mantine/dates';

const EmbargoDate = (props) => {
    const {title, description, form, options, field_id} = props;
    const [opened, {open, close}] = useDisclosure(false);
    let today = new Date();
    today.setFullYear(today.getFullYear() + 1);
    console.log('today +one year ', today);
    const [embargoDate, setEmbargoDate] = useState(today);
    const [tmpEmbargoDate, setTempEmbargoDate] = useState(embargoDate);

    // TODO: add logic for:
    //  Do not show button if at least one PID has status PUBLIC
    //  if at least 1 PID has status PUBLIC do not show button
    const showEmbargoButton = () => {
        return (
            <Group>
                <Button onClick={open} variant="default">
                    Change embargo date
                </Button>
            </Group>
        );
    }

    const addMonthsToInitialEmbargoDate = (months) => {
        console.log('addMonthsToEmbargoDate ', months);
        today.setMonth(embargoDate.getMonth() + months);
        setEmbargoDate(today);
    }

    const formattedEmbargoDate = () => {
        return (
            embargoDate.getDate().toString() + ' ' +
            embargoDate.toLocaleString('default', {month: 'long'}) + ' ' +
            embargoDate.getFullYear().toString()
        );
    }

    return (
        <div>
            <header className="">
                <h2 className="">Embargo Date</h2>
                <h4>{formattedEmbargoDate()}</h4>
                {showEmbargoButton()}
            </header>
            <Modal opened={opened} onClose={close} title="Select embargo date" centered>
                <Group justify="center">
                    <Button variant="default" onClick={() => {
                        addMonthsToInitialEmbargoDate(6)
                    }}>
                        6 months
                    </Button>
                    <Button variant="default" onClick={() => {
                        addMonthsToInitialEmbargoDate(12)
                    }}>
                        12 months
                    </Button>
                    <Button variant="default" onClick={() => {
                        addMonthsToInitialEmbargoDate(18)
                    }}>
                        18 months
                    </Button>
                </Group>
                <Group justify="center">
                    <p>New Embargo: <b>{formattedEmbargoDate()}</b></p>
                </Group>
                <Group justify="center">
                    <DatePicker defaultDate={today} value={embargoDate} onChange={setEmbargoDate}/>
                </Group>
                <Group justify="center">
                    <Button variant="default" onClick={() => {
                        setTempEmbargoDate(embargoDate);
                        close();
                    }}>
                        Accept
                    </Button>
                    <Button variant="default" onClick={() => {
                        setEmbargoDate(tmpEmbargoDate);
                        close();
                    }}>
                        Cancel
                    </Button>
                </Group>

            </Modal>

        </div>
    );

}

export default EmbargoDate;
