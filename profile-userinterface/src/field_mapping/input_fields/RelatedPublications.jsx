import {
  Button,
  CloseButton,
  Flex,
  List,
  TextInput,
  ThemeIcon,
} from "@mantine/core";
import PropTypes from "prop-types";
import { useState } from "react";
import { mapValueToField } from "../../utils/MapValueToField";

function RelatedPublications(props) {
  const { title, description, mandatory, form, field_id, placeholder } = props;
  const value = mapValueToField(field_id);
  const [publication, setPublication] = useState("");
  const [publicationsList, setPublicationsList] = useState(
    value === "" ? [] : value
  );

  const handlePublicationChange = (event) => {
    setPublication(event.target.value);
  };

  const handleAddPublication = () => {
    if (publication.trim() !== "") {
      const updatedList = [...publicationsList, publication];
      setPublicationsList(updatedList);
      setPublication("");
      form.setFieldValue(field_id, updatedList.join(", "));
    }
  };

  const handleRemovePublication = (publication) => {
    const updatedList = publicationsList.filter((item) => item !== publication);
    setPublicationsList(updatedList);
    form.setFieldValue(field_id, updatedList.join(", "));
  };

  return (
    <div>
      <Flex style={{ marginBottom: "8px" }}>
        <TextInput
          label={title}
          description={description}
          placeholder={placeholder}
          key={form.key(field_id)}
          required={mandatory}
          value={publication}
          onChange={handlePublicationChange}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              handleAddPublication();
            }
          }}
          style={{ flex: "1", marginRight: "8px" }}
        />
        <Button
          onClick={handleAddPublication}
          style={{ width: "auto", alignSelf: "flex-end" }}
        >
          Add Publication
        </Button>
      </Flex>
      <List
        spacing="xs"
        icon={
          <ThemeIcon color="blue" variant="filled">
            <i className="fa fa-book"></i>
          </ThemeIcon>
        }
      >
        {publicationsList.map((item) => (
          <List.Item key={item}>
            <Flex>
              <span>{item}</span>
              <CloseButton
                onClick={() => handleRemovePublication(item)}
                style={{ marginLeft: "12px" }}
              />
            </Flex>
          </List.Item>
        ))}
      </List>
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
