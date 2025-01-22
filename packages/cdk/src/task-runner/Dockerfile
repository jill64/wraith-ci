FROM public.ecr.aws/lambda/nodejs:latest@sha256:9242d48c5a9fb0310ef7c0909d20ec3d0c0ede294758a0ae847a0cca7516e48a

RUN yum update -y && \
  yum install -y git && \
  yum clean all

COPY server.js ./

CMD [ "server.handler" ]
