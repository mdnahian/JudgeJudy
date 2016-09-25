#!/bin/sh
eval var="$1"
curl -s --header "Ocp-Apim-Subscription-Key: 3ef09bb5dc9a4b8b8ca2648e4b72ae45" https://api.cognitive.microsoft.com/bing/v5.0/search?q=${var}
