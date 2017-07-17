# CloudBoi

## About
Host a gameboy emulator "in the cloud". Currently a work in progress.
Provides a front end to: https://www.github.com/tomis007/gameboi

### Status
This "works", but is fairly buggy. It is being updated as I have time.
Don't use deploy.sh, it won't work. This only supports gameboy roms.


#### Installation
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
3.5 You should have the following subfolders in ~/.GBoi:
```
roms <- contains roms to play, ENDING WITH .gb
saves <- currently empty, where saves are stored
```
4. Start tomcat, and navigate to YOUR_IP:8080/CloudBoi
5. Start CloudBoi: First select a user, then load a rom


##### Notes
Currently only .gb (gameboy NOT gameboy color) roms are supported,
and only some of those work (most do). Saving is buggy, the GUI on
the web app is glitchy. These will get updated eventually. There is
currently a chance the web app might just crash if an untested rom
is loaded or something weird happens. Just restart the server, 
this will also get fixed eventually.



