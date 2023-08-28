@echo off

docker build -t socket .

docker run -p 8080:8080 socket
