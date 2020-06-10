

    FROM frolvlad/alpine-oraclejre8
    ARG JAR_FILE_NAME
    ADD ${JAR_FILE_NAME} app.jar
    
    CMD java -jar /app.jar

- docker image build -t docker-demo . --build-arg JAR_FILE_NAME=webin-cli-3.0.0.jar
- docker run docker-demo


------------------------------


    FROM frolvlad/alpine-oraclejre8
    ARG JAR_FILE_NAME
    ADD ${JAR_FILE_NAME} app.jar
    
    #CMD java -jar /app.jar


- docker image build -t docker-demo . --build-arg JAR_FILE_NAME=webin-cli-3.0.0.jar
- docker container run docker-demo:latest java -jar /app.jar
- docker container run docker-demo:latest ls -l
