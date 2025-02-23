FROM ruby:3.2

WORKDIR /app

# RUN apk add --no-cache bash build-base git 



COPY . .
# NOTE: you need to set a proxy to run this command
# RUN bundle install --path=~/vendor/bundler



EXPOSE 4000
CMD bash/bin
