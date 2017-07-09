#!/usr/bin/env bash


# quit on mvn failure, TODO better way to handle?
set -e # script exits on any command failure
# Reset in case getopts has been used
OPTIND=1
maven=false

function show_help() {
        echo "Usage: ./deploy.sh -{h?m}"
        echo "       -h, -?   show this message"
        echo "       -m       clean,compile,package the maven project"
        echo "                before deploying to tomcat"
}

while getopts "mh?" opt; do
        case $opt in
        h|\?)
                show_help
                exit 0
                ;;
        m)
                maven=true
                ;;
        esac
done

# check for pom
if [ ! -f $(pwd)/pom.xml ]; then
        echo "No pom.xml found"
        exit 1
fi

# mvn clean, compile, package TODO? All necessary?
if [ "$maven" == true ]; then
        mvn clean
        mvn compile
        mvn package
fi

# Check for CATALINA_HOME
if [ ! -z "${CATALINA_HOME:?Need to set CATALINA_HOME}" ]; then
        echo "INFO: Starting deploy to tomcat"
fi

# copy war to tomcat, clean up old files
if [ -f $(pwd)/target/CloudBoi.war ]; then
        # delete files at tomcat home
        if [ -f $CATALINA_HOME/webapps/CloudBoi.war ]; then
                rm $CATALINA_HOME/webapps/CloudBoi.war
        fi
        if [ -d $CATALINA_HOME/webapps/CloudBoi ]; then
                rm -r $CATALINA_HOME/webapps/CloudBoi
        fi
        # copy war
        cp $(pwd)/target/CloudBoi.war $CATALINA_HOME/webapps/
        echo "SUCCESS: Deployed war"
        exit 0
else
        # couldn't find war
        echo "ERROR: CloudBoi.war not found, could not deploy"
        exit 1
fi
