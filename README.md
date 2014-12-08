# TachyonTalk Submission
---

## Description

[![Koding Hackathon](https://raw.githubusercontent.com/koding/hackathon.submit/236924c5e10a06c1c2dea48bc7ace4d72873bba7/images/badge.png "Koding Hackathon")](https://koding.com/Hackathon)

I was contemplating whether I should do Theme 1, 3 or 5: 1 because I am concerned about the environment, 3 because literally no one reads the fine print, and it could be dangerous, and 5 because it seemed interesting.

I had always wanted to make a real-time chatting application. One of the new ways I heard about making it was using Node.js and Socket.IO to instantaneously send data from client to server to client. The last, and first time I made a chatting application was back in the 6th grade when I had made my first PHP website. I created an AJAX chat application that would have to refresh the chat every second to get the updated messages. That was just horrible. Now, thanks to Node.js and Socket.IO this problem is no more. You can create direct connections.

So I went with Theme 5, Challenges associated with real time communication and translation (Star Trek universal translator anyone?), to make the chatting application I always wanted to make.

However, if this was just an ordinary chatting application, how would it apply to the theme? That's why I included automatic translation to my chatting application for the Hackathon, known as, TachyonTalk.
It can translate to and from over 100 different languages in a private 1-on-1 chat room pretty accurately. It translates very quickly; there is very little delay to the users. This chatting application can make it possible for customer support, interviews, and more to be conducted in different languages.

Although time did not permit, there were plans to implement Speech Recognition and Text-to-Speech using the new [Web Speech API](https://dvcs.w3.org/hg/speech-api/raw-file/tip/speechapi.html)

## Screenshots

![TachyonTalk](https://raw.githubusercontent.com/AkshayKalose/TachyonTalk/master/images/home.png "TachyonTalk")
![TachyonTalk](https://raw.githubusercontent.com/AkshayKalose/TachyonTalk/master/images/start1.png "TachyonTalk")
![TachyonTalk](https://raw.githubusercontent.com/AkshayKalose/TachyonTalk/master/images/start2.png "TachyonTalk")
![TachyonTalk](https://raw.githubusercontent.com/AkshayKalose/TachyonTalk/master/images/chat1.png "TachyonTalk")
![TachyonTalk](https://raw.githubusercontent.com/AkshayKalose/TachyonTalk/master/images/chat2.png "TachyonTalk")

## APIs used
 - [MyMemory Translated](http://mymemory.translated.net/doc/spec.php)
 - [Gravatar](https://en.gravatar.com/site/implement/)

## Resources
 - http://tutorialzine.com/2014/03/nodejs-private-webchat/
 - [MomentJS](http://momentjs.com/)
 
## Node.js Libraries Used
 - ejs
 - express
 - gravatar
 - socket.io
