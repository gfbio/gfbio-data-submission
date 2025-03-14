import {
    Button,
    CloseButton,
    Flex,
    Input,
    List,
    TextInput,
} from "@mantine/core";
import PropTypes from "prop-types";
import { useState, useRef } from "react";

function UniqueStringsList(props) {
  const { title, description, mandatory, form, field_id, placeholder, fa_icon_tag } = props;

  const [currentlyEdited, setCurrentlyEdited] = useState("");
  const [itemsList, setItemsList] = useState(form.values[field_id] || []);

  const handleChange = (event) => {
    setCurrentlyEdited(event.target.value);
  };

  const inputRef = useRef();

  const handleAdd = () => {
    let value = currentlyEdited.trim();
    if (value !== "") {
      if (!itemsList.some(s => s == value)) {
        const updatedList = [...itemsList, value];
        setItemsList(updatedList);
        form.setFieldValue(field_id, updatedList);
      }
      setCurrentlyEdited("");
      const timer = setTimeout(() => { inputRef.current.getElementsByTagName("input")[0].focus(); }, 25);
    }
  };

  const handleRemove = (toRemove) => {
    const updatedList = itemsList.filter((item) => item !== toRemove);
    setItemsList(updatedList);
    form.setFieldValue(field_id, updatedList);
  };

  return (
    <div className="listings-form-field">
      <Input.Label>{title}</Input.Label>
      { description && <Input.Description className="mb-3">{description}</Input.Description> }
      <List
        spacing="4px"
        icon={
          fa_icon_tag
            ? <i className={"fa items-list-icon pb-2 " + fa_icon_tag }></i>
            : "<i></i>"
        }
        className="mb-3"
      >
        {itemsList.map((item) => (
          <List.Item key={item} className="listing-item">
            <Flex justify={"space-between"} align={"center"}>
              <span className="title">{item}</span>
              <CloseButton
                onClick={() => handleRemove(item)}
                className="delete-button"
                icon={
                  <i className="fa fa-close"></i>
                }
              >
                Remove
              </CloseButton>
            </Flex>
          </List.Item>
        ))}
      </List>
      <Flex className="mb-2 flex-column flex-md-row" ref={inputRef}>
        <TextInput
          className="pe-0 pe-md-4"
          placeholder={placeholder}
          key={form.key(field_id)}
          value={currentlyEdited}
          onChange={handleChange}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              handleAdd();
            }
          }}
          style={{ flex: "1" }}
        />
        <Button
          onClick={handleAdd}
          style={{ width: "13%" }}
          className="button-inverted blue-button align-self-auto align-self-md-end mt-3 mt-md-0"
        >
          Add
        </Button>
      </Flex>
    </div>
  );
}

UniqueStringsList.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  mandatory: PropTypes.bool.isRequired,
  form: PropTypes.object.isRequired,
  field_id: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
};

export default UniqueStringsList;
