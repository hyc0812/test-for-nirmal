// SPDX-License-Identifier: MIT
const Dashboard = artifacts.require("Dashboard");

module.exports = function (deployer) {
  deployer.deploy(Dashboard);
};