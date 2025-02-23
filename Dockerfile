FROM ubuntu:latest

RUN apt update && apt install -y curl git build-essential libssl-dev libreadline-dev zlib1g-dev ruby-full vim 
RUN gem install jekyll bundler
RUN echo "echo 'set your proxy and clone the repository `https://github.com/hust-open-atom-club/OpenAtomClub.git` or `https://github.com/<your-name>/OpenAtomClub.git` '">> ~/.bashrc

WORKDIR /workspace

EXPOSE 4000
CMD ["bash"]
