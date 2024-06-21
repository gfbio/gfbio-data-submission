import { HoverCard } from "@mantine/core";
import React from "react";

const MetadataTemplate = () => {
  const templates = [
    {
      id: "molecular_template",
      name: "Molecular Data Template:",
      template_link:
        "https://gitlab-pe.gwdg.de/gfbio/molecular-submission-templates/-/blob/master/full_template.csv?ref_type=heads",
      description_link:
        "https://gitlab-pe.gwdg.de/gfbio/molecular-submission-templates/-/blob/master/Template-Description.md",
    },
    {
      id: "biodiversity_template",
      name: "Biodiversity, Ecological and Collection Data Template:",
      template_link:
        "https://species-id.net/o/media/1/1d/GFBio_data_submission_template.zip",
      description_link:
        "https://gfbio.biowikifarm.net/wiki/Data_submission_templates_for_biodiversity,_ecological_and_collection_data",
    },
  ];

  return (
    <div>
      <h4>
        Metadata Templates{" "}
        <HoverCard width={320} shadow="md" position="right" withArrow>
          <HoverCard.Target>
            <i className="fa fa-question-circle-o" aria-hidden="true"></i>
          </HoverCard.Target>
          <HoverCard.Dropdown>
            <p>
              Metadata templates are provided to help you structure your data
              submission. Using a metadata template is optional, but highly
              recommended. You can modify the existing templates to your needs.
            </p>
          </HoverCard.Dropdown>
        </HoverCard>
      </h4>
      <ul className="list-group list-group-flush">
        {templates.map((template) => (
          <li key={template.id} className="list-group-item">
            {template.name}
            <br />
            <a href={template.template_link} target="_blank">
              <i className="fa fa-download" aria-hidden="true"></i> CSV Template
            </a>
            <br />
            <a href={template.description_link} target="_blank">
              <i className="fa fa-book" aria-hidden="true"></i> Template
              Description
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MetadataTemplate;