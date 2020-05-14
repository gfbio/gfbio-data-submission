/**
 *
 * ContributorsForm
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { createStructuredSelector } from 'reselect';
import { connect } from 'react-redux';
import { compose } from 'redux';
import Button from 'react-bootstrap/Button';
import Collapse from 'react-bootstrap/Collapse';
import { Multiselect } from 'multiselect-react-dropdown';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { makeSelectContributors } from '../../containers/SubmissionForm/selectors';
import RolesInfo from './rolesInfo';
import {
  setContributors,
  setFormChanged,
} from '../../containers/SubmissionForm/actions';

/* eslint-disable react/prefer-stateless-function */
class ContributorsForm extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      formValues: {},
      formOpen: false, // show contributor form
      showAddDiv: true, // show add btn, delay for formOpen animation
      contributorIndex: -1,
      roles: [],
      contributors: [],
      contributorsArray: [],
      originalContributors: [],
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleInputClick = this.handleInputClick.bind(this);
    this.onDragEnd = this.onDragEnd.bind(this);
    this.roleOptions = [
      { role: 'Author/Creator', id: 0, category: 'Main Roles' },
      { role: 'Content Contact', id: 1, category: 'Main Roles' },
      { role: 'Principal Investigator', id: 2, category: 'Main Roles' },
      { role: 'Data Owner', id: 3, category: 'Additional Roles' },
      { role: 'Data Curator', id: 4, category: 'Additional Roles' },
      { role: 'Data Editor/Data Manager', id: 5, category: 'Additional Roles' },
      { role: 'Data Owner Contact', id: 6, category: 'Additional Roles' },
      { role: 'Researcher', id: 7, category: 'Additional Roles' },
      { role: 'Data Source Organisation', id: 8, category: 'Additional Roles' },
    ];
  }

  getContributorsAsArray(contributorsArray) {
    // make a deep copy
    const tempArray = Array.from(contributorsArray, x => Object.assign({}, x));
    // sort array
    tempArray.sort((current, next) => current.position - next.position);
    // fix missing positions if there are any
    tempArray.forEach((c, i) => {
      if (!c.position && c.position !== 0) {
        if (i === 0) {
          c.position = 1;
        } else {
          c.position = tempArray[i - 1].position + 1;
        }
      }
    });
    return tempArray;
  }

  componentDidUpdate() {
    let propsContributors = this.props.contributors;
    if (!Array.isArray(this.props.contributors)) {
      propsContributors = this.props.contributors.toJS();
    }
    if (
      JSON.stringify(this.state.contributors) !==
      JSON.stringify(propsContributors)
    ) {
      if (propsContributors.length === 0) {
        this.cleanEditForm();
        this.setState({
          formValues: {},
          formOpen: false, // show contributor form
          showAddDiv: true, // show add btn, delay for formOpen animation
          contributorIndex: -1,
          roles: [],
          contributors: [],
          contributorsArray: [],
        });
        return;
      }
      const contributorsArray = this.getContributorsAsArray(propsContributors);
      if (this.state.originalContributors.length === 0) {
        this.setState({
          contributors: propsContributors,
          originalContributors: propsContributors,
          contributorsArray,
          formValues: {},
        });
      } else {
        this.setState({
          contributors: propsContributors,
          contributorsArray,
          formValues: {},
        });
      }
    }
  }

  validateFormValues() {
    let isValid = true;
    if (!this.state.formValues.firstName) {
      isValid = false;
      document.getElementById('firstName').classList.add('error');
    }
    if (!this.state.formValues.lastName) {
      isValid = false;
      document.getElementById('lastName').classList.add('error');
    }
    if (!this.state.formValues.emailAddress) {
      isValid = false;
      document.getElementById('emailAddress').classList.add('error');
    }
    return isValid;
  }

  handleChange(event) {
    const values = this.state.formValues;
    document.getElementById(event.target.id).classList.remove('error');
    values[event.target.id] = event.target.value;
    this.setState({ formValues: { ...values } });
  }

  handleInputClick(event) {
    document.getElementById(event.target.id).classList.remove('error');
  }

  preventSubmit(event) {
    if (event.keyCode === 13) {
      event.preventDefault();
      return false;
    }
    return true;
  }

  cleanEditForm = () => {
    document.getElementById('firstName').value = '';
    document.getElementById('lastName').value = '';
    document.getElementById('emailAddress').value = '';
    document.getElementById('institution').value = '';
    document.getElementById('firstName').classList.remove('error');
    document.getElementById('lastName').classList.remove('error');
    document.getElementById('emailAddress').classList.remove('error');
  };

  onSave = () => {
    if (this.validateFormValues()) {
      const contributorsArray = [...this.state.contributorsArray];
      if (
        this.state.contributorIndex !== -1 &&
        contributorsArray.length !== 0
      ) {
        contributorsArray.splice(
          this.state.contributorIndex,
          1,
          this.state.formValues,
        );
      } else {
        this.state.formValues.position = contributorsArray.length + 1;
        contributorsArray.push(this.state.formValues);
      }
      this.closeFormBody();
      this.setState(
        {
          contributorsArray,
        },
        this.setFormChanged,
      );
    }
  };

  setFormChanged = () => {
    const contributorsArray = [...this.state.contributorsArray];
    const originalContributorsArray = [...this.state.originalContributors];
    if (
      JSON.stringify(originalContributorsArray) !==
      JSON.stringify(contributorsArray)
    ) {
      this.props.setFormChanged(true);
    } else {
      this.props.setFormChanged(false);
    }
    this.props.setContributors(contributorsArray);
  };

  // toggles add form, closes detail
  onClickAddButton = showAddDiv => {
    this.setState({
      formOpen: !showAddDiv,
      showAddDiv,
    });
  };

  // explicit close add form
  closeFormBody = () => {
    this.cleanEditForm();
    this.showAddContributorDiv();
    this.setState({
      formOpen: false,
      formValues: {},
      roles: [],
      contributorIndex: -1,
    });
  };

  onClickRemove = () => {
    // fix positions
    let positionCounter = 1;
    const originalArray = [...this.state.contributorsArray];
    const contributorsArray = originalArray.map((e, i) => {
      if (i !== this.state.contributorIndex) {
        e.position = positionCounter;
        positionCounter += 1;
      }
      return e;
    });
    contributorsArray.splice(this.state.contributorIndex, 1);
    this.setState(
      {
        contributorsArray,
      },
      this.setFormChanged,
    );
    this.showAddContributorDiv();
    this.closeFormBody();
  };

  // delay to wait for formOpen animation to finish
  showAddContributorDiv = () =>
    setTimeout(() => {
      this.setState({
        showAddDiv: true,
      });
    }, 400);

  rolesToCSV(selectedList) {
    // roles to string
    let rolesCSV = '';
    selectedList.forEach(role => {
      rolesCSV += `${role.role},`;
    });
    rolesCSV = rolesCSV.slice(0, -1); // remove last comma
    return rolesCSV;
  }

  rolesToArray(csv) {
    if (!csv || csv.length === 0) {
      return [];
    }
    const rolesArray = csv.split(',');
    const selectedList = [];
    rolesArray.forEach(role => {
      this.roleOptions.forEach(option => {
        if (option.role === role) {
          selectedList.push(option);
        }
      });
    });
    return selectedList;
  }

  // toogles Detail, closes form
  onClickDetailButton = (index = -1) => {
    if (index >= 0) {
      // close form if user clicked on the same contributor
      if (this.state.contributorIndex === index) {
        this.closeFormBody();
        return;
      }
      const rolesArr = this.rolesToArray(
        this.state.contributorsArray[index].contribution,
      );
      this.setState({
        formValues: { ...this.state.contributorsArray[index] },
        detailOpen: true,
        formOpen: true,
        showAddDiv: false,
        contributorIndex: index,
        roles: rolesArr,
      });
    }
  };

  scrollContributorsToTop() {
    const contributorsDiv = document.getElementsByClassName(
      'optionContainer',
    )[0];
    contributorsDiv.scrollTop = 0;
  }

  // on role select or remove
  onSelectChange = selectedList => {
    this.scrollContributorsToTop();
    const values = this.state.formValues;
    values.contribution = this.rolesToCSV(selectedList);
    this.setState({
      roles: selectedList,
      formValues: values,
    });
  };

  // reorder list after drag ended
  reorder = (list, startIndex, endIndex) => {
    let result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    // fix positions
    let position = 1;
    result = result.map(e => {
      e.position = position;
      position += 1;
      return e;
    });
    return result;
  };

  onDragEnd(result) {
    // dropped outside the list
    if (!result.destination) {
      return;
    }
    const contributorsArray = this.reorder(
      this.state.contributorsArray,
      result.source.index,
      result.destination.index,
    );
    const contributorIndex =
      this.state.contributorIndex === -1 ? -1 : result.destination.index;
    this.setState(
      {
        contributorsArray,
        contributorIndex,
      },
      this.setFormChanged,
    );
  }

  render() {
    const { formOpen, detailOpen } = this.state;
    const addContributorDiv = (
      <div className="add-contributor-div">
        <Button
          className="btn btn-primary btn-contributor"
          onClick={() => this.onClickAddButton(!this.state.showAddDiv)}
          aria-controls="contributorForm"
          aria-expanded={formOpen}
        >
          <i className="fa fa-plus" /> add contributor
        </Button>
      </div>
    );
    const removeContributorBtn =
      this.state.contributorIndex === -1 ? null : (
        <div className="form-group col-md-2">
          <Button
            className="btn btn-secondary btn-sm btn-block btn-red-inverted"
            onClick={() => this.onClickRemove()}
            aria-controls="contributorEditForm"
            aria-expanded={detailOpen}
          >
            Remove
          </Button>
        </div>
      );

    const spaceBetweenButtons =
      this.state.contributorIndex === -1 ? (
        <div className="form-group col-md-6" />
      ) : (
        <div className="form-group col-md-4" />
      );

    const contributors = this.state.contributorsArray.map((c, index) => (
      <Draggable
        key={`drag-key-${c.position}`}
        draggableId={`contributor-dragId-${c.position}`}
        index={index}
        className="no-outline"
      >
        {provided => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
          >
            <div className="row">
              <div className="col">
                <i className="fa fa-bars drag-bars" />
                <Button
                  className="btn btn-primary btn-contributor contributor-draggable-btn"
                  onClick={() => this.onClickDetailButton(index)}
                  aria-controls="contributorForm"
                  aria-expanded={detailOpen}
                >
                  {`${c.position}. ${c.firstName} ${c.lastName}`}
                </Button>
              </div>
            </div>
          </div>
        )}
      </Draggable>
    ));

    const noContributorsText = (
      <div className="text-center">Contributors List</div>
    );

    // TODO: https://react-bootstrap.netlify.com/
    return (
      <div>
        <RolesInfo />
        <header className="header header-left form-header-top mb-3">
          <h2 className="section-title">Contributors</h2>
          <p className="section-subtitle">(optional)</p>
        </header>
        <div className="form-group">
          <div className="row">
            <div className="col-md-3">
              <DragDropContext onDragEnd={this.onDragEnd}>
                <div className="droppable-contributors">
                  <Droppable droppableId="droppable">
                    {provided => (
                      <div {...provided.droppableProps} ref={provided.innerRef}>
                        {contributors.length === 0
                          ? noContributorsText
                          : contributors}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              </DragDropContext>
            </div>
            <div className="col-md-9 add-contributor-col">
              {this.state.showAddDiv ? addContributorDiv : null}
              <Collapse in={this.state.formOpen}>
                <div className="card card-body">
                  <h5>
                    {this.state.contributorIndex === -1
                      ? 'Add Contributor'
                      : 'Edit Contributor'}
                  </h5>
                  <div className="form-row">
                    <div className="form-group col-md-3">
                      <label htmlFor="firstName">First Name</label>
                      <input
                        type="text"
                        className="form-control"
                        id="firstName"
                        onKeyDown={this.preventSubmit}
                        onChange={this.handleChange}
                        onClick={this.handleInputClick}
                        value={this.state.formValues.firstName}
                      />
                    </div>
                    <div className="form-group col-md-3">
                      <label htmlFor="lastName">Last Name</label>
                      <input
                        type="text"
                        className="form-control"
                        id="lastName"
                        onKeyDown={this.preventSubmit}
                        onChange={this.handleChange}
                        onClick={this.handleInputClick}
                        value={this.state.formValues.lastName}
                      />
                    </div>
                    <div className="form-group col-md-6">
                      <label htmlFor="emailAddress">Email Address</label>
                      <input
                        type="email"
                        className="form-control"
                        id="emailAddress"
                        onKeyDown={this.preventSubmit}
                        placeholder="name@example.com"
                        // defaultValue={emailAddress}
                        onChange={this.handleChange}
                        onClick={this.handleInputClick}
                        value={this.state.formValues.emailAddress}
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group col-md-12">
                      <label htmlFor="institution">
                        Institution (optional)
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="institution"
                        onKeyDown={this.preventSubmit}
                        onChange={this.handleChange}
                        value={this.state.formValues.institution}
                      />
                    </div>
                    <div className="form-group col-md-12">
                      <label htmlFor="contribution">
                        Contributor Role (optional)
                        <a
                          className="align-bottom"
                          data-toggle="modal"
                          data-target="#rolesInfo"
                        >
                          <i
                            className="icon ion-ios-help-circle-outline question-pointer"
                            aria-hidden="true"
                          />
                        </a>
                      </label>
                      <Multiselect
                        placeholder="Select Roles"
                        options={this.roleOptions} // Options to display in the dropdown
                        selectedValues={this.state.roles} // Preselected value to persist in dropdown
                        onSelect={this.onSelectChange} // Function will trigger on select event
                        onRemove={this.onSelectChange} // Function will trigger on remove event
                        displayValue="role" // Property name to display in the dropdown options
                        groupBy="category"
                        // closeOnSelect={false}
                        closeIcon="circle"
                        showCheckbox
                        avoidHighlightFirstOption
                      />
                    </div>
                  </div>
                  <div className="row mt-3" />
                  <div className="form-row">
                    <div className="form-group col-md-2">
                      <Button
                        className="btn btn-secondary btn-sm btn-block btn-light-blue-inverted"
                        onClick={() => this.closeFormBody()}
                        aria-controls="contributorForm"
                        aria-expanded={formOpen}
                      >
                        Cancel
                      </Button>
                    </div>
                    {removeContributorBtn}
                    {spaceBetweenButtons}
                    <div className="form-group col-md-4">
                      <Button
                        className="btn btn-secondary btn-sm btn-block btn-light-blue"
                        onClick={this.onSave}
                        aria-controls="contributorForm"
                        aria-expanded={formOpen}
                      >
                        Save
                      </Button>
                    </div>
                  </div>
                </div>
              </Collapse>
            </div>
          </div>
          {/* </Collapse> */}
        </div>
      </div>
    );
  }
}

ContributorsForm.propTypes = {
  contributors: PropTypes.array,
  setContributors: PropTypes.func,
  setFormChanged: PropTypes.func,
};

const mapStateToProps = createStructuredSelector({
  contributors: makeSelectContributors(),
});

function mapDispatchToProps(dispatch) {
  return {
    setFormChanged: changed => dispatch(setFormChanged(changed)),
    setContributors: contributors => dispatch(setContributors(contributors)),
  };
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

export default compose(withConnect)(ContributorsForm);
