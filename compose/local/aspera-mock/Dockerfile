FROM ubuntu:22.04

RUN useradd -m asperauser
USER asperauser

RUN apt-get update && apt-get install -y curl tar

RUN mkdir "aspera-install"
RUN cd "aspera-install" && curl -o "ibm-aspera-connect_4.2.15.870-HEAD_linux_x86_64.tar.gz" "https://d3gcli72yxqn2z.cloudfront.net/downloads/connect/latest/bin/ibm-aspera-connect_4.2.15.870-HEAD_linux_x86_64.tar.gz"
RUN cd "aspera-install" && tar xzf "ibm-aspera-connect_4.2.15.870-HEAD_linux_x86_64.tar.gz"
RUN cd "aspera-install" && ./ibm-aspera-connect_4.2.15.870-HEAD_linux_x86_64.sh


# Clone this repository.
#RUN git clone https://github.com/aertslab/install_aspera_connect

#RUN cd install_aspera_connect && ./install_aspera_connect.sh

#CMD ["~/.aspera/connect/bin/ascp"]
