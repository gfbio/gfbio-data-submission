import { Divider, Grid, Text } from "@mantine/core";

const roles = [
  {
    name: "Author/Creator",
    description:
      "Main researcher involved in producing the dataset or data package of a project, or the author of the (data) publication (may be a corporate/institutional or personal name).",
  },
  {
    name: "Content Contact",
    description:
      "Person with knowledge of how to access, troubleshoot, or otherwise field issues related to the content of the dataset or data package in a project.",
  },
  {
    name: "Data Curator",
    description:
      "Person tasked with curating, reviewing, enhancing, cleaning, or standardizing the content of a dataset or data package managed in a project or submitted for storage, use, and maintenance within a data repository.",
  },
  {
    name: "Data Editor/Data Manager",
    description:
      "Person (or organisation with a staff of data managers) responsible for maintaining the finished dataset or data package.",
  },
  {
    name: "Data Owner",
    description:
      "Person or institution owning or managing property rights, including intellectual property rights over the dataset or data package of a project.",
  },
  {
    name: "Data Owner Contact",
    description:
      "Representative for person or institution owning or managing property rights, including intellectual property rights over the dataset or data package of a project.",
  },
  {
    name: "Principal Investigator",
    description:
      "Person leading an investigation, research study or research group.",
  },
  {
    name: "Researcher",
    description:
      "Person involved in analyzing data or the results of an experiment or formal study. May indicate an intern or assistant to one of the authors who helped with research but who was not so “key” as to be listed as an author.",
  },
  {
    name: "Data Source Organisation",
    description:
      "Organisation with license rights over the datasets or data packages of a project (might be identical with the data.",
  },
];

const RolesInfo = () => {
  return (
    <>
      {roles.map((role) => (
        <div key={role.name}>
          <Grid my="10">
            <Grid.Col span={3}>
              <Text
                fw={700}
                style={{
                  display: "flex",
                  alignItems: "center",
                  height: "100%",
                }}
              >
                {role.name}
              </Text>
            </Grid.Col>
            <Grid.Col span={9}>
              <Text>{role.description}</Text>
            </Grid.Col>
          </Grid>
          <Divider />
        </div>
      ))}
    </>
  );
};

export default RolesInfo;
