require('dotenv').config();
var http = require('http');
var qs = require('querystring');

if (!process.env.SLACK_TOKEN) {
    console.log('Error: Specify token in environment');
    process.exit(1);
}

var Botkit = require('botkit/lib/Botkit.js');
var os = require('os');

var controller = Botkit.slackbot({
    debug: true,
});

var bot = controller.spawn({
    token: process.env.SLACK_TOKEN
}).startRTM();


controller.hears(['(.*)'], 'direct_message,direct_mention,mention', function(bot, message) {
    var query = message.match[1];
    console.log(query);
    var options = questionRequest(query);
    http.get(options, function(response) {
        var body = ''; // Will contain the final response
        response.on('data', function(data){ body += data; });
        response.on('end', function() {
            console.log(body);
            var hermes_answer = JSON.parse(body);
            bot.reply(message, hermes_answer.respuesta);
    });
  }).on('error', function(e) {
    console.log("Got error while consulting hermes: " + e.message);
  });
});

function formatUptime(uptime) {

    var unit = 'second';
    if (uptime > 60) {
        uptime = uptime / 60;
        unit = 'minute';
    }
    if (uptime > 60) {
        uptime = uptime / 60;
        unit = 'hour';
    }
    if (uptime != 1) {
        unit = unit + 's';
    }

    uptime = uptime + ' ' + unit;
    return uptime;
}

/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
Demo Request
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
function questionRequest(question) {
  var key = process.env.KEY;
  var path = process.env.HERMES_API_PATH + '?key=' + key + '&q=' + qs.escape(question);
  var options = {
    host: process.env.HERMES_HOST,
    port: '80',
    path: path,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'access_token' : 'undefined'
    }
  };
  return options;
}
