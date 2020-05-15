import React from 'react';
import PropTypes from 'prop-types';

export const licenseDetailData = {
  CC010: {
    name: 'CC0 1.0',
    shortDescription: 'Others can copy, modify, distribute and perform the ' +
      'work, even for commercial purposes, all without asking permission.',
    link: 'https://creativecommons.org/publicdomain/zero/1.0/deed.en',
  },
  CCBY40: {
    name: 'CC BY 4.0',
    shortDescription: 'This license lets others distribute, remix, tweak, ' +
      'and build upon your work, even commercially, as long as they credit ' +
      'you for the original creation. ',
    link: 'https://creativecommons.org/licenses/by/4.0/deed.en',
  },
  CCBYNC40: {
    name: 'CC BY-NC 4.0',
    shortDescription: 'This license lets others remix, tweak, and build ' +
      'upon your work non-commercially, and although their new works must ' +
      'also acknowledge you and be non-commercial, they don’t have to ' +
      'license their derivative works on the same terms.',
    link: 'https://creativecommons.org/licenses/by-nc/4.0/deed.en',
  },
  CCBYNCND40: {
    name: 'CC BY-NC-ND 4.0',
    shortDescription: 'This license lets others reuse the work for any ' +
      'purpose, including commercially; however, it cannot be shared with ' +
      'others in adapted form, and credit must be provided to you.',
    link: 'https://creativecommons.org/licenses/by-nc-nd/4.0/deed.en',
  },
  CCBYNCSA40: {
    name: 'CC BY-NC-SA 4.0',
    shortDescription: 'This license lets others remix, tweak, and build ' +
      'upon your work non-commercially, as long as they credit you and ' +
      'license their new creations under the identical terms.',
    link: 'https://creativecommons.org/licenses/by-nc-sa/4.0/deed.en',
  },
  CCBYND40: {
    name: 'CC BY-ND 4.0',
    shortDescription: 'This license is the most restrictive of the main ' +
      'creative commons ' +
      'licenses, only allowing others to download your works and share them' +
      'with others as long as they credit you, but they can’t change them ' +
      'in any way or use them commercially.',
    link: 'https://creativecommons.org/licenses/by-nd/4.0/deed.en',
  },
  CCBYSA40: {
    name: 'CC BY-SA 4.0',
    shortDescription: 'This license lets others remix, tweak, and build upon ' +
      'your work even for commercial purposes, as long as they credit you and ' +
      'license their new creations under the identical terms.',
    link: 'https://creativecommons.org/licenses/by-sa/4.0/deed.en',
  },
  OtherLicense: {
    name: 'Other License',
    shortDescription: '',
    link: '',
  },
};

class LicenseModals extends React.PureComponent {

  render() {
    const licenseModals = Object.keys(licenseDetailData).map(licenseKey => (
      <div className="modal fade" key={licenseKey} id={licenseKey} tabIndex="-1"
           role="dialog" aria-labelledby="exampleModalCenterTitle"
           aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered modal-lg"
             role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h4 className="modal-title" id="exampleModalCenterTitle">
                {licenseDetailData[licenseKey].name + ' Description'}
              </h4>
              <button type="button" className="close" data-dismiss="modal"
                      aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body">
              <h5>What does this mean ?</h5>
              <p>
                {licenseDetailData[licenseKey].shortDescription}
              </p>
            </div>
            <div className="modal-footer">

              <a
                className="btn btn-secondary btn-sm btn-block btn-light-blue-inverted"
                href={licenseDetailData[licenseKey].link}
                target="_blank"
              >Read More

              </a>

              <a
                className="btn btn-secondary btn-sm btn-block btn-light-blue-inverted mt-0"
                data-dismiss="modal"
                onClick={() => this.props.onClickLicense(
                  licenseDetailData[licenseKey].name)}
              >Choose this License
              </a>

            </div>
          </div>
        </div>
      </div>
    ));
    return licenseModals;
  }

}

LicenseModals.propTypes = {
  onClickLicense: PropTypes.func,
};

export default LicenseModals;
