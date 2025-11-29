// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";
import {PublicBadgeNetwork} from "../src/PublicBadgeNetwork.sol";

contract DeployPublicBadgeNetwork is Script {
    PublicBadgeNetwork public publicBadgeNetwork;

    function run() public {
        // Inizia il broadcast delle transazioni
        vm.startBroadcast();

        // Deploy del contratto
        publicBadgeNetwork = new PublicBadgeNetwork();

        console.log("PublicBadgeNetwork deployed at:", address(publicBadgeNetwork));

        vm.stopBroadcast();
    }
}
