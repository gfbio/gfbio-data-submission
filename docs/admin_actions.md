# Admin actions

## Submission Admin 

### 'Continue submission of selected Items'

- task/chain: YES

- Transfers submission-data to ENA, by sending XML files in a request to the 
ENA server. On success adds an accession number. Writes TaskProgressReports for
every sub-task of this admin action.


### 'Release Study on ENA'

- task/chain: NO

- Prepares a dedicated submission.xml, containing a submissions primary 
accession number (if available) and sends the submission.xml to the ENA server,
thus releasing the study targeted by the primary accession number. Writes a
RequestLog.

### 'Create BrokerObjects & XML'

- task/chain: YES

- Creates BrokerObjects based on the data-field of a selected submission.
Then creates XML files using these BrokerObjects and stores the file-content
in AuditableTextData entries.

### 'Re-Create XML (ENA)'

- task/chain: YES
- Deletes all AuditableTextData related to the selected submission and
creates new AuditableTextData entries, containing XML created from the
submissons BrokerObjects

### '(!) Delete BrokerObjects & XML'

- task/chain: NO
- Deletes all BrokerObjects related to a submission, as long as no valid
PersistentIdentifier (e.g. Primary Accession) is related to one of the BrokerObjects


### 'Download XMLs'

- task/chain: NO
- This assembles a compressed archive containing all AuditableTextData that is
related to the selected submission and offers a file download once done. 


##  SubmissionUpload Admin

###  'Re-parse csv metadata to get updated XMLs'

- task/chain: YES

- Strips  all molecular content from the related submissions data field, 
then parses the file attached to the selected SubmissionUpload for molecular
content and uses it to update the data of the submission. New BrokerObjects are 
created and are used to update existing AuditableTextData instances with 
freshly created XML content