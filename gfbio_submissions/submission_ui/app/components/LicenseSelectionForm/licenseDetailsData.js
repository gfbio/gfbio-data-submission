import React from 'react';

export const licenseDetailData = {
  CC010: {
    name: 'CC0 1.0',
    shortDescription: 'Lorem ipsum dolor sit amet, consetetur sadipscing ' +
      'elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore ' +
      'magna aliquyam erat, sed diam voluptua. At vero eos et accusam et ' +
      'justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea ' +
      'takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor' +
      ' sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod ' +
      'tempor invidunt ut labore et dolore magna aliquyam erat, sed diam ' +
      'voluptua.',
    link: 'http://www.google.de',
  },
  CCBY40: {
    name: 'CC BY 4.0',
    shortDescription: 'Lorem ipsum dolor sit amet, consetetur sadipscing ' +
      'elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore ' +
      'magna aliquyam erat, sed diam voluptua. At vero eos et accusam et ' +
      'justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea ' +
      'takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor' +
      ' sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod ' +
      'tempor invidunt ut labore et dolore magna aliquyam erat, sed diam ' +
      'voluptua.',
    link: 'http://www.google.de',
  },
  CCBYNC40: {
    name: 'CC BY NC 4.0',
    shortDescription: 'Lorem ipsum dolor sit amet, consetetur sadipscing ' +
      'elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore ' +
      'magna aliquyam erat, sed diam voluptua. At vero eos et accusam et ' +
      'justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea ' +
      'takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor' +
      ' sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod ' +
      'tempor invidunt ut labore et dolore magna aliquyam erat, sed diam ' +
      'voluptua.',
    link: 'http://www.google.de',
  },
  CCBYNCND40: {
    name: 'CC BY-NC-ND 4.0',
    shortDescription: 'Lorem ipsum dolor sit amet, consetetur sadipscing ' +
      'elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore ' +
      'magna aliquyam erat, sed diam voluptua. At vero eos et accusam et ' +
      'justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea ' +
      'takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor' +
      ' sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod ' +
      'tempor invidunt ut labore et dolore magna aliquyam erat, sed diam ' +
      'voluptua.',
    link: 'http://www.google.de',
  },
  'CC BY-NC-SA 4.0': {
    name: 'CC0 1.0',
    shortDescription: 'Lorem ipsum dolor sit amet, consetetur sadipscing ' +
      'elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore ' +
      'magna aliquyam erat, sed diam voluptua. At vero eos et accusam et ' +
      'justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea ' +
      'takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor' +
      ' sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod ' +
      'tempor invidunt ut labore et dolore magna aliquyam erat, sed diam ' +
      'voluptua.',
    link: 'http://www.google.de',
  },
  CCBYND40: {
    name: 'CC BY-ND 4.0',
    shortDescription: 'Lorem ipsum dolor sit amet, consetetur sadipscing ' +
      'elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore ' +
      'magna aliquyam erat, sed diam voluptua. At vero eos et accusam et ' +
      'justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea ' +
      'takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor' +
      ' sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod ' +
      'tempor invidunt ut labore et dolore magna aliquyam erat, sed diam ' +
      'voluptua.',
    link: 'http://www.google.de',
  },
  CCBYSA40: {
    name: 'CC BY-SA 4.0',
    shortDescription: 'Lorem ipsum dolor sit amet, consetetur sadipscing ' +
      'elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore ' +
      'magna aliquyam erat, sed diam voluptua. At vero eos et accusam et ' +
      'justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea ' +
      'takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor' +
      ' sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod ' +
      'tempor invidunt ut labore et dolore magna aliquyam erat, sed diam ' +
      'voluptua.',
    link: 'http://www.google.de',
  },
  OtherLicense: {
    name: 'Other License',
    shortDescription: 'Lorem ipsum dolor sit amet, consetetur sadipscing ' +
      'elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore ' +
      'magna aliquyam erat, sed diam voluptua. At vero eos et accusam et ' +
      'justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea ' +
      'takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor' +
      ' sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod ' +
      'tempor invidunt ut labore et dolore magna aliquyam erat, sed diam ' +
      'voluptua.',
    link: '',
  },
};


export const licenseModals = Object.keys(licenseDetailData).map(licenseKey => (
  <div className="modal fade" id={licenseKey} tabIndex="-1"
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
            data-dismiss="modal"
            href={licenseDetailData[licenseKey].link}
          >Read More
          </a>

          <button
            className="btn btn-secondary btn-sm btn-block btn-light-blue-inverted"
            data-dismiss="modal"
          >Choose this License
          </button>

        </div>
      </div>
    </div>
  </div>
));
