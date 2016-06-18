var express = require('express');
var request = require('request');
var app = express();

app.set('port', (process.env.PORT || 5000));

app.get('/', function(req, res) {
    var pageFile = __dirname + '/views/pages/index.html';
    res.sendFile(pageFile);
});

var searchHistory = [];

app.get('/api/latest/imagesearch/', function(req,res){
    res.json(searchHistory);
});

app.get('/api/imagesearch/:keyword',function(req,res){
    var keyword = req.params.keyword;
    var offset = req.query.offset || 0;
    console.log(keyword, offset);

    var options = {
        url: 'https://bingapis.azure-api.net/api/v5/images/search?q='+keyword+'&count=10&offset='+offset+'&mkt=en-us&safeSearch=Off',
        json: 'true',
        headers: {
            'Ocp-Apim-Subscription-Key': '09d9b42570bc46e1b48cfff547838fed'
        }
    };

    function callback(error, response, body) {
        if (!error && response.statusCode == 200) {
            var ans = [];
            for(var i=0; i < body.value.length; i++){
                ans.push({
                    url: body.value[i].contentUrl,
                    snippet: body.value[i].name,
                    thumbnail: body.value[i].thumbnailUrl,
                    context: body.value[i].hostPageUrl
                });
            }

            searchHistory.unshift({
                term: keyword,
                when: new Date().toISOString()
            });

            res.json(ans);
        }else{
            console.log("[error]",error);
        }
    }

    request(options, callback);
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});


