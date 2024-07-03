import {
  Button,
  Card,
  Collapse,
  Grid,
  Group,
  Input,
  List,
  Modal,
  MultiSelect,
  TextInput,
  ThemeIcon,
  UnstyledButton,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import PropTypes from "prop-types";
import { useState } from "react";
import RolesInfo from "../../utils/ContributorsRoles";

const Contributors = (props) => {
  const { title, description, form, field_id } = props;
  const [contributors, setContributors] = useState([]);
  const [newContributor, setNewContributor] = useState({
    firstName: "",
    lastName: "",
    email: "",
    institution: "",
    role: [],
  });
  const [editingContributor, setEditingContributor] = useState(null);
  const [emailValid, setEmailValid] = useState(false);

  const [opened, { toggle }] = useDisclosure(false);
  const [rolesInfoOpened, { open, close }] = useDisclosure(false);

  const mainRoles = [
    "Author/Creator",
    "Content Contact",
    "Principal Investigator",
  ];

  const additionalRoles = [
    "Data Owner",
    "Data Curator",
    "Data Editor/Data Manager",
    "Data Owner Contact",
    "Researcher",
    "Data Owner Organisation",
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewContributor((prevContributor) => ({
      ...prevContributor,
      [name]: value,
    }));
    if (name === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const isValidEmail = emailRegex.test(value);
      setEmailValid(isValidEmail);
    }
  };

  const handleRoleChange = (value) => {
    setNewContributor((prevContributor) => ({
      ...prevContributor,
      role: value,
    }));
  };

  const handleAddContributor = () => {
    const contributorsList = [...contributors, newContributor];
    setContributors(contributorsList);
    setNewContributor({
      firstName: "",
      lastName: "",
      email: "",
      institution: "",
      role: [],
    });
    setEmailValid(false);
    form.setFieldValue(field_id, contributorsList);
  };

  const handleEditContributor = (contributor) => {
    setEditingContributor(contributor);
    setNewContributor(contributor);
    setEmailValid(true);
  };

  const handleSaveContributor = () => {
    const contributorsList = contributors.map((contributor) =>
      contributor.email === editingContributor.email
        ? newContributor
        : contributor
    );
    setContributors(contributorsList);
    setEditingContributor(null);
    setNewContributor({
      firstName: "",
      lastName: "",
      email: "",
      institution: "",
      role: [],
    });
    setEmailValid(false);
    form.setFieldValue(field_id, contributorsList);
  };

  const handleDeleteContributor = (contributor) => {
    const contributorsList = contributors.filter(
      (c) => c.email !== contributor.email
    );
    setContributors(contributorsList);
    setEditingContributor(null);
    setNewContributor({
      firstName: "",
      lastName: "",
      email: "",
      institution: "",
      role: [],
    });
    setEmailValid(false);
    form.setFieldValue(field_id, contributorsList);
  };

  return (
    <>
      <div>
        <Input.Label>{title}</Input.Label>
        <Input.Description>{description}</Input.Description>
        <Group justify="center" display={!opened ? "flex" : "none"}>
          <Button onClick={toggle} color="blue">
            Add Contributor
          </Button>
        </Group>
        <Collapse in={opened}>
          <Grid gutter="lg">
            <Grid.Col span={4}>
              <Card shadow="xs" padding="sm">
                <h4>Contributors List</h4>
                <List
                  spacing="sm"
                  icon={
                    <ThemeIcon color="blue" variant="filled">
                      <i className="fa fa-user-circle-o"></i>
                    </ThemeIcon>
                  }
                >
                  {contributors.map((contributor) => (
                    <List.Item
                      key={contributor.email}
                      onClick={() => handleEditContributor(contributor)}
                      style={{ cursor: "pointer" }}
                    >
                      {contributor.firstName} {contributor.lastName}
                    </List.Item>
                  ))}
                </List>
              </Card>
            </Grid.Col>
            <Grid.Col span={8}>
              <Card shadow="xs" padding="lg">
                <h4>
                  {editingContributor ? "Edit Contributor" : "Add Contributor"}
                </h4>
                <Grid gutter={"sm"} style={{ marginBottom: "1rem" }}>
                  <Grid.Col span={3}>
                    <span>First Name</span>
                    <TextInput
                      name="firstName"
                      value={newContributor.firstName}
                      onChange={handleInputChange}
                    />
                  </Grid.Col>
                  <Grid.Col span={3}>
                    <span>Last Name</span>
                    <TextInput
                      name="lastName"
                      value={newContributor.lastName}
                      onChange={handleInputChange}
                    />
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <span>Email</span>
                    <TextInput
                      name="email"
                      autoComplete="email"
                      value={newContributor.email}
                      onChange={handleInputChange}
                    />
                  </Grid.Col>
                  <Grid.Col span={12}>
                    <span>Institution (optional)</span>
                    <TextInput
                      name="institution"
                      value={newContributor.institution}
                      onChange={handleInputChange}
                    />
                  </Grid.Col>
                  <Grid.Col span={12}>
                    <span>
                      Contributor Role (optional)
                      <UnstyledButton
                        className="fa fa-question-circle-o"
                        onClick={open}
                        ml={10}
                        fz={18}
                      ></UnstyledButton>
                    </span>
                    <MultiSelect
                      name="role"
                      value={newContributor.role}
                      onChange={handleRoleChange}
                      data={[
                        { group: "Main Roles", items: [...mainRoles] },
                        {
                          group: "Additional Roles",
                          items: [...additionalRoles],
                        },
                      ]}
                      placeholder="Select role"
                    />
                  </Grid.Col>
                </Grid>
                {editingContributor ? (
                  <Grid>
                    <Grid.Col span={4}>
                      <Button
                        fullWidth
                        onClick={handleSaveContributor}
                        disabled={
                          !newContributor.firstName ||
                          !newContributor.lastName ||
                          !emailValid
                        }
                      >
                        Save Changes
                      </Button>
                    </Grid.Col>
                    <Grid.Col span={4}>
                      <Button
                        fullWidth
                        onClick={() => {
                          setEditingContributor(null);
                          setNewContributor({
                            firstName: "",
                            lastName: "",
                            email: "",
                            institution: "",
                            role: [],
                          });
                          setEmailValid(false);
                        }}
                      >
                        Cancel
                      </Button>
                    </Grid.Col>
                    <Grid.Col span={4}>
                      <Button
                        fullWidth
                        onClick={() =>
                          handleDeleteContributor(editingContributor)
                        }
                        color="red"
                      >
                        Delete
                      </Button>
                    </Grid.Col>
                  </Grid>
                ) : (
                  <Button
                    onClick={handleAddContributor}
                    disabled={
                      !newContributor.firstName ||
                      !newContributor.lastName ||
                      !emailValid
                    }
                  >
                    Add Contributor
                  </Button>
                )}
              </Card>
            </Grid.Col>
          </Grid>
        </Collapse>
      </div>

      <Modal
        opened={rolesInfoOpened}
        onClose={close}
        title="Roles Description"
        size="50%"
        yOffset="10vh"
        scrollAreaComponent={"ScrollArea.Autosize"}
      >
        <RolesInfo />
      </Modal>
    </>
  );
};

Contributors.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  form: PropTypes.object.isRequired,
  field_id: PropTypes.string.isRequired,
};

export default Contributors;
