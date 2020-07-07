# Audius Setup Scripts

This folder is used to run a local copy of Audius. The scripts in this folder are controlled by npm scripts located in `package.json` that run node commands on `setupLocal.js`. Scripts in `/setup-shell-scripts` are controlled by a Makefile.

**NOTE** - these scripts are written with Mac OS X, but can be adapted to run on linux. It's possible that docker.for.mac.localhost cannot be resolved on the command line, so you may need to add an entry to `/etc/hosts` and add `::1 docker.for.mac.localhost`

**NOTE** - in order to customize these scripts to your local system, update the absolute path of `PROTOCOL_DIR` location, which is the parent directory of `audius-protocol`

# How to setup services locally

The script `setupLocal.js` is used to build/run and take down services in the Audius architecture. The services you can operate on are listed in the `package.json` under `scripts`. 

To run a service, cd into `/setup-scripts` and enter an `npm` command that follows this structure:
```
npm run <service>-up
```

To take down a service, cd into `/setup-scripts` and enter an `npm` command that follows this structure:
```
npm run <service>-down
```

**NOTE** - `init-contracts-info` and `init-token-versions` do not have a `down` option. These are not containers.

For example, if you want to bring up ipfs, run the command:
```
npm run ipfs-up
```

If you want to build or tear down all the services in one command, these commands are available:
```
npm run all-up
npm run all-down
```

When you successfully run a service (in this case ipfs), you will get a success log in the console of this sort:

```
**************** ipfs started up properly! ****************
``` 

This log will appear with a nice, pretty, rainbow color!

Else, if the service could not build properly, you will get the error and a fail log like:
```
Error: ipfs failed to start
    at execShellCommands (/Users/vickyguan/Documents/Audius/audius-tooling/setup-scripts/setupLocal.js:120:11)

Check terminal logs for error stack trace.
Exiting script...
```

Upon successful build, you will be able to see how long the script took in the logs. For example, at the end of building ipfs:

```
This setup took 737ms/0.01min
```

This timing can be useful to see how long each service took to standup, and what future improvements can be made. 

# Makefile

The makefile controls running various functions. This should be the primary entry point for running scripts located in `/setup-shell-scripts`

`make init-repos` - initializes all repos in the directory indicated by the `config/conf.sh` file

`make dockerhub-build-and-tag` - builds a docker image of a provided service and pushes it to audius docker hub

`make push-to-ecr` - pushes a service image with desired tag name to Amazon Elastic Container Registry (ecr)

# Description of files

`setupLocal.js`

This file is the script that locally builds and tears down all the Audius services. Each service can be run and/or torn down individually, or together in one command. The discovery provider, creator nodes, and identity service container also have additional health check and rebuild logic if not initially built properly. Check the `package.json` for the available `npm` commands

`config/setup-config.json`

This file lists properties related to each service in the Audius architecture. Used in `config.js` to define the set up and tear down commands, and to define local endpoint attributes if they exist

`config/conf.sh`

This file provides the configuration to define which branch `audius-protocol` will be cloned from, and what its working directory is

`config.js`

This file is the wrapper class that takes loads the file `setup-config.json` and used in `setupLocal.js`

`setup-shell-scripts/dockerhub-build-and-tag.sh`

This file is the script that builds a docker image of a provided service and pushes it to audius docker hub

`setup-shell-scripts/init-repos.sh`

This initializes all repos and install any necessary dependencies necessary to run a service without actually starting the service

`setup-shell-scripts/push-to-ecr.sh`

This file is the script that pushes a service image with desired tag name to Amazon Elastic Container Registry (ecr)