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

    const formattedEmbargoDate = ()=> {
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
            <Modal opened={opened} onClose={close} title="Change embargo date" centered>
                <h4>datepicker</h4>
                <DatePicker defaultDate={today} value={embargoDate} onChange={setEmbargoDate}/>
            </Modal>

        </div>
    );

}

export default EmbargoDate;
