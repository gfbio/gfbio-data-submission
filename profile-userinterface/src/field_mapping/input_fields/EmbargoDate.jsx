import { Button, Group, Modal } from "@mantine/core";
import { DatePicker } from "@mantine/dates";
import { useDisclosure } from "@mantine/hooks";
import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const EmbargoDate = (props) => {
  const { title, description, form, options, field_id, mandatory } = props;
  const location = useLocation();

  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const initialDate = new Date();
  initialDate.setFullYear(today.getFullYear() + 1);
  const maxDate = new Date();
  maxDate.setFullYear(today.getFullYear() + 2);

  const [embargoDate, setEmbargoDate] = useState(initialDate);
  const [tmpEmbargoDate, setTempEmbargoDate] = useState(embargoDate);

  const [opened, { open, close }] = useDisclosure(false);

  // TODO: since embargo is not send as part of the "requirements" field in the submission request,
  //  but is send as a dedicated field to the submission (serializer). I decided to store this in localstorage
  //  for now, to keep the logic of getting form values for the "requirements" field separated.
  useEffect(() => {
    localStorage.setItem("embargo", embargoDate.toISOString().split("T")[0]);
  }, [embargoDate]);
  // }

  useEffect(() => {
    const submission = JSON.parse(localStorage.getItem("submission"));
    if (submission.embargo) {
      setEmbargoDate(new Date(submission.embargo));
    } else {
      setEmbargoDate(initialDate);
    }
  }, [location]);

  // TODO: add logic for:
  //  Do not show button if at least one PID has status PUBLIC
  //  if at least 1 PID has status PUBLIC do not show button
  const showEmbargoButton = () => {
    return (
      <Group>
        <Button onClick={open} variant="default" className="link-style">
          <i className="icon ion-md-calendar align-top mr-2"></i>
          Change embargo date
        </Button>
      </Group>
    );
  };

  const addMonthsToInitialEmbargoDate = (months) => {
    const tmp = new Date(today);
    tmp.setMonth(today.getMonth() + months);
    setEmbargoDate(tmp);
  };

  const formattedEmbargoDate = () => {
    return (
      embargoDate.getDate().toString() +
      " " +
      embargoDate.toLocaleString("default", { month: "long" }) +
      " " +
      embargoDate.getFullYear().toString()
    );
  };

  return (
    <div>
      <header className="">
        <h2 className="">
          {title}{" "}
          {mandatory && (
            <span class="mantine-InputWrapper-required mantine-TextInput-required">
              *
            </span>
          )}
        </h2>
        <h4>{formattedEmbargoDate()}</h4>
        {showEmbargoButton()}
      </header>
      <Modal
        opened={opened}
        onClose={close}
        title="Select embargo date"
        centered
      >
        <Group justify="center">
          <p className="my-3">
            New Embargo: <b>{formattedEmbargoDate()}</b>
          </p>
        </Group>
        <Group justify="center">
          <Button
            className="button-inverted blue-button"
            variant="default"
            onClick={() => {
              addMonthsToInitialEmbargoDate(6);
            }}
          >
            6 months
          </Button>
          <Button
            className="button-inverted blue-button"
            variant="default"
            onClick={() => {
              addMonthsToInitialEmbargoDate(12);
            }}
          >
            12 months
          </Button>
          <Button
            className="button-inverted blue-button"
            variant="default"
            onClick={() => {
              addMonthsToInitialEmbargoDate(18);
            }}
          >
            18 months
          </Button>
        </Group>
        <Group className="pt-3 pb-5" justify="center">
          <DatePicker
            defaultDate={initialDate}
            minDate={tomorrow}
            maxDate={maxDate}
            value={embargoDate}
            onChange={setEmbargoDate}
          />
        </Group>
        <Group justify="center">
          <Button
            className="button-inverted green-button"
            variant="default"
            onClick={() => {
              setTempEmbargoDate(embargoDate);
              close();
            }}
          >
            Accept
          </Button>
          <Button
            className="button-inverted red-button"
            variant="default"
            onClick={() => {
              setEmbargoDate(tmpEmbargoDate);
              close();
            }}
          >
            Cancel
          </Button>
        </Group>
      </Modal>
    </div>
  );
};

EmbargoDate.defaultProps = {
  // default: "",
};

EmbargoDate.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  form: PropTypes.object.isRequired,
  field_id: PropTypes.string.isRequired,
  // default: PropTypes.string,
  options: PropTypes.array,
};

export default EmbargoDate;
