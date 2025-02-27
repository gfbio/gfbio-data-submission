import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
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
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import RolesInfo from "../../utils/ContributorsRoles";
import { mapValueToField } from "../../utils/MapValueToField";

const Contributors = (props) => {
  const { title, description, form, field_id } = props;
  const location = useLocation();

  const prefillContributors = mapValueToField(field_id);
  const [contributors, setContributors] = useState([]);
  const [newContributor, setNewContributor] = useState({
    firstName: "",
    lastName: "",
    emailAddress: "",
    institution: "",
    role: [],
  });
  const [editingContributor, setEditingContributor] = useState(null);
  const [firstnameValid, setFirstnameValid] = useState(true);
  const [lastnameValid, setLastnameValid] = useState(true);
  const [emailValid, setEmailValid] = useState(true);

  const [opened, { toggle }] = useDisclosure(false);
  const [rolesInfoOpened, { open, close }] = useDisclosure(false);

  useEffect(() => {
    if (prefillContributors !== "") {
      setContributors(prefillContributors);
      form.setFieldValue(field_id, prefillContributors);
    } else {
      setContributors([]);
      setNewContributor({
        firstName: "",
        lastName: "",
        emailAddress: "",
        institution: "",
        role: [],
      });
      form.setFieldValue(field_id, []);
      if (opened) {
        toggle();
      }
    }
  }, [location]);

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
  };

  const handleRoleChange = (value) => {
    setNewContributor((prevContributor) => ({
      ...prevContributor,
      role: value,
    }));
  };

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validateContributor = (contributor) => {
    const isValidEmail = emailRegex.test(contributor.emailAddress);
    const isValidFirstname = contributor.firstName && contributor.firstName.trim();
    const isValidLastname = contributor.lastName && contributor.lastName.trim();
    setEmailValid(isValidEmail);
    setFirstnameValid(isValidFirstname);
    setLastnameValid(isValidLastname);

    return isValidEmail && isValidFirstname && isValidLastname;
  }

  const resetContributor = () => {
    setEditingContributor(null);
    setNewContributor({
      firstName: "",
      lastName: "",
      emailAddress: "",
      institution: "",
      role: [],
    });
    setEmailValid(true);
    setFirstnameValid(true);
    setLastnameValid(true);
    toggle();
  }

  const handleAddContributor = () => {
    if (!validateContributor(newContributor)) {
      return;
    }
    const contributorsList = [...contributors, newContributor];
    setContributors(contributorsList);
    resetContributor();
    form.setFieldValue(field_id, contributorsList);
  };

  const handleEditContributor = (contributor) => {
    if (editingContributor != contributor || !opened) {
      if (!opened) {
        toggle();
      }
      setEditingContributor(contributor);
      setNewContributor(contributor);
      setEmailValid(true);
    }
    else {
      resetContributor();
    }
  };

  const handleSaveContributor = () => {
    if (!validateContributor(contributor)) {
      return;
    }
    const contributorsList = contributors.map((contributor) =>
      contributor.emailAddress === editingContributor.emailAddress
        ? newContributor
        : contributor
    );
    setContributors(contributorsList);
    resetContributor();
    form.setFieldValue(field_id, contributorsList);
  };

  const handleDeleteContributor = (contributor) => {
    const contributorsList = contributors.filter(
      (c) => c.emailAddress !== contributor.emailAddress
    );
    setContributors(contributorsList);
    resetContributor();
    form.setFieldValue(field_id, contributorsList);
  };

  return (
    <>
      <div className="contributors">
        <Input.Label>{title}</Input.Label>
        <Input.Description>{description}</Input.Description>
        <Grid gutter="xs">
          <Grid.Col span={{ base: 12, md: 4, lg: 3 }}>
            <Card shadow="xs" padding="sm" className="h-100">
              {
                contributors.length === 0 && (
                  <Group justify="center" align="top" className="h-100">
                    <h4 className="mb-0">Contributors List</h4>
                  </Group>
                )
              }
              <DragDropContext
                className="h-100"
                onDragEnd={({ destination, source }) => {
                  if (!destination) {
                    return;
                  }
                  let contributors_reordered = [...contributors];
                  let from = source.index;
                  let dragged = contributors_reordered.splice(from, 1);
                  contributors_reordered.splice(
                    destination?.index || 0,
                    0,
                    ...dragged
                  );
                  setContributors(contributors_reordered);
                }}
              >
                <Droppable
                  droppableId="dnd-list"
                  direction="vertical"
                  className="h-100"
                >
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="h-100"
                    >
                      {contributors.map((contributor, index) => (
                        <Draggable
                          key={contributor.emailAddress}
                          index={index}
                          draggableId={contributor.emailAddress}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className="d-flex contributor px-2 py-1"
                            >
                              <div {...provided.dragHandleProps}>
                                <i className="fa fa-bars pe-2"></i>
                              </div>
                              <div
                                key={contributor.emailAddress}
                                onClick={() =>
                                  handleEditContributor(contributor)
                                }
                                className="name"
                              >
                                <div>
                                  {index + 1}. {contributor.firstName}{" "}
                                  {contributor.lastName}
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
              <List
                display={"none"}
                spacing="sm"
                icon={
                  <ThemeIcon color="blue" variant="filled">
                    <i className="fa fa-user-circle-o"></i>
                  </ThemeIcon>
                }
              >
                {contributors.map((contributor) => (
                  <List.Item
                    key={contributor.emailAddress}
                    onClick={() => handleEditContributor(contributor)}
                    style={{ cursor: "pointer" }}
                  >
                    {contributor.firstName} {contributor.lastName}
                  </List.Item>
                ))}
              </List>
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 8, lg: 9 }}>
            <Card shadow="xs" padding="lg" className="pt-3">
              <Collapse in={!opened}>
                <Group justify="center" align="center" onClick={toggle} className="active-text-blue h-100 flex-grow-1">
                  <i className="fa fa-plus pe-2"></i> Add Contributor
                </Group>
              </Collapse>
              <Collapse in={opened}>
                <h4>
                  {editingContributor ? "Edit Contributor" : "Add Contributor"}
                </h4>
                <Grid gutter={"sm"} style={{ marginBottom: "1rem" }}>
                  <Grid.Col span={{ base: 12, xs: 3 }}>
                    <span className="label">First Name</span>
                    <TextInput
                      name="firstName"
                      value={newContributor.firstName}
                      onFocus={() => setFirstnameValid(true)}
                      onChange={handleInputChange}
                      className={(firstnameValid ? '' : 'invalid')}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, xs: 3 }}>
                    <span className="label">Last Name</span>
                    <TextInput
                      name="lastName"
                      value={newContributor.lastName}
                      onFocus={() => setLastnameValid(true)}
                      onChange={handleInputChange}
                      className={(lastnameValid ? '' : 'invalid')}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, xs: 6 }}>
                    <span className="label">Email Address</span>
                    <TextInput
                      name="emailAddress"
                      autoComplete="email"
                      value={newContributor.emailAddress}
                      onFocus={() => setEmailValid(true)}
                      onChange={handleInputChange}
                      placeholder="name@example.org"
                      className={(emailValid ? '' : 'invalid')}
                    />
                  </Grid.Col>
                  <Grid.Col span={12}>
                    <span className="label">Institution (optional)</span>
                    <TextInput
                      name="institution"
                      value={newContributor.institution}
                      onChange={handleInputChange}
                    />
                  </Grid.Col>
                  <Grid.Col span={12}>
                    <span className="label">
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
                <Grid className="mt-5">
                  <Grid.Col span={{ base: 12, md: 3, xl: 2 }}>
                    <Button
                      fullWidth
                      className="btn-blue-outline small-button"
                      onClick={() => {
                        resetContributor();
                      }}
                    >
                      Cancel
                    </Button>
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, md: 3, xl: 2 }}>
                    {
                      editingContributor &&
                      <Button
                        fullWidth
                        className="btn-red-outline small-button"
                        onClick={() =>
                          handleDeleteContributor(editingContributor)
                        }
                      >
                        Remove
                      </Button>
                    }
                  </Grid.Col>
                  <Grid.Col
                    span={{ base: 0, md: 2, xl: 4 }}
                    className="d-none d-lg-block"
                  ></Grid.Col>
                  <Grid.Col span={{ base: 12, md: 4 }}>
                    {
                      editingContributor ? (
                        <Button
                          fullWidth
                          onClick={handleSaveContributor}
                          className="btn-blue small-button"
                        >
                          Save
                        </Button>
                      ) :
                      (
                        <Button
                          fullWidth
                          onClick={handleAddContributor}
                          className="btn-blue small-button"
                        >
                          Add Contributor
                        </Button>
                      )
                    }
                  </Grid.Col>
                </Grid>
              </Collapse>
            </Card>
          </Grid.Col>
        </Grid>
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
