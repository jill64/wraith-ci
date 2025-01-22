FROM public.ecr.aws/lambda/nodejs:latest

RUN apt-get update && \
  apt-get install -y git && \
  apt-get clean

COPY server.js ./

CMD [ "server.handler" ]
