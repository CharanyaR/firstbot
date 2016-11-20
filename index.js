var restify = require('restify');
var builder = require('botbuilder');
var logger = require('winston');
var food2forkClient = require('./food2forkclient');
//=========================================================
// Bot Setup
//=========================================================

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});
  
// Create chat bot
var bot = new builder.ChatConnector({
    appId: '5f4da2a9-e58c-4711-b8ad-f2eb72bb91bd',
    appPassword: 'zOXoL6JsdN6Khkc28b9QqXL'
});

var recognizer = new builder.LuisRecognizer('https://api.projectoxford.ai/luis/v2.0/apps/7c8788eb-1e3f-46d9-9283-fc24f3f164c9?subscription-key=6a64dd5e73844bafaa710bd1773a3b37&verbose=true&q=');
var intents = new builder.IntentDialog({ recognizers: [recognizer] });

bot.dialog('/', intents);

intents.matches('GetRecipe', [
    (session, args, next) => {
        var ingredientsEntity = builder.EntityRecognizer.findEntity(args.entities, 'Ingedients');
        if (ingredientsEntity) {
            logger.info("Ingredients entered:"+ingredientsEntity.entity);
            return next({ response: ingredientsEntity.entity });
        } else {
            builder.Prompts.text(session, 'What ingredients?');
        }
    },
    (session, results) => {
        food2forkClient.getRecipe(results.response, (responseString) => {
            session.send(responseString);
        });
    }
]);

intents.onBegin(function (session, args, next) {
    session.send("Hello!! What recipe are you looking for the day??");
    next();
});

intents.onDefault(builder.DialogAction.send("I don't understand."));


server.post('/api/messages',bot.verifyBotFramework(),bot.listen());