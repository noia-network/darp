"use strict";
exports.__esModule = true;
//
//  config.ts - Configure your node to connect to the pulseGroup
//
var lib_js_1 = require("../lib/lib.js");
//      Configuration parameters - agreed to by all in the pulseGroup
/*
process.on('uncaughtException', function (err) {
    console.log("CONFIG: uncaughtException trap: "+err);
});
*/
console.log(lib_js_1.ts() + "Launching config - should happen once");
//      Environment is way for environment to control the code
//if (! process.env.HOSTNAME || ! process.env.GENESIS || ! process.env.PUBLICKEY) {
if (!process.env.HOSTNAME) {
    console.log("No HOSTNAME enviropnmental variable specified ");
    process.env.HOSTNAME = require('os').hostname();
    console.log("setting HOSTNAME to " + process.env.HOSTNAME);
}
if (!process.env.GENESIS) {
    console.log("No GENESIS enviropnmental variable specified - setting DEFAULT GENESIS and PORT");
    process.env.GENESIS = "71.202.2.184";
    process.env.PORT = "65013";
}
if (!process.env.PORT) {
    console.log("No PORT enviropnmental variable specified - setting DEFAULT GENESIS PORT");
    process.env.PORT = "65013";
}
if (!process.env.VERSION) {
    console.log("No VERSION enviropnmental variable specified - setting to noVersion");
    process.env.VERSION = "noVersion";
}
if (!process.env.MYIP) {
    console.log("No MYIP enviropnmental variable specified ");
    process.env.MYIP = "noMYIP";
}
//import { generateKeyPairSync } from "crypto";
//import { getUnpackedSettings } from "http2";
//import { Z_VERSION_ERROR } from "zlib";
var http = require('http');
var pulseRedis = require('redis');
var redisClient = pulseRedis.createClient(); //creates a new client
redisClient.flushall(); //clean slate
//console.log("env="+JSON.stringify(process.env,null,2));
var GEO = process.env.HOSTNAME; //passed into docker
GEO = GEO.toUpperCase().split(".")[0].split(":")[0].split(",")[0].split("+")[0];
var PORT = process.env.PORT || "65013"; //passed into docker
var PUBLICKEY = process.env.PUBLICKEY;
if (!PUBLICKEY)
    try {
        PUBLICKEY = require('fs').readFileSync('../wireguard/publickey', 'utf8');
        PUBLICKEY = PUBLICKEY.replace(/^\n|\n$/g, '');
        console.log("pulled PUBLICKEY from publickey file: >" + PUBLICKEY + "<");
    }
    catch (err) {
        console.log("PUBLICKEY lookup failed");
        PUBLICKEY = "deadbeef00deadbeef00deadbeef0013";
    }
var WALLET = process.env.WALLET || "584e560b06717ae0d76b8067d68a2ffd34d7a390f2b2888f83bc9d15462c04b2";
//GEO=GEO.toString().split('.').split(',');
console.log("CONFIG GENESIS=" + process.env.GENESIS + " PORT=" + process.env.PORT + " HOSTNAME=" + process.env.HOSTNAME + " VERSION=" + process.env.VERSION + " MYIP=" + process.env.MYIP);
console.log("CONFIG starting with GEO=" + GEO + " publickey=" + PUBLICKEY + " PORT=" + PORT + " WALLET=" + WALLET + "");
/*
//  mint:0 is me  and  mint:1 is Genesis node
redisClient.hmset("mint:0",{
    "mint" : "0",      //set by genesis node
    "geo" : GEO,
    "group": GEO+".1",      //add all nodes to genesis group
    // wireguard configuration details
    "port" : ""+PORT,
    "ipaddr" : process.env.MYIP,   //set by genesis node on connection
    "publickey" : PUBLICKEY,
    //
    "bootTime" : ""+now(),   //So we can detect reboots
    "version" : process.env.VERSION,  //software version
    "wallet" : WALLET,
    "owl": ""   //how long it took this node's last record to reach me
 });
*/
getConfiguration(); //later this should start with just an IP of genesis node 
function getConfiguration() {
    var URL = "http://" + process.env.GENESIS + ":" + "65013/";
    URL = URL + encodeURI("nodefactory?geo=" + GEO + "&port=" + PORT + "&publickey=" + PUBLICKEY + "&version=" + process.env.VERSION + "&wallet=" + WALLET + "&myip=" + process.env.MYIP + "&ts=" + lib_js_1.now());
    console.log("****CONFIG: getConfiguration() Fetching config from URL: " + URL);
    //FETCH CONFIG
    var req = http.get(URL, function (res) {
        var data = '', json_data;
        res.on('data', function (stream) {
            data += stream;
        });
        res.on('error', function () {
            console.log(lib_js_1.ts() + "CONFIG: received error from " + URL);
            process.exit(36);
        });
        res.on('end', function () {
            console.log("CONFIG data from EXPRESS=" + data);
            var config = JSON.parse(data);
            console.log("CONFIG(): rc=" + config.rc + " isGenesisNode=" + config.isGenesisNode);
            console.log("CONFIG(): rc=" + config.rc + " isGenesisNode=" + config.isGenesisNode);
            console.log("CONFIG(): rc=" + config.rc + " isGenesisNode=" + config.isGenesisNode);
            console.log("CONFIG(): rc=" + config.rc + " isGenesisNode=" + config.isGenesisNode);
            console.log("CONFIG(): rc=" + config.rc + " isGenesisNode=" + config.isGenesisNode);
            //gME=json;  //set my global variable  for convenience
            console.log("CONFIG from node factory:" + JSON.stringify(config, null, 2));
            console.log("COMFIG: --------- " + GEO + " --------- configuration");
            //console.log("CONFIG(): json="+dump(config));
            //console.log("setting gSRlist="+dump(config.gSRlist));
            if (config.isGenesisNode == true) {
                console.log(lib_js_1.ts() + "CONFIG GENESIS node already configured");
                //dumpState();
            }
            else {
                console.log(lib_js_1.ts() + "CONFIG Configuring non-genesis node ... config.isGenesisNode=" + config.isGenesisNode);
                redisClient.hmset("gSRlist", config.gSRlist);
                //install config
                for (var mint in config.mintTable) {
                    var mintEntry = config.mintTable[mint];
                    console.log("add mint:" + mint + " mintEntry=" + lib_js_1.dump(mintEntry));
                    redisClient.hmset(mint, mintEntry);
                }
                for (var pulse in config.pulses) {
                    var pulseEntry = config.pulses[pulse];
                    console.log("add pulse:" + pulse + " pulseEntry=" + lib_js_1.dump(pulseEntry));
                    redisClient.hmset(pulse, pulseEntry);
                    redisClient.publish("members", "ADDED " + pulseEntry.geo);
                }
                //    console.log("genesis done "+json.newSegmentEntry.geo+  ":"+json.newSegmentEntry.group ,   json.newSegmentEntry );
                //    redisClient.hmset( json.newSegmentEntry.geo+  ":"+json.newSegmentEntry.group ,   json.newSegmentEntry );    
                console.log("new node config done");
            }
        });
    });
}
