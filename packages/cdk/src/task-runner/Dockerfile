FROM public.ecr.aws/lambda/nodejs:latest

RUN docker run --rm -it node:latest cat /etc/os-release

RUN apt-get update && \
  apt-get install -y git && \
  apt-get clean

COPY server.js ./

CMD [ "server.handler" ]
