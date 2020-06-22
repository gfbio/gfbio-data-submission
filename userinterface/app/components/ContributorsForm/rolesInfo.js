import React from 'react';
import { licenseDetailData } from '../LicenseSelectionForm/licenseDetailsData';

export const info = [
  {
    name: 'Author/Creator',
    description:
      'Main researcher involved in producing the dataset or data package of a project, or the author of the (data) publication (may be a corporate/institutional or personal name).',
  },
  {
    name: 'Content Contact',
    description:
      'Person with knowledge of how to access, troubleshoot, or otherwise field issues related to the content of the dataset or data package in a project.',
  },
  {
    name: 'Data Curator',
    description:
      'Person tasked with curating, reviewing, enhancing, cleaning, or standardizing the content of a dataset or data package managed in a project or submitted for storage, use, and maintenance within a data repository.',
  },
  {
    name: 'Data Editor/Data Manager',
    description:
      'Person (or organisation with a staff of data managers) responsible for maintaining the finished dataset or data package.',
  },
  {
    name: 'Data Owner',
    description:
      'Person or institution owning or managing property rights, including intellectual property rights over the dataset or data package of a project.',
  },
  {
    name: 'Data Owner Contact',
    description:
      'Representative for person or institution owning or managing property rights, including intellectual property rights over the dataset or data package of a project.',
  },
  {
    name: 'Principal Investigator',
    description:
      'Person leading an investigation, research study or research group.',
  },
  {
    name: 'Researcher',
    description:
      'Person involved in analyzing data or the results of an experiment or formal study. May indicate an intern or assistant to one of the authors who helped with research but who was not so “key” as to be listed as an author.',
  },
  {
    name: 'Data Source Organisation',
    description:
      'Organisation with license rights over the datasets or data packages of a project (might be identical with the data.',
  },
];

// eslint-disable-next-line react/prefer-stateless-function
class RolesInfo extends React.PureComponent {
  render() {
    const rolesInfo = info.map(role => (
      <div className="row border-bottom roles-padding">
        <div className="col-md-3 flex-center font-weight-bold padding-0">
          {role.name}
        </div>
        <div className="col-md-9 padding-15">{role.description}</div>
      </div>
    ));
    return (
      <div
        className="modal fade"
        id="rolesInfo"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="exampleModalCenterTitle"
        aria-hidden="true"
      >
        <div
          className="modal-dialog modal-dialog-scrollable modal-dialog-centered modal-lg h80"
          role="document"
        >
          <div className="modal-content h80">
            <div className="modal-header">
              <h4 className="modal-title" id="exampleModalCenterTitle">
                {`Roles Description`}
              </h4>
              <button
                type="button"
                className="close"
                data-dismiss="modal"
                aria-label="Close"
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body">{rolesInfo}</div>
            {/* <div className="modal-footer"> */}
            {/*  <a */}
            {/*    className="btn btn-secondary btn-sm btn-block btn-light-blue-inverted mt-0 modal-close-btn" */}
            {/*    data-dismiss="modal" */}
            {/*  > */}
            {/*    Close */}
            {/*  </a> */}
            {/* </div> */}
          </div>
        </div>
      </div>
    );
  }
}

export default RolesInfo;
