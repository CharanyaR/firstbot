var restify = require('restify');

var food2ForkClient = restify.createJsonClient({ url: 'http://food2fork.com' });

function getRecipe(ingredients, callback) {
    
    food2ForkClient.get(`/api/search?key=3d7cfbafb1d7fa66f4901bcb442d171e&q=`+ingredients, (err, req, res, obj) => {
        console.log(obj);
       
        var results = obj.recipes;
        if (results) {
            callback(`It is ${results}`);
        } else {
            callback("Couldn't retrieve recipe.");
        }
    })
}

module.exports = {
    getRecipe: getRecipe
};