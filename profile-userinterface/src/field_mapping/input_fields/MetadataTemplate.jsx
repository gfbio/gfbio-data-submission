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
        "https://kb.gfbio.org/download/attachments/138937170/GFBio_data_submission_template_mc1216.xlsm?version=1&modificationDate=1709796572343&api=v2",
      description_link:
        "https://kb.gfbio.org/display/KB/ABCD+consensus+elements+for+data+publication",
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
