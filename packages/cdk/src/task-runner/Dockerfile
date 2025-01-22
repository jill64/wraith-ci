FROM public.ecr.aws/lambda/nodejs:latest

RUN cat /etc/os-release

RUN dnf install -y git

COPY server.js ./

CMD [ "server.handler" ]
