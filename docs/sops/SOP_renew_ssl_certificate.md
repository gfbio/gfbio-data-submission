# SOP renew SSL certificate


## Prerequisites 
1. The IP of the server where the BrokerAgent is installed

## Procedure

1. Connect to the respective machine (as root)

       ssh -l root <server_ip>
     
1. Restart all services (without configuration changes)

       supervisorctl restart genomicsdataservices

1. Log out
        
        exit
