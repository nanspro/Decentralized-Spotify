# Audius Tooling

A collection of audius developer tools that interface the audius protocol. 

## Tools

### e2e-tests

The end-to-end tests include a set of scripts to standup/teardown the audius services
and test the services to validate that they follow the protocol. 

### deploy-scripts

The deploy scripts are helpers to deploy new versions of audius-protocol. Some helpers include bumping version.json, cutting tags and releases on github and getting the changelog between two versions

### setup-scripts

The setup scripts are a way to bring up and tear down a copy of audius locally

### aud-cli

The audius cli is a command line tool used to seed the audius services. 


## Notes  

Some audius npm packages are currently private, so you will need contact a 
developer at audius to get the `.npmrc` and add it to each project. 