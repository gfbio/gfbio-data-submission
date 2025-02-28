import {
    Button,
    CloseButton,
    Flex,
    Input,
    List,
    TextInput,
    ThemeIcon,
} from "@mantine/core";
import PropTypes from "prop-types";
import { useState } from "react";

function RelatedPublications(props) {
  const { title, description, mandatory, form, field_id, placeholder } = props;

  const [publication, setPublication] = useState("");
  const [publicationsList, setPublicationsList] = useState(form.values[field_id] || []);

  const handlePublicationChange = (event) => {
    setPublication(event.target.value);
  };

  const handleAddPublication = () => {
    if (publication.trim() !== "") {
      const updatedList = [...publicationsList, publication];
      setPublicationsList(updatedList);
      setPublication("");
      form.setFieldValue(field_id, updatedList);
    }
  };

  const handleRemovePublication = (publication) => {
    const updatedList = publicationsList.filter((item) => item !== publication);
    setPublicationsList(updatedList);
    form.setFieldValue(field_id, updatedList);
  };

  return (
    <div className="listings-form-field">
      <Input.Label>{title}</Input.Label>
      { description && <Input.Description className="mb-3">{description}</Input.Description> }
      <List
        spacing="4px"
        icon={
          <i className="fa fa-newspaper-o publication-icon pb-2"></i>
        }
        className="mb-3"
      >
        {publicationsList.map((item) => (
          <List.Item key={item} className="listing-item">
            <Flex justify={"space-between"} align={"center"}>
              <span className="title">{item}</span>
              <CloseButton
                onClick={() => handleRemovePublication(item)}
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
      <Flex className="mb-2 flex-column flex-md-row">
        <TextInput
          className="pe-0 pe-md-4"
          placeholder={placeholder}
          key={form.key(field_id)}
          value={publication}
          onChange={handlePublicationChange}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              handleAddPublication();
            }
          }}
          style={{ flex: "1" }}
        />
        <Button
          onClick={handleAddPublication}
          style={{ width: "auto" }}
          className="button-inverted blue-button align-self-auto align-self-md-end mt-3 mt-md-0"
        >
          Add
        </Button>
      </Flex>
    </div>
  );
}

RelatedPublications.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  mandatory: PropTypes.bool.isRequired,
  form: PropTypes.object.isRequired,
  field_id: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
};

export default RelatedPublications;
