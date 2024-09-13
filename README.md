# Privacy Fitness Server

This repository contains the server-side code for the Privacy Fitness project. The system consists of two main components: an API server that receives and records data from the Android Wear app, and a dashboard server that provides a user interface for viewing personal data.

## System Components

1. **API Server**: A Node.js server that receives data from the Android Wear app and records it in the database.
2. **Dashboard Server**: A separate server that hosts the user interface for displaying personal data.
3. **Database**: (Presumably MongoDB) for storing received data.

## Project Structure

```
privacy-fitness-server/
├── docker-compose.yml
├── api-server/
│   ├── server.js
│   ├── package.json
│   └── Dockerfile
├── dashboard-server/
│   ├── server.js
│   ├── package.json
│   ├── Dockerfile
│   └── views/
│       ├── index.ejs
│       ├── dashboard.js
│       ├── dashboard.ejs
│       └── error.ejs
└── shared/
    └── models.js
```

## System Requirements

* Docker
* Docker Compose
* Git

## Installation

To install and start the Privacy Fitness server, follow these steps:

1. Clone the repository:

```
git clone https://github.com/adri6412/privacy-fitness-server.git
cd privacy-fitness-server
```

2. Start the services using Docker Compose:

```
docker-compose up --build -d
```

This command will build and start all necessary services (API server, Dashboard server, and Database).

## Configuration

The configuration of services can be modified in the `docker-compose.yml` file. Here you can adjust ports, environment variables, and other settings for each service.

## Usage

Once the services are started:

* The API server will be accessible at `http://localhost:<api_port>`
* The user Dashboard will be accessible at `http://localhost:<dashboard_port>`

Replace `<api_port>` and `<dashboard_port>` with the actual ports configured in `docker-compose.yml`.

## Development

To work on the code:

1. Modify the necessary files in api-server/ or dashboard-server/
2. Rebuild and restart the services: `docker-compose up --build`

Main files:

* `api-server/server.js`: Contains the main logic of the API server for receiving and recording data.
* `dashboard-server/server.js`: Manages the server logic for the user dashboard.
* `dashboard-server/views/`: Contains EJS and JS files for the dashboard user interface.
* `shared/models.js`: Defines shared data models used in the project.

### API Server

The API server is responsible for:

* Receiving data sent from the Android Wear app
* Validating and processing received data
* Recording data in the database

### Dashboard Server

The Dashboard server is responsible for:

* Providing a web user interface for viewing personal data
* Retrieving data from the database and presenting it in an understandable way
* Managing user authentication and authorization (if implemented)

## Contributing

We are open to contributions!

## License

This project is released under the GNU General Public License v2.0 (GPL-2.0). The GPL-2.0 is a copyleft license that grants users the freedom to use, study, share (copy), and modify the software. If you distribute modified versions of the software, you must make the source code available under the same GPL-2.0 license. For full details, please refer to the LICENSE file included in this repository or visit: https://www.gnu.org/licenses/old-licenses/gpl-2.0.html
