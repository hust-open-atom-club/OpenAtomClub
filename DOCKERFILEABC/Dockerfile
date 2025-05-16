    FROM ruby:alpine
    WORKDIR /usr/src/app
    RUN gem install jekyll bundler
    COPY . .
    RUN bundle install
    CMD [ "jekyll","serve", "--host=0.0.0.0", "--port=4000" ]           
