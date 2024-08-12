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
  const [emailValid, setEmailValid] = useState(false);

  const [opened, { toggle }] = useDisclosure(false);
  const [rolesInfoOpened, { open, close }] = useDisclosure(false);

  useEffect(() => {
    if (prefillContributors !== "") {
      setContributors(prefillContributors);
      form.setFieldValue(field_id, prefillContributors);
      if (!opened) {
        toggle();
      }
    } else {
      setContributors([]);
      setNewContributor({
        firstName: "",
        lastName: "",
        emailAddress: "",
        institution: "",
        role: [],
      });
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
    if (name === "emailAddress") {
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
      emailAddress: "",
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
      contributor.emailAddress === editingContributor.emailAddress
        ? newContributor
        : contributor
    );
    setContributors(contributorsList);
    setEditingContributor(null);
    setNewContributor({
      firstName: "",
      lastName: "",
      emailAddress: "",
      institution: "",
      role: [],
    });
    setEmailValid(false);
    form.setFieldValue(field_id, contributorsList);
  };

  const handleDeleteContributor = (contributor) => {
    const contributorsList = contributors.filter(
      (c) => c.emailAddress !== contributor.emailAddress
    );
    setContributors(contributorsList);
    setEditingContributor(null);
    setNewContributor({
      firstName: "",
      lastName: "",
      emailAddress: "",
      institution: "",
      role: [],
    });
    setEmailValid(false);
    form.setFieldValue(field_id, contributorsList);
  };

  return (
    <>
      <div className="contributors">
        <Input.Label>{title}</Input.Label>
        <Input.Description>{description}</Input.Description>
        <Group justify="center" display={!opened ? "flex" : "none"}>
          <Button onClick={toggle} className="btn-blue-outline">
            <i className="fa fa-plus pr-2"></i> Add Contributor
          </Button>
        </Group>
        <Collapse in={opened}>
          <Grid gutter="xs">
            <Grid.Col span={{ base: 12, md: 4, lg: 3 }}>
              <Card shadow="xs" padding="sm" className="h-100">
                {contributors.length === 0 && <h4>Contributors List</h4>}
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
                                className="d-flex contributor"
                              >
                                <div {...provided.dragHandleProps}>
                                  <i class="fa fa-bars pr-2"></i>
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
                <h4>
                  {editingContributor ? "Edit Contributor" : "Add Contributor"}
                </h4>
                <Grid gutter={"sm"} style={{ marginBottom: "1rem" }}>
                  <Grid.Col span={{ base: 12, xs: 3 }}>
                    <span className="label">First Name</span>
                    <TextInput
                      name="firstName"
                      value={newContributor.firstName}
                      onChange={handleInputChange}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, xs: 3 }}>
                    <span className="label">Last Name</span>
                    <TextInput
                      name="lastName"
                      value={newContributor.lastName}
                      onChange={handleInputChange}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, xs: 6 }}>
                    <span className="label">Email Address</span>
                    <TextInput
                      name="emailAddress"
                      autoComplete="email"
                      value={newContributor.emailAddress}
                      onChange={handleInputChange}
                      placeholder="name@example.org"
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
                {editingContributor ? (
                  <Grid className="mt-5">
                    <Grid.Col span={{ base: 12, md: 3 }}>
                      <Button
                        fullWidth
                        className="btn-blue-outline small-button"
                        onClick={() => {
                          setEditingContributor(null);
                          setNewContributor({
                            firstName: "",
                            lastName: "",
                            emailAddress: "",
                            institution: "",
                            role: [],
                          });
                          setEmailValid(false);
                        }}
                      >
                        Cancel
                      </Button>
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 3 }}>
                      <Button
                        fullWidth
                        className="btn-red-outline small-button"
                        onClick={() =>
                          handleDeleteContributor(editingContributor)
                        }
                      >
                        Remove
                      </Button>
                    </Grid.Col>
                    <Grid.Col
                      span={{ base: 0, md: 2 }}
                      className="d-none d-lg-block"
                    ></Grid.Col>
                    <Grid.Col span={{ base: 12, md: 4 }}>
                      <Button
                        fullWidth
                        onClick={handleSaveContributor}
                        className="btn-blue small-button"
                        disabled={
                          !newContributor.firstName ||
                          !newContributor.lastName ||
                          !emailValid
                        }
                      >
                        Save
                      </Button>
                    </Grid.Col>
                  </Grid>
                ) : (
                  <Button
                    onClick={handleAddContributor}
                    className="btn-blue mt-5"
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
