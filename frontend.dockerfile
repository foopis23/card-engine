FROM oven/bun

RUN apt-get update
RUN apt-get -y install nginx
RUN nginx -v

COPY ./startup.sh /startup.sh

WORKDIR /app
COPY package.json ./
COPY bun.lock ./
COPY . ./
RUN bun install

EXPOSE 80

CMD ["/startup.sh"]