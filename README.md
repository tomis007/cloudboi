# CloudBoi

## About
Host a gameboy emulator "in the cloud". Currently a work in progress.
Provides a front end to: https://www.github.com/tomis007/gameboi

### Status
This "works", but is fairly buggy. It is being updated as I have time.


#### Installation
0. The deploy.sh script won't work, unless you download the gameboi src and install it as a local mvn package, so use the .war
1. Install tomcat 
2. Copy CloudBoi.war to $CATALINA_HOME/webapps/
3. Create home directory and import roms: 
```
mkdir ~/.GBoi
cd ~/.GBoi
mkdir roms saves
cp {gameboy roms} roms/
vim users.txt # create a list of users (sample file in github repo)
```
4. Start tomcat, and navigate to IP:8080/CloudBoi
5. Load your roms



##### Notes
Currently only .gb (gameboy NOT gameboy color) roms are supported,
and only some of those work (most do). Saving is buggy, the GUI on
the web app is glitchy. These will get updated eventually. There is
currently a chance the web app might just crash if an untested rom
is loaded or something weird happens. Just restart the server, 
this will also get fixed eventually.



