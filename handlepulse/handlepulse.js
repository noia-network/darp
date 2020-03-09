"use strict";
exports.__esModule = true;
//
//  handlePulse - receive incoming pulses and store in redis
//
var lib_js_1 = require("../lib/lib.js");
//
// listen for incoming pulses and convert into redis commands
//
var pulseRedis = require('redis');
var redisClient = pulseRedis.createClient(); //creates a new client
var dgram = require('dgram');
var server = dgram.createSocket('udp4');
server.on('listening', function () {
    var address = server.address();
    console.log('UDP Server listening on ' + address.address + ':' + address.port);
});
//
//  message format: 0,56,1583783486546,MAZORE:MAZORE.1,1>1=0,2>1=0
//
server.on('message', function (message, remote) {
    console.log(" received pulse from " + remote.address + ':' + remote.port + ' - ' + message);
    var ary = message.split(",");
    var incomingIP = remote.address;
    var pulseType = ary[0];
    var seqNum = ary[1]; //56
    var pulseTimestamp = ary[2]; //1583783486546
    var pulseLabel = ary[3]; //MAZORE:MAZORE.1     //MAZORE:MAZORE.1
    var pulseSource = ary[3].split(":")[0]; //MAZORE
    var pulseGroup = ary[3].split(":")[1]; //MAZORE.1
    var pulseGroupOwner = pulseGroup.split(".")[0]; //MAZORE
    var receiveTimestamp = lib_js_1.now();
    var OWL = receiveTimestamp - pulseTimestamp;
    var owls = ary[4];
    redisClient.exists(pulseLabel, function (err, reply) {
        if (reply === 1) {
            console.log('exists');
            //update stats
        }
        else { //create node
            redisClient.hmset(pulseLabel, {
                "geo": pulseSource,
                "group": pulseGroup,
                "pulseTimestamp": "" + pulseTimestamp,
                "lastSeq": "" + seqNum,
                "owl": "" + OWL,
                "ipaddr": incomingIP,
                "bootTime": "" + lib_js_1.now(),
                "pulseGroups": pulseGroup,
                "inOctets": "0",
                "outOctets": "0",
                "inMsgs": "0",
                "outMsgs": "0",
                "pktDrops": "0",
                "remoteState": owls //store literal owls
            });
        }
    });
    // for each mint table entry, if match - set this data
    for (var mint in owls) {
        console.log(lib_js_1.ts() + "owls=" + owls + " mint=" + mint + " owl=" + owls[mint]);
        /*  redisClient.hmgetall(pulseLabel, "mint:"+mint) {
            //"port" : ""+port,
              //"publickey" : publickey,
              //"mint" : ""+newMint,      //set by genesis node
              //genesis connection info
              //"genesisIP" : me.genesisIP,
              //"genesisPort" : me.genesisPort,
              //"genesisPublickey" : me.genesisPublickey||publickey,
              //"wallet" : wallet,
          });
        */
    }
});
redisClient.hgetall("me", function (err, me) {
    server.bind(me.port, me.ipaddr);
});
