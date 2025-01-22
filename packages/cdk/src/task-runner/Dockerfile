FROM public.ecr.aws/lambda/nodejs:latest

RUN dnf install -y git

RUN npm i -g pnpm

COPY server.js ./

CMD [ "server.handler" ]
