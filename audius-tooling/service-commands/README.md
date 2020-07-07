# Service Commands

Service Commands presents a high level API for interacting with local Audius Services.
This API allows you to bring services up and down, as well as perform actions against individual services (e.g. creating a user, uploading a track). This interface is not particularly stable yet.

## Cheat Sheet
### Bringing up services locally
In the __near__ future, we will present a nice CLI for bringing up & down service in `setup-scripts`. For the time being, 
we may use some of the scripts in service-commands to accomplish this goal. Pardon our mess!

**Before you begin:**
- Install tools: `docker`, `docker-compose`, `node`. 
- Clone the [audius-protocol](https://github.com/AudiusProject/audius-protocol) repo.
- In `audius-protocol`, check out the branch `piazz-ec2-setup`. This has the latest code that allows running on linux.
- Link libs. 
  - In `<audius-protocol>/libs`, run `npm link`.
  - In `<audius-tooling>/service-commands`, run `npm link @audius/libs`.
- Set the environement variable `PROTOCOL_DIR` to point to the cloned `protocol` repo.
- Run the `<service-commands>/scripts/hosts.js` script with `node hosts.js add`. This script will add mappings to your `/etc/hosts` file.

**Bringing up all services:**
- In `<service-commands>/scripts/`, run `node setup.js up` to bring all services up.

**Tearing Down Services**
- In `<service-commands>/scripts/`, run `node setup.js down` to bring all services down.

## API
TODO

## Structure
TODO

