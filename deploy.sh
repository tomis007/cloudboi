#!/usr/bin/env bash

# quit on mvn failure, TODO better way to handle?
set -e # script exits on any command failure
# Reset in case getopts has been used
OPTIND=1
maven=false

function show_help() {
        echo "Usage: ./deploy.sh -{h?b}"
        echo "       -h, -?   show this message"
        echo "       -b       clean,compile,package the maven project"
        echo "                before deploying to tomcat"
}

while getopts "bh?" opt; do
        case $opt in
        h|\?)
                show_help
                exit 0
                ;;
        b)
                maven=true
                ;;
        esac
done

# maven pom
if [ ! -f $(pwd)/pom.xml ]; then
        echo "No pom.xml found"
        exit 1
fi

# TODO? All necessary?
if [ "$maven" == true ]; then
        mvn clean
        mvn compile
        mvn package
fi

# tomcat's CATALINA_HOME
if [ ! -z "${CATALINA_HOME:?Need to set CATALINA_HOME}" ]; then
        echo "INFO: Starting deploy to tomcat"
fi

# deploy to tomcat
if [ -f $(pwd)/target/CloudBoi.war ]; then
        # delete old files
        if [ -f $CATALINA_HOME/webapps/CloudBoi.war ]; then
                rm $CATALINA_HOME/webapps/CloudBoi.war
        fi
        if [ -d $CATALINA_HOME/webapps/CloudBoi ]; then
                rm -r $CATALINA_HOME/webapps/CloudBoi
        fi
        # deploy
        cp $(pwd)/target/CloudBoi.war $CATALINA_HOME/webapps/
        echo "SUCCESS: Deployed war to tomcat"
        exit 0
else
        echo "ERROR: CloudBoi.war not found, could not deploy"
        exit 1
fi
