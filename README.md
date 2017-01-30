# Valet
Retrieve a list of your Spotify playlists and cast their music videos (from YouTube) to your chromecast enabled devices.

## Why?
Have you ever wanted to have passive entertainment while hosting a small get-together? Have you neglected to search for your favorite songs on YouTube to see if music videos are available? Are you bored? Valet attempts to solve these first world problems with a responsive, javascript-enabled, webapp!

## Usage
The code for Valet exists on GitHub to maybe show people how to use APIs from popular media services by combining the powers of modern JavaScript and HTML/CSS. It also exists here because it makes it easy to keep track of my work.

If you want to install Valet and try it yourself, or if you want to spin up a dev environment to contribute;

* Install some flavor of UNIX (Seriously, you'll be doing yourself a favor).
* Install the latest version of Node, including NPM of course (You can use homebrew to accomplish this on OSX/MacOS).
* Clone this repo into a directory, navigate to it in your favorite terminal, run `node install` in the root directory
* Edit `apiAuthentication.json` and fill out the empty variables that hold API keys for the various APIs used by Valet
* Run `node server.js` to start the server on the url denoted in `server.js`

__Note__
If you change the `apiAuthentication.json` file, consider running the following command,

`git update-index --skip-worktree apiAuthentication.json`

If you do not, git will want to commit changes to this file and you do not want that to happen.



If you've got any questions or want to collaborate, feel free to contact me; @cephalization on twitter.
