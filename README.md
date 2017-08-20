# CloudBoi

## About
Host a gameboy emulator "in the cloud". Currently a work in progress.
Provides a front end to: https://www.github.com/tomis007/gameboi

### Status
This "works", but is fairly buggy. It is being updated as I have time.
Don't use deploy.sh, it won't work. This supports gameboy and gameboy color roms. The color games are pretty buggy right now. This has been tested on a raspberry pi 3 running raspbian with java8.


#### Installation
1. Install tomcat and Java 8
2. Copy CloudBoi.war to $CATALINA_HOME/webapps/
3. Create home directory and import roms:
```
mkdir ~/.GBoi
cd ~/.GBoi
mkdir roms saves
cp {gameboy roms} roms/
vim users.txt # create a list of users (sample file in github repo)
```
3.5 You should have the following subfolders in ~/.GBoi:
```
~/.Gboi
 |-- roms <- contains roms to play, ENDING WITH .gb
     |-- *.gb files
 |--saves <- currently empty, where saves are stored
```
4. Start tomcat, and navigate to {localhost | YOUR_IP}:8080/CloudBoi
5. Start CloudBoi: First select a user, then load a rom


##### Notes
Currently .gb and .gbc roms are supported, and only some of the color 
roms work. Saving is buggy, the GUI on the web app is glitchy. These will 
get updated eventually. There is currently a chance the web app might 
just crash if an untested rom is loaded or something weird happens. Just 
restart the server, this will also get fixed eventually.



