FROM ruby:3.4-slim
WORKDIR /usr/src/app
RUN apt-get update && apt-get install -y build-essential
RUN gem install jekyll bundler
COPY . .
RUN jekyll build
EXPOSE 4000
CMD ["jekyll", "serve", "--host=0.0.0.0"]  
# 新的实现, 但是测试有点小问题