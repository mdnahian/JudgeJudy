var RtmClient = require('@slack/client').RtmClient;
var request = require('request');
// var exec = require('child_process').exec;
var execSync = require('child_process').execSync;
var obj1;
var obj2;
// var token = process.env.SLACK_API_TOKEN || '';
var token = 'xoxb-83661251794-P3FOoq0Bb6HzYSCfK74tcvcj';
var curChannel = '';
var rtm = new RtmClient(token);
rtm.start();


var CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;

rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, function(rtmStartData) {
    console.log('testing the rtm connection...');
    // console.log(`Logged in as ${rtmStartData.self.name} of team ${rtmStartData.team.name}, but not yet connected to a channel`);
});

var RTM_EVENTS = require('@slack/client').RTM_EVENTS;
// var sys = require('sys');
var child;

rtm.on(RTM_EVENTS.MESSAGE, function(message) {
    curChannel = message.channel;
    console.log(message);
    // sendtoRMQ(message);
    // console.log(message);
    try {
        var msg = message.text.toUpperCase();
        var out = cmdexec(msg, "isBadWord").toString();
        // console.log(out);
        if (out.trim() == "True") {
            request('http://api.giphy.com/v1/gifs/search?q=funny+cat&api_key=dc6zaTOxFJmzC',
                function(error, response, body) {
                    var data = JSON.parse(body);
                    // console.log(data);
                    var max = data.data.length;
                    var min = 0;
                    var randomNumber = Math.floor(Math.random() * (max - min)) + min;
                    gifUrl = data.data[randomNumber].images.downsized.url;
                    // console.log(gifUrl);
                    rtm.sendMessage(gifUrl, curChannel.toString());
                });
        }

        var out_analyze = cmdexec(msg, "analyze").toString();
        // out = out.substring(0, out.length-2);
        console.log(out_analyze);
        var data = JSON.parse(out_analyze);
        // var name1 = data.entities[0].name;
        var type1 = data.entities[0].type;
        var user = message.user;
        var name1 = data.entities[0].name;
        console.log(name1);
        console.log(type1);
        console.log(user);

        if(type1 == "ORGANIZATION" || type1 == "PERSON" || type1 == "CONSUMER_GOOD"){
            console.log("Org or PERSON");
            console.log(type1);
            if (typeof obj1 === 'undefined' || obj1 === null) {
                console.log("Not Initilized");
                obj1 = new nameobj(name1,type1,user);
            }else {
                if(user !== obj1.user && type1 === obj1.type){
                    console.log("Perfect");
                    var nameold= obj1.name.replace(" ","+");
                    var namenew= name1.replace(" ","+");

                    var keyword = "debate+org+"+nameold+"+"+namenew;
                    scriptexec(keyword);
                    obj1 = null;
                }
            }
        }

        // rtm.sendMessage("Debug " + " " +name1 + " " + type1 + " " + user, curChannel.toString());
    } catch (e) {

    } finally {

    }

    // var type2 = data.entities[0].name;

});

function cmdexec(message, type) {
    // child = exec("python app.py "+ type + " " + message , function (error, stdout, stderr) {
    //   // console.log(stdout);
    //   // sys.print('stdout: ' + stdout);
    //   // sys.print('stderr: ' + stderr);
    //   if (error !== null) {
    //     console.log('exec error: ' + error);
    //   }
    //   return child;
    // });
    var str = "python app.py " + type + " \"" + message + "\"";
    // console.log(str);
    return execSync(str);
}

function scriptexec(keyword){
    var str = "./bing.sh " + keyword;
    console.log(keyword);
    try {
        console.log("Executed now parsing json");
        var tmp = execSync(str).toString();
        // console.log(tmp);
        var data = JSON.parse(tmp);
        // console.log(data);
        // var max = data.length;
        // var min = 0;
        // var randomNumber = Math.floor(Math.random() * (max - min)) + min;
        // var index = 1;
        var url1 = data.webPages.value;
        // console.log(url1.length);
        for (var i = 0; i < url1.length; i++) {
            var durl = url1[i].displayUrl;
            var srcfr = "www.debate.org/opinion";
            var srcfr1 = "www.debate.org/debates";

            // console.log(durl.indexOf(srcfr));
            if(durl.indexOf(srcfr) !== -1 || durl.indexOf(srcfr1) !== -1){
                urlws = durl.replace("https","http");
                substr1 = "http://";
                if(urlws.indexOf(substr1) == -1){
                    urlws = substr1 + urlws;
                }
                console.log(urlws);
                var result = opinionator(urlws);
                rtm.sendMessage(result, curChannel.toString());
                return;
            }
        }
    } catch (e) {
        console.log(e);
    }
}

function nameobj(name, type, user) {
    this.name = name;
    this.type = type;
    this.user = user;
}

function opinionator(urls1) {
    var str = "python scrapper.py "+urls1;
    console.log(str);
    try {
        var tmp = execSync(str).toString();
        console.log(tmp);
        return tmp;
    } catch (e) {
        console.log(e);
    }
}
// function sendtoRMQ(message){
//   var amqp = require('amqplib/callback_api');
//   amqp.connect('amqp://localhost', function(err, conn) {
//     conn.createChannel(function(err, ch) {
//       var q = 'q1';
//       var msg = message.text;
//       ch.assertQueue(q, {durable: false});
//       // Note: on Node 6 Buffer.from(msg) should be used
//       ch.sendToQueue(q, new Buffer(msg));
//       console.log(" [x] Sent %s", msg);
//     });
//     // setTimeout(function() {
//     //   conn.close();
//     //   process.exit(0);
//     // }, 500);
//   });
// }

// var RTM_CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS.RTM;
//
// rtm.on(RTM_CLIENT_EVENTS.RTM_CONNECTION_OPENED, function () {
//   // This will send the message 'this is a test message' to the channel identified by id 'C0CHZA86Q'
//   console.log(curChannel);
//   rtm.sendMessage('this is a message', curChannel.toString(), function messageSent() {
//     // optionally, you can supply a callback to execute once the message has been sent
//   });
// });


// if(out.toString() == "True"){
//   console.log("Please");

// }
