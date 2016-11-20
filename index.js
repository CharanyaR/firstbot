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
var bot = new builder.BotConnectorBot({
    appId: '5f4da2a9-e58c-4711-b8ad-f2eb72bb91bd',
    appPassword: 'zOXoL6JsdN6Khkc28b9QqXL'
});

var dialog = new builder.LuisDialog('https://api.projectoxford.ai/luis/v2.0/apps/7c8788eb-1e3f-46d9-9283-fc24f3f164c9?subscription-key=6a64dd5e73844bafaa710bd1773a3b37&verbose=true&q=');

bot.add('/',dialog);

dialog.on('GetRecipe', [
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

dialog.onDefault(builder.DialogAction.send("I don't understand."));


server.post('/api/messages',bot.verifyBotFramework(),bot.listen());